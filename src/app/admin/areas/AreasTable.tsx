'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toggleAreaPublishAction, deleteAreaAction } from '../actions';
import { 
  Building2, 
  Globe, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  ExternalLink, 
  Trash2 
} from 'lucide-react';

interface AreasTableProps {
  initialAreas: any[];
}

export default function AreasTable({ initialAreas }: AreasTableProps) {
  const [areas, setAreas] = useState(initialAreas);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleTogglePublish(area: any) {
    setLoadingId(area.id);
    try {
      const res = await toggleAreaPublishAction(area.id, area.status);
      if (res.success) {
        setAreas(areas.map(a => a.id === area.id ? { ...a, status: res.newStatus } : a));
      }
    } catch {
      alert('Failed to toggle status');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to permanently delete this local area page?')) return;
    setLoadingId(id);
    try {
      await deleteAreaAction(id);
      setAreas(areas.filter(a => a.id !== id));
    } catch {
      alert('Failed to delete area page');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
          <tr>
            <th className="py-4 px-6">Area Name & Slug</th>
            <th className="py-4 px-6">State</th>
            <th className="py-4 px-6">Campus Type</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {areas.map((area) => {
            const isPublished = area.status === 'published';

            return (
              <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900 text-sm">{area.area_name}</p>
                  <p className="text-[11px] font-mono text-slate-400">/areas/{area.slug}</p>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                    {area.state}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {area.is_real_campus ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <Building2 className="w-3 h-3 text-emerald-600" />
                      <span>Physical Campus</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      <Globe className="w-3 h-3 text-blue-600" />
                      <span>Service Area</span>
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <button
                    type="button"
                    disabled={loadingId === area.id}
                    onClick={() => handleTogglePublish(area)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                      isPublished 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                    title="Click to toggle publish/unpublish"
                  >
                    {isPublished ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{isPublished ? 'Published' : 'Draft'}</span>
                  </button>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/areas/${area.id}/edit`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-xs"
                    >
                      Edit
                    </Link>

                    <Link
                      href={isPublished ? `/areas/${area.slug}` : `/areas/${area.slug}?preview=true`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-fca-green"
                      title={isPublished ? 'View Live' : 'Preview Draft'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      disabled={loadingId === area.id}
                      onClick={() => handleDelete(area.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Area Page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

