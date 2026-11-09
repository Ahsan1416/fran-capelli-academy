'use server';

import { redirect } from 'next/navigation';
import { getDB } from '@/lib/db';
import { hashPassword, createAdminSession, destroyAdminSession, getCurrentAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 1. Admin Authentication Actions
export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '/admin';

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const db = await getDB();
  const res = await db.query('SELECT * FROM admin_users WHERE email = $1 LIMIT 1', [email]);
  if (res.rows.length === 0) {
    return { error: 'Invalid credentials. Please verify your email and password.' };
  }

  const user = res.rows[0];
  const inputHash = hashPassword(password);

  if (inputHash !== user.password_hash) {
    return { error: 'Invalid password. Please try again.' };
  }

  await createAdminSession(user.email);
  redirect(next);
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect('/admin/login');
}

// 2. Homepage Draft & Publish Actions
export async function saveHomepageDraftAction(data: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  await db.query(`
    UPDATE homepage_config SET
      has_draft = TRUE,
      draft_hero_badge = $1,
      draft_hero_title = $2,
      draft_hero_subtitle = $3,
      draft_hero_image = $4,
      draft_hero_primary_btn_text = $5,
      draft_hero_primary_btn_link = $6,
      draft_hero_secondary_btn_text = $7,
      draft_hero_secondary_btn_link = $8,
      draft_featured_course_slugs = $9,
      draft_faqs = $10,
      draft_section_order = $11,
      draft_section_visibility = $12,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `, [
    data.hero_badge,
    data.hero_title,
    data.hero_subtitle,
    data.hero_image,
    data.hero_primary_btn_text,
    data.hero_primary_btn_link,
    data.hero_secondary_btn_text,
    data.hero_secondary_btn_link,
    JSON.stringify(data.featured_course_slugs || []),
    JSON.stringify(data.faqs || []),
    JSON.stringify(data.section_order || []),
    JSON.stringify(data.section_visibility || {})
  ]);

  revalidatePath('/');
  return { success: true };
}

export async function publishHomepageAction() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  const res = await db.query('SELECT * FROM homepage_config WHERE id = 1 LIMIT 1');
  if (res.rows.length === 0) return { error: 'Config not found' };
  const h = res.rows[0];

  // If draft fields exist, promote them to live!
  await db.query(`
    UPDATE homepage_config SET
      hero_badge = COALESCE(draft_hero_badge, hero_badge),
      hero_title = COALESCE(draft_hero_title, hero_title),
      hero_subtitle = COALESCE(draft_hero_subtitle, hero_subtitle),
      hero_image = COALESCE(draft_hero_image, hero_image),
      hero_primary_btn_text = COALESCE(draft_hero_primary_btn_text, hero_primary_btn_text),
      hero_primary_btn_link = COALESCE(draft_hero_primary_btn_link, hero_primary_btn_link),
      hero_secondary_btn_text = COALESCE(draft_hero_secondary_btn_text, hero_secondary_btn_text),
      hero_secondary_btn_link = COALESCE(draft_hero_secondary_btn_link, hero_secondary_btn_link),
      featured_course_slugs = COALESCE(draft_featured_course_slugs, featured_course_slugs),
      faqs = COALESCE(draft_faqs, faqs),
      section_order = COALESCE(draft_section_order, section_order),
      section_visibility = COALESCE(draft_section_visibility, section_visibility),
      has_draft = FALSE,
      draft_hero_badge = NULL,
      draft_hero_title = NULL,
      draft_hero_subtitle = NULL,
      draft_hero_image = NULL,
      draft_hero_primary_btn_text = NULL,
      draft_hero_primary_btn_link = NULL,
      draft_hero_secondary_btn_text = NULL,
      draft_hero_secondary_btn_link = NULL,
      draft_featured_course_slugs = NULL,
      draft_faqs = NULL,
      draft_section_order = NULL,
      draft_section_visibility = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `);

  revalidatePath('/');
  return { success: true };
}

