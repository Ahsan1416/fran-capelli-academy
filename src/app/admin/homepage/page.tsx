import React from 'react';
import { getDB } from '@/lib/db';
import HomepageEditor from './HomepageEditor';

export default async function AdminHomepagePage() {
  const db = await getDB();
  const configRes = await db.query('SELECT * FROM homepage_config WHERE id = 1 LIMIT 1');
  const initialConfig = configRes.rows[0] || {};

  const coursesRes = await db.query('SELECT id, title, slug, code FROM courses ORDER BY id ASC');
  const courses = coursesRes.rows || [];

  return <HomepageEditor initialConfig={initialConfig} courses={courses} />;
}

