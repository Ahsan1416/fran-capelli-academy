'use client';

import React, { useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export default function AdminImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImportSimulated() {
    setImporting(true);
    setError(null);
    setResult(null);

    try {
      // Fetch fresh FCA data from local scraped cache or online if needed
      const res = await fetch('/api/admin/import', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setResult(`Import completed successfully! Sourced ${data.postsCount} posts and ${data.pagesCount} pages directly into PostgreSQL.`);
    } catch (err: any) {
      setError(err.message || 'Import error.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Migration Bridge
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            WordPress Content & Media Importer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            WordPress serves only as a temporary migration source. Once imported, everyday editing and publishing happens 100% inside this Next.js admin dashboard and reads from your PostgreSQL database.
          </p>
        </div>

        {result && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{result}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm">How to Export from Your WordPress:</h3>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Log into your WordPress Dashboard (`wp-admin`).</li>
            <li>Navigate to <strong>Tools → Export</strong>.</li>
            <li>Select <strong>&quot;All content&quot;</strong> and click <strong>Download Export File</strong>.</li>
            <li>Use the automated syncer below to pull authentic FCA structured content directly into PostgreSQL.</li>
          </ol>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleImportSimulated}
            disabled={importing}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-fca-mint" />
            <span>{importing ? 'Processing WordPress Sync...' : 'Sync Sourced FCA Content to PostgreSQL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

