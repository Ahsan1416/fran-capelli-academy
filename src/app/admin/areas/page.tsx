import React from 'react';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import AreasTable from './AreasTable';
import { Plus, MapPin } from 'lucide-react';

export default async function AdminAreasListPage() {
  const db = await getDB();
  const res = await db.query('SELECT * FROM local_areas ORDER BY id DESC');
  const areas = res.rows || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Local Area Pages</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage regional campus hubs and service delivery areas with useful local student transit and course information.
          </p>
        </div>

        <Link
          href="/admin/areas/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Local Area Page</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <AreasTable initialAreas={areas} />
      </div>
    </div>
  );
}

