const WP_URL = process.env.WORDPRESS_URL || 'https://darkgray-llama-274719.hostingersite.com';
const WP_USER = process.env.WORDPRESS_USER || 'admin';
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'Ls99 Aowe mQZt Yg9D RAAW mcum';

const authHeader = 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

export interface WpPostItem {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  featured_image?: string;
  category?: string;
  raw?: any;
}

export interface WpPageItem {
  id: number;
  slug: string;
  title: string;
  content: string;
  date: string;
  featured_image?: string;
  raw?: any;
}

function extractFeaturedImage(item: any): string | undefined {
  if (item._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return item._embedded['wp:featuredmedia'][0].source_url;
  }
  return undefined;
}

function cleanTitle(titleStr?: string): string {
  if (!titleStr) return '';
  return titleStr
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

export async function fetchFromWp<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${endpoint}`, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      console.warn(`[WordPress] ${endpoint} returned status ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err: any) {
    console.error(`[WordPress Error] ${endpoint}:`, err.message);
    return null;
  }
}

const PAGE_ALIASES: Record<string, string[]> = {
  'about': ['about-us', 'about'],
  'about-us': ['about-us', 'about'],
  'contact': ['contact-us', 'contact'],
  'contact-us': ['contact-us', 'contact'],
  'home': ['home', 'homepage', 'front-page'],
  'homepage': ['home', 'homepage', 'front-page'],
  'victoria': ['victoria', 'fran-capelli-academy-vic', 'courses-vic', 'vic'],
  'vic': ['victoria', 'fran-capelli-academy-vic', 'courses-vic', 'vic'],
  'courses-vic': ['courses-vic', 'victoria', 'fran-capelli-academy-vic'],
  'fran-capelli-academy-vic': ['victoria', 'fran-capelli-academy-vic', 'courses-vic', 'vic'],
  'south-australia': ['south-australia', 'south-australia-funding', 'sa'],
  'sa': ['south-australia', 'south-australia-funding', 'sa'],
  'south-australia-funding': ['south-australia-funding', 'south-australia', 'sa'],
  'act': ['act', 'fran-capelli-academy-australiacapitalterritory', 'canberra', 'courses-act'],
  'canberra': ['act', 'canberra', 'courses-act', 'fran-capelli-academy-australiacapitalterritory'],
  'courses-act': ['courses-act', 'act', 'canberra', 'fran-capelli-academy-australiacapitalterritory'],
  'fran-capelli-academy-australiacapitalterritory': ['act', 'fran-capelli-academy-australiacapitalterritory', 'canberra'],
  'western-australia': ['western-australia', 'fran-capelli-academy-wa', 'wa', 'perth'],
  'wa': ['western-australia', 'fran-capelli-academy-wa', 'wa', 'perth'],
  'perth': ['western-australia', 'perth', 'fran-capelli-academy-wa', 'wa'],
  'fran-capelli-academy-wa': ['western-australia', 'fran-capelli-academy-wa', 'wa', 'perth']
};

/**
 * Fetch a single post by slug from WordPress (checks posts first, then pages)
 */
export async function getWpPostBySlug(slug: string): Promise<WpPostItem | null> {
  const slugsToTry = PAGE_ALIASES[slug] || [slug];

  for (const s of slugsToTry) {
    const posts = await fetchFromWp<any[]>(`posts?slug=${encodeURIComponent(s)}&_embed`);
    if (posts && posts.length > 0) {
      const p = posts[0];
      return {
        id: p.id,
        slug: p.slug,
        title: cleanTitle(p.title?.rendered),
        content: p.content?.rendered || '',
        excerpt: (p.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim(),
        date: p.date,
        featured_image: extractFeaturedImage(p),
        category: p._embedded?.['wp:term']?.[0]?.[0]?.name || 'FCA News',
        raw: p
      };
    }
  }

  // Fallback: Check if it was created under pages in WordPress
  for (const s of slugsToTry) {
    const pages = await fetchFromWp<any[]>(`pages?slug=${encodeURIComponent(s)}&_embed`);
    if (pages && pages.length > 0) {
      const p = pages[0];
      return {
        id: p.id,
        slug: p.slug,
        title: cleanTitle(p.title?.rendered),
        content: p.content?.rendered || '',
        excerpt: (p.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim(),
        date: p.date,
        featured_image: extractFeaturedImage(p),
        category: 'Page',
        raw: p
      };
    }
  }

  return null;
}

/**
 * Fetch posts from WordPress (e.g. for /blog)
 */
export async function getWpPosts(categorySlug?: string, limit = 20): Promise<WpPostItem[]> {
  let endpoint = `posts?_embed&per_page=${limit}`;

  if (categorySlug) {
    const categories = await fetchFromWp<any[]>(`categories?slug=${encodeURIComponent(categorySlug)}`);
    if (categories && categories.length > 0) {
      endpoint += `&categories=${categories[0].id}`;
    }
  }

  const posts = await fetchFromWp<any[]>(endpoint);
  if (!posts || !Array.isArray(posts)) return [];

  return posts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: cleanTitle(p.title?.rendered),
    content: p.content?.rendered || '',
    excerpt: (p.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim(),
    date: p.date,
    featured_image: extractFeaturedImage(p),
    category: p._embedded?.['wp:term']?.[0]?.[0]?.name || 'FCA News',
    raw: p
  }));
}

/**
 * Fetch a page by slug from WordPress (checks pages first, then posts)
 */