// 3. Course Actions (Draft / Publish)
export async function saveCourseDraftAction(id: number, draftData: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  await db.query(`
    UPDATE courses SET
      has_draft = TRUE,
      draft_data = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [JSON.stringify(draftData), id]);

  const courseRes = await db.query('SELECT slug FROM courses WHERE id = $1', [id]);
  if (courseRes.rows.length > 0) {
    revalidatePath(`/courses/${courseRes.rows[0].slug}`);
  }
  revalidatePath('/courses');
  return { success: true };
}

export async function publishCourseAction(id: number, liveData?: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  const cRes = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
  if (cRes.rows.length === 0) return { error: 'Course not found' };

  let data = liveData;
  if (!data && cRes.rows[0].draft_data) {
    data = JSON.parse(cRes.rows[0].draft_data);
  }

  if (data) {
    await db.query(`
      UPDATE courses SET
        title = $1,
        code = $2,
        duration = $3,
        prerequisite = $4,
        units_count = $5,
        subsidised_fee = $6,
        standard_fee = $7,
        delivery_mode = $8,
        funding_notes = $9,
        overview = $10,
        featured_image = $11,
        faqs = $12,
        has_draft = FALSE,
        draft_data = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
    `, [
      data.title,
      data.code,
      data.duration,
      data.prerequisite,
      data.units_count,
      data.subsidised_fee,
      data.standard_fee,
      data.delivery_mode,
      data.funding_notes,
      data.overview,
      data.featured_image,
      JSON.stringify(data.faqs || []),
      id
    ]);
  } else {
    await db.query(`UPDATE courses SET has_draft = FALSE, draft_data = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
  }

  revalidatePath('/courses');
  revalidatePath(`/courses/${cRes.rows[0].slug}`);
  revalidatePath('/');
  return { success: true };
}

// 4. Page Actions (State & Static Pages)
export async function savePageDraftAction(id: number, draftData: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  await db.query(`
    UPDATE pages SET
      has_draft = TRUE,
      draft_data = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [JSON.stringify(draftData), id]);

  const pRes = await db.query('SELECT slug FROM pages WHERE id = $1', [id]);
  if (pRes.rows.length > 0) {
    revalidatePath(`/${pRes.rows[0].slug}`);
  }
  return { success: true };
}

export async function publishPageAction(id: number, liveData?: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  const pRes = await db.query('SELECT * FROM pages WHERE id = $1', [id]);
  if (pRes.rows.length === 0) return { error: 'Page not found' };

  let data = liveData;
  if (!data && pRes.rows[0].draft_data) {
    data = JSON.parse(pRes.rows[0].draft_data);
  }

  if (data) {
    await db.query(`
      UPDATE pages SET
        title = $1,
        hero_heading = $2,
        hero_subheading = $3,
        hero_image = $4,
        content_html = $5,
        campus_address = $6,
        phone = $7,
        email = $8,
        funding_info = $9,
        seo_title = $10,
        meta_description = $11,
        has_draft = FALSE,
        draft_data = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
    `, [
      data.title,
      data.hero_heading,
      data.hero_subheading,
      data.hero_image,
      data.content_html,
      data.campus_address,
      data.phone,
      data.email,
      data.funding_info,
      data.seo_title,
      data.meta_description,
      id
    ]);
  }

  revalidatePath(`/${pRes.rows[0].slug}`);
  revalidatePath('/');
  return { success: true };
}

// 5. Blog Post Actions (Create, Edit, Draft, Publish, Unpublish, Delete)
export async function saveBlogPostAction(id: number | null, data: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  const isPublishing = data.status === 'published';
  const publishedAt = isPublishing ? new Date() : null;

  if (id) {
    // Update existing post
    await db.query(`
      UPDATE posts SET
        title = $1,
        slug = $2,
        excerpt = $3,
        content = $4,
        category = $5,
        featured_image = $6,
        image_alt_text = $7,
        seo_title = $8,
        meta_description = $9,
        status = $10,
        published_at = CASE WHEN $10 = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
    `, [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.category,
      data.featured_image,
      data.image_alt_text,
      data.seo_title,
      data.meta_description,
      data.status || 'draft',
      id
    ]);
  } else {
    // Insert new post
    const res = await db.query(`
      INSERT INTO posts (
        title, slug, excerpt, content, category,
        featured_image, image_alt_text, seo_title, meta_description,
        status, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.category,
      data.featured_image,
      data.image_alt_text,
      data.seo_title,
      data.meta_description,
      data.status || 'draft',
      publishedAt
    ]);
    id = res.rows[0].id;
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath('/');
  return { success: true, id };
}

