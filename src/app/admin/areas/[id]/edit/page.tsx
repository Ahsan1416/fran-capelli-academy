import React from 'react';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import AreaEditorForm from '@/app/admin/areas/AreaEditorForm';

interface AreaEditProps {
  params: Promise<{ id: string }>;
}

export default async function AdminAreaEditPage({ params }: AreaEditProps) {
  const { id } = await params;
  const areaId = parseInt(id, 10);
  if (isNaN(areaId)) notFound();

  const db = await getDB();
  const areaRes = await db.query('SELECT * FROM local_areas WHERE id = $1 LIMIT 1', [areaId]);
  if (areaRes.rows.length === 0) notFound();

  const area = areaRes.rows[0];

  const coursesRes = await db.query('SELECT id, title, slug, code FROM courses ORDER BY id ASC');
  const courses = coursesRes.rows || [];

  return <AreaEditorForm area={area} courses={courses} />;
}
