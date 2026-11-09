'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { saveHomepageDraftAction, publishHomepageAction } from '../actions';
import { 
  Eye, 
  Upload, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertCircle,
  MoveUp,
  MoveDown
} from 'lucide-react';

interface HomepageEditorProps {
  initialConfig: any;
  courses: Array<{ id: number; title: string; slug: string; code: string }>;
}

export default function HomepageEditor({ initialConfig, courses }: HomepageEditorProps) {
  const isDraftActive = !!initialConfig.has_draft;

  // Form State
  const [heroBadge, setHeroBadge] = useState(
    (isDraftActive && initialConfig.draft_hero_badge) ? initialConfig.draft_hero_badge : initialConfig.hero_badge || ''
  );
  const [heroTitle, setHeroTitle] = useState(
    (isDraftActive && initialConfig.draft_hero_title) ? initialConfig.draft_hero_title : initialConfig.hero_title || ''
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    (isDraftActive && initialConfig.draft_hero_subtitle) ? initialConfig.draft_hero_subtitle : initialConfig.hero_subtitle || ''
  );
  const [heroImage, setHeroImage] = useState(
    (isDraftActive && initialConfig.draft_hero_image) ? initialConfig.draft_hero_image : initialConfig.hero_image || '/images/fca/hero-header.png'
  );
  const [primaryBtnText, setPrimaryBtnText] = useState(
    (isDraftActive && initialConfig.draft_hero_primary_btn_text) ? initialConfig.draft_hero_primary_btn_text : initialConfig.hero_primary_btn_text || 'Explore All Courses'
  );
  const [primaryBtnLink, setPrimaryBtnLink] = useState(
    (isDraftActive && initialConfig.draft_hero_primary_btn_link) ? initialConfig.draft_hero_primary_btn_link : initialConfig.hero_primary_btn_link || '/courses'
  );
  const [secondaryBtnText, setSecondaryBtnText] = useState(
    (isDraftActive && initialConfig.draft_hero_secondary_btn_text) ? initialConfig.draft_hero_secondary_btn_text : initialConfig.hero_secondary_btn_text || 'Check Government Funding'
  );
  const [secondaryBtnLink, setSecondaryBtnLink] = useState(
    (isDraftActive && initialConfig.draft_hero_secondary_btn_link) ? initialConfig.draft_hero_secondary_btn_link : initialConfig.hero_secondary_btn_link || '/south-australia-funding'
  );

  // Featured Course Slugs
  const rawFeatured = (isDraftActive && initialConfig.draft_featured_course_slugs) ? initialConfig.draft_featured_course_slugs : initialConfig.featured_course_slugs;
  let parsedFeatured: string[] = [];
  try {
    parsedFeatured = typeof rawFeatured === 'string' ? JSON.parse(rawFeatured) : (rawFeatured || []);
  } catch {}
  const [featuredSlugs, setFeaturedSlugs] = useState<string[]>(parsedFeatured);

  // FAQs
  const rawFaqs = (isDraftActive && initialConfig.draft_faqs) ? initialConfig.draft_faqs : initialConfig.faqs;
  let parsedFaqs: Array<{ question: string; answer: string }> = [];
  try {
    parsedFaqs = typeof rawFaqs === 'string' ? JSON.parse(rawFaqs) : (rawFaqs || []);
  } catch {}
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(parsedFaqs);

  // Section Order & Visibility
  const rawOrder = (isDraftActive && initialConfig.draft_section_order) ? initialConfig.draft_section_order : initialConfig.section_order;
  let parsedOrder: string[] = ['hero', 'stats', 'categories', 'featured_courses', 'support', 'states', 'testimonials', 'faqs', 'cta'];
  try {
    if (rawOrder) parsedOrder = typeof rawOrder === 'string' ? JSON.parse(rawOrder) : rawOrder;
  } catch {}
  const [sectionOrder, setSectionOrder] = useState<string[]>(parsedOrder);

  const rawVisibility = (isDraftActive && initialConfig.draft_section_visibility) ? initialConfig.draft_section_visibility : initialConfig.section_visibility;
  let parsedVisibility: Record<string, boolean> = {
    hero: true, stats: true, categories: true, featured_courses: true, support: true, states: true, testimonials: true, faqs: true, cta: true
  };
  try {
    if (rawVisibility) parsedVisibility = { ...parsedVisibility, ...(typeof rawVisibility === 'string' ? JSON.parse(rawVisibility) : rawVisibility) };
  } catch {}
  const [visibility, setVisibility] = useState<Record<string, boolean>>(parsedVisibility);

  // UI status
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sectionLabels: Record<string, string> = {
    hero: '1. Top Hero Header (Badge, Title, Image, CTAs)',
    stats: '2. Statistics Counter Bar (Students, Campuses, Qualifications)',
    categories: '3. Trade Disciplines Grid (Hair, Barber, Building, Childcare)',
    featured_courses: '4. Featured Accredited Qualifications Cards',
    support: '5. Student Journey & Support Callout Banner',
    states: '6. National Campus & State Destinations Map',
    testimonials: '7. Student & Graduate Testimonials',
    faqs: '8. Frequently Asked Questions Accordion',
    cta: '9. Bottom Enrolment CTA Banner'
  };

  function moveSection(index: number, direction: 'up' | 'down') {
    const newOrder = [...sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionOrder(newOrder);
  }

  function toggleVisibility(key: string) {
    setVisibility({ ...visibility, [key]: !visibility[key] });
  }

  function handleCourseToggle(slug: string) {
    if (featuredSlugs.includes(slug)) {
      setFeaturedSlugs(featuredSlugs.filter(s => s !== slug));
    } else {
      setFeaturedSlugs([...featuredSlugs, slug]);
    }
  }

  function handleFaqChange(index: number, field: 'question' | 'answer', value: string) {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  }

  function addFaq() {
    setFaqs([...faqs, { question: 'New Question', answer: 'Enter detailed response here.' }]);
  }

  function removeFaq(index: number) {
    setFaqs(faqs.filter((_, i) => i !== index));
  }

  async function handleSaveDraft() {
    setSaving(true);
    setStatusMsg(null);
    try {
      await saveHomepageDraftAction({
        hero_badge: heroBadge,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image: heroImage,
        hero_primary_btn_text: primaryBtnText,
        hero_primary_btn_link: primaryBtnLink,
        hero_secondary_btn_text: secondaryBtnText,
        hero_secondary_btn_link: secondaryBtnLink,
        featured_course_slugs: featuredSlugs,
        faqs,
        section_order: sectionOrder,
        section_visibility: visibility
      });
      setStatusMsg({ type: 'success', text: 'Draft saved! You can preview changes without affecting live visitors.' });
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
      // First save current fields as draft
      await saveHomepageDraftAction({
        hero_badge: heroBadge,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image: heroImage,
        hero_primary_btn_text: primaryBtnText,
        hero_primary_btn_link: primaryBtnLink,
        hero_secondary_btn_text: secondaryBtnText,
        hero_secondary_btn_link: secondaryBtnLink,
        featured_course_slugs: featuredSlugs,
        faqs,
        section_order: sectionOrder,
        section_visibility: visibility
      });
      // Then promote to live!
      await publishHomepageAction();
      setStatusMsg({ type: 'success', text: 'Homepage published live! All changes are now live on the public website.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Publish failed' });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Homepage Content & Layout Editor</h2>
            {isDraftActive ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Unpublished Draft Edits
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Live Version in Sync
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify hero copy, image, CTA buttons, featured courses, reorder sections, and toggle visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>{saving ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          <a
            href="/?preview=true"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Draft</span>
          </a>

          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || publishing}
            className="px-5 py-2.5 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-fca-mint" />
            <span>{publishing ? 'Publishing...' : 'Publish to Live'}</span>
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

      {/* Editor Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Hero Content & Buttons (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card 1: Hero Visuals & Copy */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. Hero Header Copy & Visuals
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Top Badge Text
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Main Hero Heading (H1)
              </label>
              <textarea
                rows={2}
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Subtitle / Introductory Paragraph
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Hero Image Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Image URL (or choose from FCA Asset Library)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              {/* Quick Pick FCA Images */}
              <div className="mt-3">
                <p className="text-[11px] text-slate-500 font-semibold mb-2">Quick Select FCA Authentic Image:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Students Header', path: '/images/fca/hero-header.png' },
                    { label: 'Hairdressing Salon', path: '/images/fca/courses/hairdressing-hero.png' },
                    { label: 'Barbering Fades', path: '/images/fca/courses/barbering-hero.png' },
                    { label: 'Building CPC40120', path: '/images/fca/courses/building-cpc40120.png' }
                  ].map((img) => (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() => setHeroImage(img.path)}
                      className={`p-1.5 rounded-xl border text-left text-[11px] flex flex-col items-center gap-1 transition-all ${
                        heroImage === img.path ? 'border-emerald-600 bg-emerald-50 font-bold' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative w-full h-12 rounded-lg overflow-hidden bg-slate-100">
                        <Image src={img.path} alt={img.label} fill className="object-cover" />
                      </div>
                      <span className="truncate w-full text-center">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Primary Button Text & Link
                </label>
                <input
                  type="text"
                  value={primaryBtnText}
                  onChange={(e) => setPrimaryBtnText(e.target.value)}
                  placeholder="Button Label"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={primaryBtnLink}
                  onChange={(e) => setPrimaryBtnLink(e.target.value)}
                  placeholder="/courses"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Secondary Button Text & Link
                </label>
                <input
                  type="text"
                  value={secondaryBtnText}
                  onChange={(e) => setSecondaryBtnText(e.target.value)}
                  placeholder="Button Label"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={secondaryBtnLink}
                  onChange={(e) => setSecondaryBtnLink(e.target.value)}
                  placeholder="/south-australia-funding"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Featured Courses on Homepage */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. Featured Qualifications (Select up to 4 to display)
            </h3>
            <div className="space-y-2">
              {courses.map((c) => {
                const isSelected = featuredSlugs.includes(c.slug);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      isSelected ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCourseToggle(c.slug)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{c.title}</span>
                        <span className="ml-2 text-[11px] text-slate-400 font-mono">({c.code})</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{c.slug}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 3: Frequently Asked Questions (FAQs) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                3. Homepage FAQs
              </h3>
              <button
                type="button"
                onClick={addFaq}
                className="text-xs font-bold text-fca-green hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Question {idx + 1}</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Answer</label>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Section Reordering & Show/Hide Toggles (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Section Order & Visibility
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reorder homepage sections with arrows. Check/uncheck to show or hide from public visitors.
              </p>
            </div>

            <div className="space-y-2">
              {sectionOrder.map((key, idx) => (
                <div
                  key={key}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    visibility[key] ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={!!visibility[key]}
                      onChange={() => toggleVisibility(key)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="truncate">{sectionLabels[key] || key}</span>
                  </label>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, 'up')}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sectionOrder.length - 1}
                      onClick={() => moveSection(idx, 'down')}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Save Layout Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

