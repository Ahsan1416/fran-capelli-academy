import React from 'react';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import CourseEditor from './CourseEditor';

interface CourseEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCourseEditPage({ params }: CourseEditPageProps) {
  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) notFound();

  const db = await getDB();
  const res = await db.query('SELECT * FROM courses WHERE id = $1 LIMIT 1', [courseId]);
  if (res.rows.length === 0) notFound();

  const course = res.rows[0];

  return <CourseEditor course={course} />;
}

