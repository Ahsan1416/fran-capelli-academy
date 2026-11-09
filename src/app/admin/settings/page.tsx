import React from 'react';
import { getDB } from '@/lib/db';
import SettingsForm from './SettingsForm';

export default async function AdminSettingsPage() {
  const db = await getDB();
  const res = await db.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1');
  const settings = res.rows[0] || {};

  return <SettingsForm initialSettings={settings} />;
}

