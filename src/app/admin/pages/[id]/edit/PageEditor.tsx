'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { savePageDraftAction, publishPageAction } from '@/app/admin/actions';
import { 
  Save, 
  Sparkles, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

interface PageEditorProps {
  page: any;
}

export default function PageEditor({ page }: PageEditorProps) {
  let initialDraft = null;
  if (page.has_draft && page.draft_data) {
    try {
      initialDraft = JSON.parse(page.draft_data);
    } catch {}
  }

  const [title, setTitle] = useState(initialDraft?.title ?? page.title ?? '');
  const [heroHeading, setHeroHeading] = useState(initialDraft?.hero_heading ?? page.hero_heading ?? '');
  const [heroSubheading, setHeroSubheading] = useState(initialDraft?.hero_subheading ?? page.hero_subheading ?? '');
  const [heroImage, setHeroImage] = useState(initialDraft?.hero_image ?? page.hero_image ?? '');
  const [contentHtml, setContentHtml] = useState(initialDraft?.content_html ?? page.content_html ?? '');
  const [campusAddress, setCampusAddress] = useState(initialDraft?.campus_address ?? page.campus_address ?? '');
  const [phone, setPhone] = useState(initialDraft?.phone ?? page.phone ?? '');
  const [email, setEmail] = useState(initialDraft?.email ?? page.email ?? '');
  const [fundingInfo, setFundingInfo] = useState(initialDraft?.funding_info ?? page.funding_info ?? '');
  const [seoTitle, setSeoTitle] = useState(initialDraft?.seo_title ?? page.seo_title ?? '');
  const [metaDescription, setMetaDescription] = useState(initialDraft?.meta_description ?? page.meta_description ?? '');

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasDraft, setHasDraft] = useState(!!page.has_draft);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function getFormData() {
    return {
      title,
      hero_heading: heroHeading,
      hero_subheading: heroSubheading,
      hero_image: heroImage,
      content_html: contentHtml,
      campus_address: campusAddress,
      phone,
      email,
      funding_info: fundingInfo,
      seo_title: seoTitle,
      meta_description: metaDescription
    };
  }

  async function handleSaveDraft() {
    setSaving(true);
    setStatusMsg(null);
    try {
      const data = getFormData();
      await savePageDraftAction(page.id, data);
      setHasDraft(true);
      setStatusMsg({ type: 'success', text: 'Page draft saved! Preview changes before publishing.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setStatusMsg(null);
    try {
      const data = getFormData();
      await publishPageAction(page.id, data);
      setHasDraft(false);
      setStatusMsg({ type: 'success', text: 'Page published live! Public website is immediately updated.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Publishing failed' });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-fca-green"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pages</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <a
            href={`/${page.slug}?preview=true`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Draft</span>
          </a>

          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || publishing}
            className="px-5 py-2 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-fca-mint" />
            <span>{publishing ? 'Publishing...' : 'Publish to Live'}</span>
          </button>
        </div>
      </div>

      {hasDraft && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Unpublished Draft Active:</strong> You have uncommitted changes. Regular visitors see the live published version until you click &quot;Publish to Live&quot;.
          </span>
        </div>
      )}

      {statusMsg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
          statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Edit Page: {page.title}</h2>
          <p className="text-xs text-slate-500">Live URL: /{page.slug}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Page Browser Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hero Main Heading (H1)
            </label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Hero Subtitle
          </label>
          <textarea
            rows={2}
            value={heroSubheading}
            onChange={(e) => setHeroSubheading(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Hero Featured Image URL
          </label>
          <input
            type="text"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Campus Physical Address
            </label>
            <input
              type="text"
              value={campusAddress}
              onChange={(e) => setCampusAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            State Government Funding / Subsidies Note
          </label>
          <textarea
            rows={2}
            value={fundingInfo}
            onChange={(e) => setFundingInfo(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Page Content HTML
          </label>
          <textarea
            rows={8}
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              SEO Meta Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Meta Description
            </label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || publishing}
            className="px-6 py-2.5 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white text-xs font-bold shadow-md transition-colors"
          >
            Publish to Live
          </button>
        </div>
      </div>
    </div>
  );
}

