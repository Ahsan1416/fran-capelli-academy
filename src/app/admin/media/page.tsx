import React from 'react';
import { getDB } from '@/lib/db';
import MediaManager from './MediaManager';

export default async function AdminMediaPage() {
  const db = await getDB();
  const res = await db.query('SELECT * FROM media_items ORDER BY id DESC');
  const media = res.rows || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <MediaManager initialMedia={media} />
    </div>
  );
}

