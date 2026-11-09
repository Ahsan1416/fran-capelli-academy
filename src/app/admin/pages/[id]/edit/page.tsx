import React from 'react';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import PageEditor from './PageEditor';

interface PageEditProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPageEditRoute({ params }: PageEditProps) {
  const { id } = await params;
  const pageId = parseInt(id, 10);
  if (isNaN(pageId)) notFound();

  const db = await getDB();
  const res = await db.query('SELECT * FROM pages WHERE id = $1 LIMIT 1', [pageId]);
  if (res.rows.length === 0) notFound();

  const page = res.rows[0];

  return <PageEditor page={page} />;
}

