import fs from 'fs';
import path from 'path';

const WP_URL = process.env.WORDPRESS_URL || 'https://darkgray-llama-274719.hostingersite.com';
const WP_USER = process.env.WORDPRESS_USER || 'admin';
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'Ls99 Aowe mQZt Yg9D RAAW mcum';
const WP_AUTH = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${WP_AUTH}`
};

async function api(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/${endpoint}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP API ${endpoint} failed (${res.status}): ${text.substring(0, 300)}`);
  }
  return res.json();
}

async function findOrCreateCategory(name, slug) {
  const existing = await api(`categories?slug=${encodeURIComponent(slug)}`);
  if (existing && existing.length > 0) return existing[0].id;
  const created = await api('categories', 'POST', { name, slug });
  return created.id;
}

async function upsertPage(pageData) {
  const existing = await api(`pages?slug=${encodeURIComponent(pageData.slug)}`);
  if (existing && existing.length > 0) {
    const page = existing[0];
    console.log(`Updating existing page: ${pageData.slug} (ID: ${page.id})`);
    // If user edited title, preserve user's edited title!
    const finalTitle = page.title?.rendered?.includes('lun') ? page.title.rendered : pageData.title;
    return await api(`pages/${page.id}`, 'POST', {
      ...pageData,
      title: finalTitle
    });
  } else {
    console.log(`Creating new page: ${pageData.slug}`);
    return await api('pages', 'POST', pageData);
  }
}

async function upsertPost(postData) {
  const existing = await api(`posts?slug=${encodeURIComponent(postData.slug)}`);
  if (existing && existing.length > 0) {
    const post = existing[0];
    console.log(`Updating existing post: ${postData.slug} (ID: ${post.id})`);
    return await api(`posts/${post.id}`, 'POST', postData);
  } else {
    console.log(`Creating new post: ${postData.slug}`);
    return await api('posts', 'POST', postData);
  }
}

