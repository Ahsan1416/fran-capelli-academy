'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Send,
  DownloadCloud
} from 'lucide-react';

export default function AdminWordPressHub() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const wpUrl = 'https://darkgray-llama-274719.hostingersite.com';

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wordpress-sync');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({ status: { ok: false, message: err.message } });
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(action: 'push_all' | 'pull_all') {
    setActionLoading(action);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/wordpress-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setMessage({ type: 'success', text: data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Headless WordPress CMS Backend</span>
            </span>
            {status?.status?.ok ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                Connecting...
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            WordPress Backend & Live Editing Hub
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Aapka WordPress account Next.js website ke sath 100% connect ho chuka hai. Ab aap apni website ka content seedha WordPress dashboard se edit kar sakte hain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${wpUrl}/wp-admin/`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <span>Open WP-Admin</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Quick Direct Editing Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>Direct WordPress Editing Sections (Kahan Se Kya Edit Karein):</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Pages */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">State & Static Pages</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Victoria, South Australia, ACT, WA, About Us, aur Contact pages ko WordPress mein edit karein.
              </p>
            </div>
            <div className="pt-5 border-t border-slate-100 mt-4">
              <a
                href={`${wpUrl}/wp-admin/edit.php?post_type=page`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <span>Edit Pages in WP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 2. Blog Posts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Blog Posts & Guides</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Naye articles likhein ya existing trade guides aur Skills SA tips ko WordPress Posts se edit karein.
              </p>
            </div>
            <div className="pt-5 border-t border-slate-100 mt-4">
              <a
                href={`${wpUrl}/wp-admin/edit.php`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <span>Edit Posts in WP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 3. Courses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Courses & Syllabuses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Building, Barbering, Hairdressing, aur Childcare courses ke overview aur details WordPress se update karein.
              </p>
            </div>
            <div className="pt-5 border-t border-slate-100 mt-4">
              <a
                href={`${wpUrl}/wp-admin/edit.php?category_name=courses`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                <span>Edit Courses in WP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 4. Media Library */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Media Library</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nayi photos, salon pictures, aur banners upload karein aur pages/posts par featured images set karein.
              </p>
            </div>
            <div className="pt-5 border-t border-slate-100 mt-4">
              <a
                href={`${wpUrl}/wp-admin/upload.php`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between text-xs font-bold text-amber-600 hover:text-amber-800"
              >
                <span>Open Media Library</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronisation Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Bidirectional Synchronization (Do-Tarfa Sync Controls)
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Aapka Next.js frontend WordPress REST API se live connect hai. Agar aap chahein to poora local data WordPress par push kar sakte hain ya WordPress ki live changes ko local database mein sync kar sakte hain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Push All Content to WordPress</span>
            </h3>
            <p className="text-xs text-slate-600">
              FCA ke tamaam accredited courses, state pages, aur blog posts ko dobara WordPress backend par push aur update karein.
            </p>
            <button
              type="button"
              onClick={() => handleSync('push_all')}
              disabled={!!actionLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'push_all' ? 'animate-spin' : ''}`} />
              <span>{actionLoading === 'push_all' ? 'Pushing to WP...' : 'Push All to WordPress'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              <span>Pull Changes into Local Database</span>
            </h3>
            <p className="text-xs text-slate-600">
              WordPress par jo naye posts ya pages aapne edit kiye hain, unhe local PostgreSQL database ke sath sync kar dein.
            </p>
            <button
              type="button"
              onClick={() => handleSync('pull_all')}
              disabled={!!actionLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'pull_all' ? 'animate-spin' : ''}`} />
              <span>{actionLoading === 'pull_all' ? 'Pulling from WP...' : 'Pull from WordPress'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

