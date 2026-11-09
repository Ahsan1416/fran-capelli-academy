import React from 'react';
import { getDB } from '@/lib/db';
import AreaEditorForm from '../AreaEditorForm';

export default async function AdminNewAreaPage() {
  const db = await getDB();
  const res = await db.query('SELECT id, title, slug, code FROM courses ORDER BY id ASC');
  const courses = res.rows || [];

  return <AreaEditorForm courses={courses} />;
}