export async function getWpPageBySlug(slug: string): Promise<WpPageItem | null> {
  const slugsToTry = PAGE_ALIASES[slug] || [slug];

  for (const s of slugsToTry) {
    const pages = await fetchFromWp<any[]>(`pages?slug=${encodeURIComponent(s)}&_embed`);
    if (pages && pages.length > 0) {
      const p = pages[0];
      return {
        id: p.id,
        slug: p.slug,
        title: cleanTitle(p.title?.rendered),
        content: p.content?.rendered || '',
        date: p.date,
        featured_image: extractFeaturedImage(p),
        raw: p
      };
    }
  }

  // Fallback: Check if it was created under posts in WordPress
  for (const s of slugsToTry) {
    const posts = await fetchFromWp<any[]>(`posts?slug=${encodeURIComponent(s)}&_embed`);
    if (posts && posts.length > 0) {
      const p = posts[0];
      return {
        id: p.id,
        slug: p.slug,
        title: cleanTitle(p.title?.rendered),
        content: p.content?.rendered || '',
        date: p.date,
        featured_image: extractFeaturedImage(p),
        raw: p
      };
    }
  }

  return null;
}

/**
 * Fetch all pages from WordPress
 */
export async function getWpPages(): Promise<WpPageItem[]> {
  const pages = await fetchFromWp<any[]>(`pages?_embed&per_page=100`);
  if (!pages || !Array.isArray(pages)) return [];

  return pages.map(p => ({
    id: p.id,
    slug: p.slug,
    title: cleanTitle(p.title?.rendered),
    content: p.content?.rendered || '',
    date: p.date,
    featured_image: extractFeaturedImage(p),
    raw: p
  }));
}

/**
 * Check if WordPress connection is alive
 */
export async function checkWpConnection(): Promise<{ ok: boolean; message: string; user?: string }> {
  try {
    const user = await fetchFromWp<any>('users/me');
    if (user && user.id) {
      return { ok: true, message: 'Connected to WordPress REST API', user: user.name || user.slug };
    }
    return { ok: false, message: 'Could not authenticate with WordPress' };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

/**
 * Parse structured course fields from WordPress content
 */
export function parseCourseFromWpHtml(html: string, baseCourse: any): any {
  if (!html) return baseCourse;
  const course = { ...baseCourse };

  // Subsidised Fee
  const subFeeMatch = html.match(/<strong>Subsidised Fee:?<\/strong>\s*([^<]+)/i);
  if (subFeeMatch) {
    const wpFee = subFeeMatch[1].trim();
    if (wpFee !== '$446 *Government Subsidised Fee' || !baseCourse.subsidised_fee) {
      course.subsidised_fee = wpFee;
    }
  }

  // Standard Fee
  const stdFeeMatch = html.match(/<strong>Standard Fee:?<\/strong>\s*([^<]+)/i);
  if (stdFeeMatch) course.standard_fee = stdFeeMatch[1].trim();

  // Duration
  const durMatch = html.match(/<strong>Duration:?<\/strong>\s*([^<]+)/i);
  if (durMatch) course.duration = durMatch[1].trim();

  // Delivery Mode
  const delMatch = html.match(/<strong>Delivery Mode:?<\/strong>\s*([^<]+)/i);
  if (delMatch) course.delivery_mode = delMatch[1].trim();

  // Prerequisites
  const preMatch = html.match(/<strong>Prerequisite:?<\/strong>\s*([^<]+)/i);
  if (preMatch) course.prerequisite = preMatch[1].trim();

  // Funding Notes
  const fundMatch = html.match(/<strong>Government Funding Notes:?<\/strong>\s*([^<]+)/i);
  if (fundMatch) course.funding_notes = fundMatch[1].trim();

  // Overview
  const overviewMatch = html.match(/<h3>Course Overview<\/h3>\s*<p>([\s\S]*?)<\/p>/i);
  if (overviewMatch) course.overview = overviewMatch[1].replace(/<[^>]+>/g, '').trim();

  // Career Outcomes (from list under Career Pathways)
  const outcomesMatch = html.match(/<h3>Career Pathways[^<]*<\/h3>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (outcomesMatch) {
    const items = outcomesMatch[1].match(/<li>([\s\S]*?)<\/li>/gi);
    if (items && items.length > 0) {
      course.career_outcomes = JSON.stringify(items.map(i => i.replace(/<[^>]+>/g, '').trim()));
    }
  }

  return course;
}

/**
 * Parse structured homepage fields from WordPress content
 */
export function parseHomepageFromWpHtml(html: string, baseHome: any): { heroTitle?: string; heroSubtitle?: string; faqs?: Array<{ question: string; answer: string }> } {
  if (!html) return {};
  const res: { heroTitle?: string; heroSubtitle?: string; faqs?: Array<{ question: string; answer: string }> } = {};

  // Extract h1 for Hero Title
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    res.heroTitle = cleanTitle(h1Match[1].replace(/<[^>]+>/g, '').trim());
  }

  // Extract lead paragraph for Hero Subtitle
  const pLeadMatch = html.match(/<p[^>]*class=["'][^"']*lead[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) || html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (pLeadMatch) {
    res.heroSubtitle = pLeadMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // Extract FAQs
  const faqSectionMatch = html.match(/<h2>Frequently Asked Questions<\/h2>([\s\S]*)/i);
  if (faqSectionMatch) {
    const faqHtml = faqSectionMatch[1];
    const qMatches = [...faqHtml.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi)];
    if (qMatches.length > 0) {
      res.faqs = qMatches.map(m => ({
        question: m[1].replace(/<[^>]+>/g, '').trim(),
        answer: m[2].replace(/<[^>]+>/g, '').trim()
      }));
    }
  }

  return res;
}

