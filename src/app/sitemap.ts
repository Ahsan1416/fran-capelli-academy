import { MetadataRoute } from 'next';
import { getDB } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fca.edu.au';
  const db = await getDB();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // 1. Courses
    const coursesRes = await db.query('SELECT slug, updated_at FROM courses');
    coursesRes.rows.forEach(c => {
      routes.push({
        url: `${baseUrl}/courses/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    });

    // 2. Published Pages
    const pagesRes = await db.query("SELECT slug, updated_at FROM pages WHERE status = 'published'");
    pagesRes.rows.forEach(p => {
      routes.push({
        url: `${baseUrl}/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // 3. Published Blog Posts
    const postsRes = await db.query("SELECT slug, updated_at, published_at FROM posts WHERE status = 'published'");
    postsRes.rows.forEach(post => {
      routes.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });

    // 4. Published Local Areas
    const areasRes = await db.query("SELECT slug, updated_at, published_at FROM local_areas WHERE status = 'published'");
    areasRes.rows.forEach(area => {
      routes.push({
        url: `${baseUrl}/areas/${area.slug}`,
        lastModified: area.updated_at ? new Date(area.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    });
  } catch (e) {
    console.error('Error generating dynamic sitemap:', e);
  }

  return routes;
}

