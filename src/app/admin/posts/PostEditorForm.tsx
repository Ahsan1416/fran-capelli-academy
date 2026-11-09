'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { saveBlogPostAction } from '../actions';
import { 
  Save, 
  Sparkles, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface PostEditorFormProps {
  post?: any;
}

export default function PostEditorForm({ post }: PostEditorFormProps) {
  const router = useRouter();
  const isEditing = !!post?.id;

  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!post?.slug);
  const [category, setCategory] = useState(post?.category || 'Building & Construction');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '/images/fca/blog/popular-post.jpeg');
  const [imageAltText, setImageAltText] = useState(post?.image_alt_text || '');
  const [seoTitle, setSeoTitle] = useState(post?.seo_title || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }

  async function handleSave(publishStatus: 'draft' | 'published') {
    if (!title.trim() || !slug.trim()) {
      setStatusMsg({ type: 'error', text: 'Title and Slug are required.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await saveBlogPostAction(post?.id || null, {
        title,
        slug,
        excerpt,
        content,
        category,
        featured_image: featuredImage,
        image_alt_text: imageAltText,
        seo_title: seoTitle,
        meta_description: metaDescription,
        status: publishStatus
      });

      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: publishStatus === 'published' 
            ? 'Blog post published live! It is now accessible on the public website.' 
            : 'Blog post saved as draft. Only authorised staff can view it.'
        });
        if (!isEditing && res.id) {
          router.push(`/admin/posts/${res.id}/edit`);
        }
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-fca-green"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Blog Posts</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          {slug && (
            <a
              href={`/blog/${slug}?preview=true`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-fca-mint" />
            <span>Publish to Live</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
          statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Editor Body */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Blog Article' : 'Create New Blog Post'}
            </h2>
            <p className="text-xs text-slate-500">
              {post?.status === 'published' ? 'Currently Published on Live Site' : 'Currently in Draft Mode'}
            </p>
          </div>
        </div>

        {/* Title & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Article Title (H1) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Essential Skills for Modern Salon Stylists"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                URL Slug *
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[10px] text-fca-green hover:underline font-semibold"
              >
                {autoSlug ? 'Lock Slug' : 'Auto from title'}
              </button>
            </div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
              placeholder="essential-skills-modern-salon"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Category & Featured Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="Hair & Beauty">Hair & Beauty</option>
              <option value="Barbering">Barbering</option>
              <option value="Building & Construction">Building & Construction</option>
              <option value="Education & Care">Education & Care</option>
              <option value="Community Services">Community Services</option>
              <option value="Student Guides">Student Guides</option>
              <option value="General News">General News</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Featured Image URL
            </label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Image Alt Text (Accessibility & SEO)
          </label>
          <input
            type="text"
            value={imageAltText}
            onChange={(e) => setImageAltText(e.target.value)}
            placeholder="Descriptive alt text for the featured image"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Short Summary / Excerpt
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A brief 1-2 sentence overview shown in blog cards and search results."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Article Content (Rich Text / HTML) *
          </label>
          <textarea
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<p>Write your detailed article paragraphs, headings (<h2>), and lists (<ul>) here...</p>"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed"
          />
        </div>

        {/* SEO Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              SEO Title Tag
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. Modern Hair Styling Guide | Fran Capelli Academy"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Meta Description Tag
            </label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="A compelling snippet shown on Google search."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white text-xs font-bold shadow-md transition-colors"
          >
            Publish Now
          </button>
        </div>
      </div>
    </div>
  );
}

