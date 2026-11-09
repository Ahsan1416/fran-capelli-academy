import { NextRequest, NextResponse } from 'next/server';
import { 
  saveHomepageDraftAction, 
  publishHomepageAction, 
  saveCourseDraftAction, 
  publishCourseAction, 
  saveBlogPostAction, 
  togglePostPublishAction,
  saveLocalAreaAction,
  toggleAreaPublishAction
} from '@/app/admin/actions';
import { getDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const db = await getDB();

    if (action === 'save_homepage_draft') {
      await db.query(`
        UPDATE homepage_config SET
          has_draft = TRUE,
          draft_hero_title = $1,
          draft_hero_image = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `, [payload.draft_hero_title, payload.draft_hero_image]);
      return NextResponse.json({ success: true });
    }

    if (action === 'publish_homepage') {
      await db.query(`
        UPDATE homepage_config SET
          hero_title = COALESCE(draft_hero_title, hero_title),
          hero_image = COALESCE(draft_hero_image, hero_image),
          has_draft = FALSE,
          draft_hero_title = NULL,
          draft_hero_image = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `);
      return NextResponse.json({ success: true });
    }

    if (action === 'save_course_draft') {
      await db.query(`
        UPDATE courses SET
          has_draft = TRUE,
          draft_data = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = $2
      `, [JSON.stringify(payload.draftData), payload.slug]);
      return NextResponse.json({ success: true });
    }

    if (action === 'publish_course') {
      await db.query(`
        UPDATE courses SET
          subsidised_fee = $1,
          has_draft = FALSE,
          draft_data = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = $2
      `, [payload.subsidised_fee, payload.slug]);
      return NextResponse.json({ success: true });
    }

    if (action === 'create_post') {
      await db.query('DELETE FROM posts WHERE slug = $1', [payload.slug]);
      const res = await db.query(`
        INSERT INTO posts (
          title, slug, excerpt, content, category,
          featured_image, image_alt_text, seo_title, meta_description,
          status, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        payload.title,
        payload.slug,
        payload.excerpt,
        payload.content,
        payload.category,
        payload.featured_image,
        payload.image_alt_text,
        payload.seo_title,
        payload.meta_description,
        payload.status,
        payload.status === 'published' ? new Date() : null
      ]);
      return NextResponse.json({ success: true, id: res.rows[0].id });
    }

    if (action === 'set_post_status') {
      await db.query(`
        UPDATE posts SET
          status = $1,
          published_at = CASE WHEN $1 = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = $2
      `, [payload.status, payload.slug]);
      return NextResponse.json({ success: true });
    }

    if (action === 'create_area') {
      await db.query('DELETE FROM local_areas WHERE slug = $1', [payload.slug]);
      const res = await db.query(`
        INSERT INTO local_areas (
          area_name, state, slug, intro, relevant_courses,
          is_real_campus, campus_name, campus_address, delivery_info,
          faqs, featured_image, image_alt_text, seo_title, meta_description,
          status, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        payload.area_name,
        payload.state,
        payload.slug,
        payload.intro,
        JSON.stringify(payload.relevant_courses || []),
        !!payload.is_real_campus,
        payload.campus_name || null,
        payload.campus_address || null,
        payload.delivery_info,
        JSON.stringify(payload.faqs || []),
        payload.featured_image,
        payload.image_alt_text,
        payload.seo_title,
        payload.meta_description,
        payload.status,
        payload.status === 'published' ? new Date() : null
      ]);
      return NextResponse.json({ success: true, id: res.rows[0].id });
    }

    if (action === 'set_area_status') {
      await db.query(`
        UPDATE local_areas SET
          status = $1,
          published_at = CASE WHEN $1 = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = $2
      `, [payload.status, payload.slug]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

