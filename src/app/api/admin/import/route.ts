import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDB();

    // Check if fca_data/posts.json and fca_data/pages.json exist
    const postsPath = path.join(process.cwd(), 'fca_data', 'posts.json');
    const pagesPath = path.join(process.cwd(), 'fca_data', 'pages.json');

    let postsCount = 0;
    let pagesCount = 0;

    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
      for (const p of posts) {
        if (!p.slug) continue;
        const cleanContent = p.content || '';
        await db.query(`
          INSERT INTO posts (slug, title, excerpt, content, category, status, published_at)
          VALUES ($1, $2, $3, $4, $5, 'published', CURRENT_TIMESTAMP)
          ON CONFLICT (slug) DO NOTHING
        `, [
          p.slug,
          p.title || 'Untitled',
          p.excerpt?.replace(/<[^>]+>/g, '') || '',
          cleanContent,
          'FCA Academy News'
        ]);
        postsCount++;
      }
    }

    if (fs.existsSync(pagesPath)) {
      const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
      for (const p of pages.slice(0, 20)) {
        if (!p.slug) continue;
        await db.query(`
          INSERT INTO pages (slug, title, hero_heading, content_html, status)
          VALUES ($1, $2, $3, $4, 'published')
          ON CONFLICT (slug) DO NOTHING
        `, [
          p.slug,
          p.title || p.slug,
          p.title || p.slug,
          p.content || ''
        ]);
        pagesCount++;
      }
    }

    return NextResponse.json({ success: true, postsCount, pagesCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

