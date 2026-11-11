import React from 'react';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import { 
  BookOpen, 
  MapPin, 
  GraduationCap, 
  Image as ImageIcon, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Home, 
  FileText,
  ExternalLink
} from 'lucide-react';

export default async function AdminOverviewPage() {
  const db = await getDB();

  // Metrics
  const postsCount = await db.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'published') as published,
      COUNT(*) FILTER (WHERE status = 'draft') as draft
    FROM posts
  `);
  const postStats = postsCount.rows?.[0] || { total: 0, published: 0, draft: 0 };

  const areasCount = await db.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_real_campus = true) as real_campuses,
      COUNT(*) FILTER (WHERE is_real_campus = false) as service_areas,
      COUNT(*) FILTER (WHERE status = 'published') as published,
      COUNT(*) FILTER (WHERE status = 'draft') as draft
    FROM local_areas
  `);
  const areaStats = areasCount.rows?.[0] || { total: 0, real_campuses: 0, service_areas: 0, published: 0, draft: 0 };

  const coursesCount = await db.query('SELECT COUNT(*) as total FROM courses');
  const mediaCount = await db.query('SELECT COUNT(*) as total FROM media_items');
  const coursesTotal = coursesCount.rows?.[0]?.total ?? 6;
  const mediaTotal = mediaCount.rows?.[0]?.total ?? 0;

  // Recent Blog Posts
  const recentPosts = await db.query('SELECT * FROM posts ORDER BY id DESC LIMIT 5');

  // Recent Local Area Pages
  const recentAreas = await db.query('SELECT * FROM local_areas ORDER BY id DESC LIMIT 5');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-fca-green-dark to-fca-green text-white p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700">
            Publishing Control Center
          </span>
          <h1 className="text-3xl font-extrabold text-white">
            Fran Capelli Academy Content Dashboard
          </h1>
          <p className="text-sm text-emerald-100 max-w-xl">
            Edit live website sections, manage course details, publish student articles, and maintain local campus & service delivery hubs with instant live updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-fca-green font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog Post</span>
          </Link>
          <Link
            href="/admin/areas/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 border border-emerald-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Local Area</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Blog Posts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Blog Posts</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-fca-green">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{postStats.total}</div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="text-emerald-700 font-semibold">{postStats.published} Published</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">{postStats.draft} Drafts</span>
            </div>
          </div>
          <Link href="/admin/posts" className="text-xs font-bold text-fca-green hover:underline mt-4 inline-flex items-center">
            Manage Blog Posts →
          </Link>
        </div>

        {/* Metric 2: Local Areas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Local Area Hubs</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{areaStats.total}</div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="text-emerald-700 font-semibold">{areaStats.real_campuses} Real Campuses</span>
              <span>•</span>
              <span className="text-blue-700 font-semibold">{areaStats.service_areas} Service Areas</span>
            </div>
          </div>
          <Link href="/admin/areas" className="text-xs font-bold text-fca-green hover:underline mt-4 inline-flex items-center">
            Manage Local Areas →
          </Link>
        </div>

        {/* Metric 3: Courses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Courses</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{coursesTotal}</div>
            <div className="text-xs text-slate-500 mt-1">
              Nationally accredited certificates & diplomas
            </div>
          </div>
          <Link href="/admin/courses" className="text-xs font-bold text-fca-green hover:underline mt-4 inline-flex items-center">
            Edit Course Catalog →
          </Link>
        </div>

        {/* Metric 4: Media Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Media Library</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{mediaTotal}</div>
            <div className="text-xs text-slate-500 mt-1">
              Real FCA images & uploaded assets
            </div>
          </div>
          <Link href="/admin/media" className="text-xs font-bold text-fca-green hover:underline mt-4 inline-flex items-center">
            Open Media Store →
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Posts & Local Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Recent Blog Posts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Blog Posts</h3>
              <p className="text-xs text-slate-500">Latest student insights & articles</p>
            </div>
            <Link
              href="/admin/posts/new"
              className="text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Post</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPosts.rows.map((post) => (
              <div key={post.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      post.status === 'published' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{post.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate">{post.title}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={post.status === 'published' ? `/blog/${post.slug}` : `/blog/${post.slug}?preview=true`}
                    target="_blank"
                    className="text-xs font-semibold px-2 py-1 rounded text-slate-400 hover:text-fca-green"
                    title="View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Local Areas */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Local Area Hubs</h3>
              <p className="text-xs text-slate-500">Physical campuses vs delivery regions</p>
            </div>
            <Link
              href="/admin/areas/new"
              className="text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Area</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAreas.rows.map((area) => (
              <div key={area.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      area.is_real_campus ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {area.is_real_campus ? 'Real Campus' : 'Service Area'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">{area.state}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      area.status === 'published' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {area.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate">{area.area_name}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/areas/${area.id}/edit`}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={area.status === 'published' ? `/areas/${area.slug}` : `/areas/${area.slug}?preview=true`}
                    target="_blank"
                    className="text-xs font-semibold px-2 py-1 rounded text-slate-400 hover:text-fca-green"
                    title="View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

