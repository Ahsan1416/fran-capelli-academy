import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getWpPostBySlug } from '@/lib/wordpress';
import { Calendar, Tag, ArrowLeft, Eye, ShieldCheck, Share2, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface BlogPostProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Check WordPress first
  const wpPost = await getWpPostBySlug(slug);
  if (wpPost) {
    return {
      title: `${wpPost.title} | Fran Capelli Academy`,
      description: wpPost.excerpt,
      alternates: {
        canonical: `https://www.fca.edu.au/blog/${wpPost.slug}`
      }
    };
  }

  const db = await getDB();
  const res = await db.query('SELECT * FROM posts WHERE slug = $1 LIMIT 1', [slug]);
  if (res.rows.length === 0) return { title: 'Post Not Found | Fran Capelli Academy' };

  const post = res.rows[0];
  return {
    title: post.seo_title || `${post.title} | Fran Capelli Academy`,
    description: post.meta_description || post.excerpt,
    alternates: {
      canonical: `https://www.fca.edu.au/blog/${post.slug}`
    },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.featured_image ? [{ url: post.featured_image }] : []
    }
  };
}

export default async function BlogPostPage({ params, searchParams }: BlogPostProps) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreviewRequested = query?.preview === 'true';
  const admin = await getCurrentAdmin();

  let post: any = null;
  let isWpSource = false;

  // 1. Check WordPress Live REST API
  const wpPost = await getWpPostBySlug(slug);
  if (wpPost) {
    post = {
      id: wpPost.id,
      slug: wpPost.slug,
      title: wpPost.title,
      content: wpPost.content,
      excerpt: wpPost.excerpt,
      category: wpPost.category,
      featured_image: wpPost.featured_image || '/images/fca/courses/barbering-fades.png',
      published_at: wpPost.date,
      status: 'published'
    };
    isWpSource = true;
  } else {
    // 2. Fallback to Local PostgreSQL DB
    const db = await getDB();
    const res = await db.query('SELECT * FROM posts WHERE slug = $1 LIMIT 1', [slug]);
    if (res.rows.length > 0) {
      post = res.rows[0];
    }
  }

  if (!post) {
    notFound();
  }

  // Draft Access Control for DB drafts
  const isDraft = post.status === 'draft';
  if (isDraft && !admin) {
    // Hidden from public visitors!
    notFound();
  }

  const dateStr = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Draft (Unpublished)';

  return (
    <article className="bg-slate-50 min-h-screen py-12">
      {/* Draft Preview Indicator */}
      {isDraft && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-inner mb-6 max-w-4xl mx-auto rounded-xl">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>
              <strong>Draft Mode:</strong> This post is unpublished and hidden from the public. Visible to staff only.
            </span>
          </div>
          <Link 
            href={`/admin/posts/${post.id}/edit`}
            className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-semibold hover:bg-slate-800 transition-colors"
          >
            Edit in Dashboard
          </Link>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-fca-green transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {/* Post Header Card */}
        <div className="relative bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-0">
            <Image
              src="/images/fca/hero-header.png"
              alt="Article Background"
              fill
              className="object-cover object-top opacity-30 brightness-[1.04] saturate-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/94" />
          </div>
          <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-fca-green border border-emerald-200">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
            {isDraft && (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                Draft
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-fca-green pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm mt-6">
              <Image
                src={post.featured_image}
                alt={post.image_alt_text || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content Body */}
          <div 
            className="prose prose-slate max-w-none pt-6 prose-headings:text-slate-900 prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-a:text-fca-green hover:prose-a:underline leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer Callout */}
          <div className="mt-12 pt-8 border-t border-slate-100 bg-slate-50 -mx-8 -mb-8 p-8 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-slate-900 text-base">Explore Practical Training at FCA</h4>
              <p className="text-xs text-slate-500">Nationally Recognised Training RTO # 6055 across Melbourne & Adelaide.</p>
            </div>
            <Link
              href="/courses"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-sm shrink-0"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
        </div>
      </div>
    </article>
  );
}
