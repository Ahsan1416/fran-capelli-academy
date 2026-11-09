import React from 'react';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import PostEditorForm from '@/app/admin/posts/PostEditorForm';

interface PostEditProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPostEditPage({ params }: PostEditProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  if (isNaN(postId)) notFound();

  const db = await getDB();
  const res = await db.query('SELECT * FROM posts WHERE id = $1 LIMIT 1', [postId]);
  if (res.rows.length === 0) notFound();

  const post = res.rows[0];

  return <PostEditorForm post={post} />;
}