export async function togglePostPublishAction(id: number, currentStatus: string) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const db = await getDB();
  const res = await db.query(`
    UPDATE posts SET
      status = $1,
      published_at = CASE WHEN $1 = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING slug
  `, [newStatus, id]);

  if (res.rows.length > 0) {
    revalidatePath(`/blog/${res.rows[0].slug}`);
  }
  revalidatePath('/blog');
  revalidatePath('/');
  return { success: true, newStatus };
}

export async function deletePostAction(id: number) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  const res = await db.query('DELETE FROM posts WHERE id = $1 RETURNING slug', [id]);
  if (res.rows.length > 0) {
    revalidatePath(`/blog/${res.rows[0].slug}`);
  }
  revalidatePath('/blog');
  revalidatePath('/');
  return { success: true };
}

// 6. Local Area Page Actions (Create, Edit, Draft, Publish, Unpublish, Delete)
export async function saveLocalAreaAction(id: number | null, data: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  const isPublishing = data.status === 'published';
  const publishedAt = isPublishing ? new Date() : null;

  if (id) {
    await db.query(`
      UPDATE local_areas SET
        area_name = $1,
        state = $2,
        slug = $3,
        intro = $4,
        relevant_courses = $5,
        is_real_campus = $6,
        campus_name = $7,
        campus_address = $8,
        delivery_info = $9,
        faqs = $10,
        featured_image = $11,
        image_alt_text = $12,
        seo_title = $13,
        meta_description = $14,
        status = $15,
        published_at = CASE WHEN $15 = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
    `, [
      data.area_name,
      data.state,
      data.slug,
      data.intro,
      JSON.stringify(data.relevant_courses || []),
      !!data.is_real_campus,
      data.campus_name || null,
      data.campus_address || null,
      data.delivery_info,
      JSON.stringify(data.faqs || []),
      data.featured_image,
      data.image_alt_text,
      data.seo_title,
      data.meta_description,
      data.status || 'draft',
      id
    ]);
  } else {
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
      data.area_name,
      data.state,
      data.slug,
      data.intro,
      JSON.stringify(data.relevant_courses || []),
      !!data.is_real_campus,
      data.campus_name || null,
      data.campus_address || null,
      data.delivery_info,
      JSON.stringify(data.faqs || []),
      data.featured_image,
      data.image_alt_text,
      data.seo_title,
      data.meta_description,
      data.status || 'draft',
      publishedAt
    ]);
    id = res.rows[0].id;
  }

  revalidatePath(`/areas/${data.slug}`);
  revalidatePath('/');
  return { success: true, id };
}

export async function toggleAreaPublishAction(id: number, currentStatus: string) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const db = await getDB();
  const res = await db.query(`
    UPDATE local_areas SET
      status = $1,
      published_at = CASE WHEN $1 = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING slug
  `, [newStatus, id]);

  if (res.rows.length > 0) {
    revalidatePath(`/areas/${res.rows[0].slug}`);
  }
  revalidatePath('/');
  return { success: true, newStatus };
}

export async function deleteAreaAction(id: number) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  const res = await db.query('DELETE FROM local_areas WHERE id = $1 RETURNING slug', [id]);
  if (res.rows.length > 0) {
    revalidatePath(`/areas/${res.rows[0].slug}`);
  }
  revalidatePath('/');
  return { success: true };
}

// 7. Site Settings Update Action
export async function updateSiteSettingsAction(data: any) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const db = await getDB();
  await db.query(`
    UPDATE site_settings SET
      site_name = $1,
      rto_code = $2,
      logo_url = $3,
      logo_alt = $4,
      phone_melbourne = $5,
      phone_adelaide = $6,
      phone_general = $7,
      whatsapp = $8,
      email = $9,
      address_hawthorn = $10,
      address_coolaroo = $11,
      address_mawson = $12,
      address_canberra = $13,
      footer_text = $14,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `, [
    data.site_name,
    data.rto_code,
    data.logo_url,
    data.logo_alt,
    data.phone_melbourne,
    data.phone_adelaide,
    data.phone_general,
    data.whatsapp,
    data.email,
    data.address_hawthorn,
    data.address_coolaroo,
    data.address_mawson,
    data.address_canberra,
    data.footer_text
  ]);

  revalidatePath('/', 'layout');
  return { success: true };
}