async function main() {
  console.log('=== PUSHING COMPLETE AUTHENTIC FCA CONTENT TO WORDPRESS BACKEND ===');
  console.log(`Target: ${WP_URL}\n`);

  const rawPages = JSON.parse(fs.readFileSync('fca_data/pages.json', 'utf8'));
  const rawPosts = JSON.parse(fs.readFileSync('fca_data/posts.json', 'utf8'));

  // Setup Categories
  const catBlogId = await findOrCreateCategory('Blog & Industry News', 'blog');
  const catCoursesId = await findOrCreateCategory('Courses & Qualifications', 'courses');
  const catBuildingId = await findOrCreateCategory('Building & Construction', 'building-construction');
  const catHairdressingId = await findOrCreateCategory('Hairdressing', 'hairdressing');
  const catBarberingId = await findOrCreateCategory('Barbering', 'barbering');
  const catChildcareId = await findOrCreateCategory('Early Childhood Education', 'early-childhood-education-care');
  const catCommunityId = await findOrCreateCategory('Community Services', 'community-services');
  const catAreasId = await findOrCreateCategory('Local Areas & Campuses', 'local-areas');

  // Key pages mapping from fca_data/pages.json
  const keyPageSlugs = [
    'about',
    'about-us',
    'contact',
    'contact-us',
    'fran-capelli-academy-vic',
    'south-australia-funding',
    'student-services',
    'how-to-become-a-licensed-builder-in-south-australia',
    'sa-building-work-contractor-licence-the-complete-guide',
    'free-sa-builder-licence-guide',
    'cpc40120-certificate-iv-in-building-and-construction',
    'cpc50220-diploma-of-building-and-construction-building',
    'shb30416-certificate-iii-in-hairdressing',
    'shb30416-certificate-iii-in-hairdressing-non-apprenticeship',
    'shb30416-certificate-iii-in-hairdressing-apprenticeship',
    'shb30516-certificate-iii-in-barbering-non-apprenticeship',
    'chc30125-certificate-iii-in-early-childhood-education-care',
    'chc52025-diploma-of-community-services-sa',
    'hairdressing',
    'barbering',
    'building-construction',
    'early-childhood-education-care',
    'community-services',
    'courses-vic',
    'building-construction-vic',
    'hairdressing-vic',
    'barbering-vic'
  ];

  console.log('\n--- 1. Pushing Rich Authentic Pages to WordPress ---');
  for (const slug of keyPageSlugs) {
    // Find matching source item in rawPages
    const src = rawPages.find(p => p.slug === slug || (slug === 'about-us' && p.slug === 'about') || (slug === 'contact-us' && p.slug === 'contact') || (slug === 'shb30416-certificate-iii-in-hairdressing' && p.slug.startsWith('shb30416')));
    if (!src || !src.content) continue;

    console.log(`Processing page: ${slug} (length: ${src.content.length})`);
    await upsertPage({
      slug,
      title: src.title || slug,
      content: src.content,
      status: 'publish'
    });
  }

  // Push Homepage (home) with complete sections
  console.log('\n--- 2. Pushing Rich Homepage to WordPress ---');
  const homepageContent = `
    <h2>Practical Industry Training Designed for Real Careers</h2>
    <p>Nationally recognised training in Hairdressing, Barbering, Building & Construction, Early Childhood Education, and Community Services across Melbourne, Adelaide, Canberra, and Perth.</p>
    
    <h3>Why Study With Fran Capelli Academy?</h3>
    <ul>
      <li><strong>Nationally Recognised Training (RTO # 6055):</strong> Qualifications accredited under the Australian Qualifications Framework (AQF).</li>
      <li><strong>Skills SA Government Subsidised Funding:</strong> Eligible South Australian students receive subsidised training starting from $0.50 per nominal hour.</li>
      <li><strong>Active Commercial Salons:</strong> Hands-on training on real paying clients in our Hawthorn and Mawson Lakes salons.</li>
      <li><strong>Flexible Evening Classes:</strong> Active tradespeople study virtual theory lectures in the evening without missing work on building sites.</li>
      <li><strong>Builder Licence Benchmarks:</strong> CPC40120 units map directly to CBS South Australia Building Work Contractor Licence educational requirements.</li>
    </ul>

    <h3>Accredited Qualification Pathways</h3>
    <ul>
      <li><strong>CPC40120 Certificate IV in Building and Construction:</strong> 36 Weeks duration, pathway to residential builder licence.</li>
      <li><strong>CPC50220 Diploma of Building and Construction (Building):</strong> Advanced commercial construction and project estimation.</li>
      <li><strong>SHB30416 Certificate III in Hairdressing:</strong> Comprehensive cutting, colouring, client styling, and salon operations.</li>
      <li><strong>SHB30516 Certificate III in Barbering (Non-Apprenticeship):</strong> Modern fades, traditional cut-throat shaving, and beard sculpts.</li>
      <li><strong>CHC30125 Certificate III in Early Childhood Education and Care:</strong> 53 Weeks including 160h accredited center practicum.</li>
      <li><strong>CHC52025 Diploma of Community Services:</strong> 14 Months case management and family advocacy training.</li>
    </ul>

    <h3>Physical Campuses & Training Hubs</h3>
    <ul>
      <li><strong>Melbourne (Hawthorn):</strong> 355 Burwood Road, Hawthorn VIC 3122 | Phone: 03 9818 0089</li>
      <li><strong>Melbourne (Coolaroo):</strong> G01, 1510 Pascoe Vale Road, Coolaroo VIC 3048</li>
      <li><strong>Adelaide (Mawson Lakes):</strong> 1-3 Metro Parade, Mawson Lakes SA 5095 | Phone: 08 7137 1433</li>
      <li><strong>Canberra City Hub:</strong> Level 5, 15 Moore Street, Canberra City ACT 2601</li>
      <li><strong>Perth & WA Delivery:</strong> Blended delivery hub across Western Australia</li>
    </ul>
  `;

  await upsertPage({
    slug: 'home',
    title: 'Homepage - Fran Capelli Academy',
    content: homepageContent,
    status: 'publish'
  });

  // Push Courses into Posts
  console.log('\n--- 3. Pushing Detailed Courses into WordPress Posts ---');
  const courseSlugs = [
    'cpc40120-certificate-iv-in-building-and-construction',
    'cpc50220-diploma-of-building-and-construction-building',
    'shb30416-certificate-iii-in-hairdressing',
    'shb30516-certificate-iii-in-barbering-non-apprenticeship',
    'chc30125-certificate-iii-in-early-childhood-education-care',
    'chc52025-diploma-of-community-services-sa'
  ];

  for (const cSlug of courseSlugs) {
    const src = rawPages.find(p => p.slug === cSlug || p.slug.startsWith(cSlug.slice(0, 8)));
    if (!src) continue;

    let catId = catCoursesId;
    if (cSlug.startsWith('cpc')) catId = catBuildingId;
    if (cSlug.startsWith('shb304')) catId = catHairdressingId;
    if (cSlug.startsWith('shb305')) catId = catBarberingId;
    if (cSlug.startsWith('chc301')) catId = catChildcareId;
    if (cSlug.startsWith('chc520')) catId = catCommunityId;

    console.log(`Pushing rich course post: ${cSlug} (length: ${src.content.length})`);
    await upsertPost({
      slug: cSlug,
      title: src.title || cSlug,
      categories: [catCoursesId, catId],
      content: src.content,
      status: 'publish'
    });
  }

  // Push all original FCA blog posts
  console.log('\n--- 4. Pushing Original FCA Blog Posts to WordPress ---');
  for (const post of rawPosts) {
    if (post.slug === 'hello-world') continue;
    console.log(`Pushing original post: ${post.slug}`);
    await upsertPost({
      slug: post.slug,
      title: post.title || post.slug,
      categories: [catBlogId],
      content: post.content || '',
      excerpt: (post.excerpt || '').replace(/<[^>]+>/g, '').trim(),
      status: 'publish'
    });
  }

  // Push Local Areas into WordPress Posts
  console.log('\n--- 5. Pushing Local Area Guides to WordPress ---');
  const localAreas = [
    {
      slug: 'hawthorn-vic',
      title: 'Hawthorn Campus - Melbourne VIC',
      content: `
        <h2>Hawthorn Campus - Commercial Student Salon & Lecture Suites</h2>
        <p><strong>Physical Campus:</strong> 355 Burwood Road, Hawthorn VIC 3122 (Adjacent to Glenferrie Station)</p>
        <p><strong>Facilities:</strong> Commercial student hairdressing & barbering salon open to the public, interactive theory suites, and master trainer support.</p>
        <p><strong>Available Qualifications:</strong> Certificate III in Hairdressing, Certificate III in Barbering, Certificate IV in Building and Construction.</p>
      `
    },
    {
      slug: 'coolaroo-vic',
      title: 'Coolaroo Campus - Melbourne VIC',
      content: `
        <h2>Coolaroo Campus - Northern Melbourne Training Facility</h2>
        <p><strong>Physical Campus:</strong> G01, 1510 Pascoe Vale Road, Coolaroo VIC 3048</p>
        <p><strong>Facilities:</strong> Hands-on trade assessment workshops and student consultation amenities.</p>
        <p><strong>Phone:</strong> 03 9818 0089 | <strong>Email:</strong> enquiries@fca.edu.au</p>
      `
    },
    {
      slug: 'mawson-lakes-sa',
      title: 'Mawson Lakes Campus - Adelaide SA',
      content: `
        <h2>Mawson Lakes Flagship Campus - Skills SA Subsidised Training</h2>
        <p><strong>Physical Campus:</strong> 1-3 Metro Parade, Mawson Lakes SA 5095</p>
        <p><strong>Skills SA Approved:</strong> Eligible South Australian residents access subsidised training from $0.50 per nominal hour.</p>
        <p><strong>Courses:</strong> Building & Construction (Licence pathway), Early Childhood Education & Care, Community Services, and Hairdressing.</p>
        <p><strong>Phone:</strong> 08 7137 1433 | <strong>Email:</strong> enquiries@fca.edu.au</p>
      `
    },
    {
      slug: 'canberra-act',
      title: 'Canberra Delivery Hub - ACT',
      content: `
        <h2>Canberra City Training Hub</h2>
        <p><strong>Hub Location:</strong> Level 5, 15 Moore Street, Canberra City ACT 2601</p>
        <p><strong>Delivery:</strong> Flexible virtual evening classrooms with structured ACT workplace practicals.</p>
        <p><strong>Phone:</strong> 03 9818 0089</p>
      `
    },
    {
      slug: 'geelong-vic',
      title: 'Geelong Regional Delivery Hub - VIC',
      content: `
        <h2>Geelong - Official Service Area</h2>
        <p><em>Notice: This is an accredited regional delivery area with blended virtual evening classes and arranged local Geelong salon practicals.</em></p>
        <p>Students in Geelong and the Bellarine Peninsula can study Barbering and Building qualifications without traveling daily to Melbourne.</p>
      `
    }
  ];

  for (const a of localAreas) {
    console.log(`Pushing local area: ${a.slug}`);
    await upsertPost({
      slug: a.slug,
      title: a.title,
      categories: [catAreasId],
      content: a.content,
      status: 'publish'
    });
  }

  console.log('\n=============================================================');
  console.log('   ALL AUTHENTIC FCA RICH CONTENT PUSHED TO WORDPRESS!       ');
  console.log('=============================================================');
}

main().catch(err => {
  console.error('Error pushing rich content:', err);
  process.exit(1);
});

