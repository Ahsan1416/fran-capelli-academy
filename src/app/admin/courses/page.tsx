import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDB } from '@/lib/db';
import { 
  GraduationCap, 
  ExternalLink, 
  Edit3, 
  Clock, 
  Sparkles,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default async function AdminCoursesListPage() {
  const db = await getDB();
  const res = await db.query('SELECT * FROM courses ORDER BY id ASC');
  const courses = res.rows || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Accredited Courses Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Edit qualification titles, codes, subsidized fee schedules, durations, delivery formats, and FAQs.
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Course / Code</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Subsidised Fee</th>
                <th className="py-4 px-6">Draft Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={c.featured_image || '/images/fca/courses/hairdressing-hero.png'}
                          alt={c.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{c.title}</p>
                        <p className="text-[11px] font-mono text-emerald-700">{c.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-fca-green border border-emerald-200">
                      {c.category_name}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{c.duration}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-emerald-800">{c.subsidised_fee || 'On Inquiry'}</span>
                  </td>
                  <td className="py-4 px-6">
                    {c.has_draft ? (
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
                        href={`/admin/courses/${c.id}/edit`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-xs"
                      >
                        Edit Course
                      </Link>
                      <Link
                        href={c.has_draft ? `/courses/${c.slug}?preview=true` : `/courses/${c.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-fca-green"
                        title="View Course"
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

