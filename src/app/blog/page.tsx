import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import { getWpPosts } from '@/lib/wordpress';
import { Calendar, ChevronRight, BookOpen, ShieldCheck, ArrowRight, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog & Student Insights | Fran Capelli Academy',
  description: 'Practical trade guides, South Australia builder licensing tips, hairdressing and barbering salon trends, and childcare career pathways.',
  alternates: {
    canonical: 'https://www.fca.edu.au/blog'
  }
};

interface BlogListingProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogListingPage({ searchParams }: BlogListingProps) {
  const params = await searchParams;
  const categoryFilter = typeof params?.category === 'string' ? params.category : null;

  const db = await getDB();
  
  // 1. Fetch DB published posts
  let sql = "SELECT * FROM posts WHERE status = 'published' ";
  const queryParams: any[] = [];
  if (categoryFilter) {
    sql += "AND category = $1 ";
    queryParams.push(categoryFilter);
  }
  sql += "ORDER BY published_at DESC, id DESC";

  const res = await db.query(sql, queryParams);
  const dbPosts = res.rows || [];

  // 2. Fetch WordPress live posts
  let wpPosts = await getWpPosts(categoryFilter || undefined);
  // Filter out any courses or internal items if they have category Courses
  wpPosts = wpPosts.filter(p => !p.slug.startsWith('cpc') && !p.slug.startsWith('shb') && !p.slug.startsWith('chc'));

  // Merge posts: Prefer WordPress version if slug matches, otherwise keep DB
  const mergedPostsMap = new Map<string, any>();

  // Add DB posts
  for (const post of dbPosts) {
    mergedPostsMap.set(post.slug, {
      ...post,
      source: 'database'
    });
  }

  // Override/Add WordPress posts
  for (const wp of wpPosts) {
    const existing = mergedPostsMap.get(wp.slug);
    mergedPostsMap.set(wp.slug, {
      id: wp.id,
      slug: wp.slug,
      title: wp.title,
      excerpt: wp.excerpt || existing?.excerpt || '',
      category: wp.category || existing?.category || 'FCA Insights',
      featured_image: wp.featured_image || existing?.featured_image || '/images/fca/courses/hairdressing-hero.png',
      published_at: wp.date || existing?.published_at || new Date().toISOString(),
      source: 'wordpress'
    });
  }

  const posts = Array.from(mergedPostsMap.values());

  // Get distinct categories
  const catRes = await db.query("SELECT DISTINCT category FROM posts WHERE status = 'published'");
  const categories = Array.from(new Set([
    ...catRes.rows.map(r => r.category).filter(Boolean),
    ...wpPosts.map(p => p.category).filter(Boolean)
  ]));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header Banner with Soft Background Image */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-12 lg:py-16">
        <div className="absolute inset-0 pointer-events-none -z-0">
          <Image
            src="/images/fca/hero-header.png"
            alt="Blog Header Background"
            fill
            className="object-cover object-top opacity-30 brightness-[1.04] saturate-[0.8]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/94" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-100/35 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-fca-green border border-emerald-200 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-fca-mint-dark" />
              <span>FCA Academy News & Insights</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Trade Insights & Student Guides
            </h1>
            <p className="text-slate-600 mt-4 text-base sm:text-lg leading-relaxed">
              Read expert articles on building licensing requirements in South Australia, modern haircutting techniques, and vocational career advice from our industry trainers.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-8 border-b border-slate-200">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                !categoryFilter
                  ? 'bg-fca-green text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Articles
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  categoryFilter === cat
                    ? 'bg-fca-green text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Post Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center mt-10">
            <p className="text-slate-500 font-medium">No published articles found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {posts.map((post) => {
              const dateStr = post.published_at 
                ? new Date(post.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                : '';

              return (
                <article
                  key={post.slug}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={post.featured_image || '/images/fca/courses/hairdressing-hero.png'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-sm backdrop-blur-xs">
                        {post.category || 'Article'}
                      </span>
                      {post.source === 'wordpress' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                          WordPress Live
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {dateStr && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </div>
                      )}
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-fca-green transition-colors leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-slate-600 text-sm mt-3 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-fca-green hover:text-fca-green-dark transition-colors"
                      >
                        <span>Read Full Guide</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
