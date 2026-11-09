import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { checkWpConnection, getWpPages, getWpPosts } from '@/lib/wordpress';
import { getDB } from '@/lib/db';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = await checkWpConnection();
  return NextResponse.json({
    status,
    url: process.env.WORDPRESS_URL || 'https://darkgray-llama-274719.hostingersite.com',
    user: process.env.WORDPRESS_USER || 'admin'
  });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await req.json();

    if (action === 'push_all') {
      const scriptPath = path.join(process.cwd(), 'scripts', 'push_to_wordpress.mjs');
      const { stdout, stderr } = await execPromise(`node "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        message: 'Successfully pushed all FCA content, courses, and pages to WordPress backend!',
        output: stdout
      });
    }

    if (action === 'pull_all') {
      const db = await getDB();
      const pages = await getWpPages();
      const posts = await getWpPosts(undefined, 50);

      let updatedPages = 0;
      let updatedPosts = 0;

      for (const p of pages) {
        if (!p.slug) continue;
        await db.query(`
          INSERT INTO pages (slug, title, hero_heading, content_html, status)
          VALUES ($1, $2, $3, $4, 'published')
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            hero_heading = EXCLUDED.hero_heading,
            content_html = EXCLUDED.content_html
        `, [p.slug, p.title, p.title, p.content]);
        updatedPages++;
      }

      for (const post of posts) {
        if (!post.slug) continue;
        await db.query(`
          INSERT INTO posts (slug, title, excerpt, content, category, status, published_at)
          VALUES ($1, $2, $3, $4, $5, 'published', CURRENT_TIMESTAMP)
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            excerpt = EXCLUDED.excerpt,
            content = EXCLUDED.content,
            category = EXCLUDED.category
        `, [post.slug, post.title, post.excerpt, post.content, post.category]);
        updatedPosts++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${updatedPages} pages and ${updatedPosts} posts from WordPress to PostgreSQL!`,
        updatedPages,
        updatedPosts
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('WordPress sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

