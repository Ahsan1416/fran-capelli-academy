import React from 'react';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import { FileText, ExternalLink, Edit3, Clock, CheckCircle2 } from 'lucide-react';

export default async function AdminPagesListPage() {
  const db = await getDB();
  const res = await db.query('SELECT * FROM pages ORDER BY id ASC');
  const pages = res.rows || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">State & Static Website Pages</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Edit content across state pages (VIC, SA, ACT, WA), About Us, and Campus Contact directories.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Page Name & Path</th>
                <th className="py-4 px-6">Division / State</th>
                <th className="py-4 px-6">Hero Heading</th>
                <th className="py-4 px-6">Draft Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                    <p className="text-[11px] font-mono text-slate-400">/{p.slug}</p>
                  </td>
                  <td className="py-4 px-6">
                    {p.state_code ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                        {p.state_code}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Core Page</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                    {p.hero_heading}
                  </td>
                  <td className="py-4 px-6">
                    {p.has_draft ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        <span>Unpublished Draft</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Live in Sync</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pages/${p.id}/edit`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-xs"
                      >
                        Edit Page
                      </Link>
                      <Link
                        href={p.has_draft ? `/${p.slug}?preview=true` : `/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-fca-green"
                        title="View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

