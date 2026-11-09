'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveLocalAreaAction } from '../actions';
import { 
  Save, 
  Sparkles, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Globe, 
  Plus, 
  Trash2 
} from 'lucide-react';

interface AreaEditorFormProps {
  area?: any;
  courses: Array<{ id: number; title: string; slug: string; code: string }>;
}

export default function AreaEditorForm({ area, courses }: AreaEditorFormProps) {
  const router = useRouter();
  const isEditing = !!area?.id;

  const [areaName, setAreaName] = useState(area?.area_name || '');
  const [state, setState] = useState(area?.state || 'VIC');
  const [slug, setSlug] = useState(area?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!area?.slug);
  const [isRealCampus, setIsRealCampus] = useState(area ? !!area.is_real_campus : true);
  const [campusName, setCampusName] = useState(area?.campus_name || '');
  const [campusAddress, setCampusAddress] = useState(area?.campus_address || '');
  const [deliveryInfo, setDeliveryInfo] = useState(area?.delivery_info || '');
  const [intro, setIntro] = useState(area?.intro || '');

  // Relevant Courses
  let parsedCourses: string[] = [];
  try {
    const raw = area?.relevant_courses;
    parsedCourses = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  } catch {}
  const [relevantCourses, setRelevantCourses] = useState<string[]>(parsedCourses);

  // FAQs
  let parsedFaqs: Array<{ question: string; answer: string }> = [];
  try {
    const raw = area?.faqs;
    parsedFaqs = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  } catch {}
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(parsedFaqs);

  const [featuredImage, setFeaturedImage] = useState(area?.featured_image || '/images/fca/courses/hairdressing-salon.png');
  const [imageAltText, setImageAltText] = useState(area?.image_alt_text || '');
  const [seoTitle, setSeoTitle] = useState(area?.seo_title || '');
  const [metaDescription, setMetaDescription] = useState(area?.meta_description || '');

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleNameChange(val: string) {
    setAreaName(val);
    if (autoSlug) {
      const generated = `${val.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${state.toLowerCase()}`;
      setSlug(generated);
    }
  }

  function handleStateChange(newSt: string) {
    setState(newSt);
    if (autoSlug && areaName) {
      const generated = `${areaName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${newSt.toLowerCase()}`;
      setSlug(generated);
    }
  }

  function handleCourseToggle(cSlug: string) {
    if (relevantCourses.includes(cSlug)) {
      setRelevantCourses(relevantCourses.filter(s => s !== cSlug));
    } else {
      setRelevantCourses([...relevantCourses, cSlug]);
    }
  }

  function handleFaqChange(index: number, field: 'question' | 'answer', value: string) {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  }

  function addFaq() {
    setFaqs([...faqs, { question: 'Local Student Question', answer: 'Enter local answer here.' }]);
  }

  function removeFaq(index: number) {
    setFaqs(faqs.filter((_, i) => i !== index));
  }

  async function handleSave(publishStatus: 'draft' | 'published') {
    if (!areaName.trim() || !slug.trim()) {
      setStatusMsg({ type: 'error', text: 'Area Name and Slug are required.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await saveLocalAreaAction(area?.id || null, {
        area_name: areaName,
        state,
        slug,
        intro,
        relevant_courses: relevantCourses,
        is_real_campus: isRealCampus,
        campus_name: isRealCampus ? campusName : null,
        campus_address: isRealCampus ? campusAddress : null,
        delivery_info: deliveryInfo,
        faqs,
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
            ? 'Local area page published live! It is immediately accessible on the public site.' 
            : 'Local area page saved as draft. Only authorised staff can view it.'
        });
        if (!isEditing && res.id) {
          router.push(`/admin/areas/${res.id}/edit`);
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
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/areas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-fca-green"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Local Areas</span>
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
              href={`/areas/${slug}?preview=true`}
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
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? `Edit Local Area: ${area.area_name}` : 'Create New Local Area Page'}
          </h2>
          <p className="text-xs text-slate-500">
            Designate physical campus studios vs regional service delivery hubs.
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Area / Suburb Name *
            </label>
            <input
              type="text"
              required
              value={areaName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Hawthorn or Geelong"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              State / Territory *
            </label>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white"
            >
              <option value="VIC">Victoria (VIC)</option>
              <option value="SA">South Australia (SA)</option>
              <option value="ACT">Australian Capital Territory (ACT)</option>
              <option value="WA">Western Australia (WA)</option>
              <option value="NSW">New South Wales (NSW)</option>
              <option value="QLD">Queensland (QLD)</option>
            </select>
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
                {autoSlug ? 'Lock' : 'Auto'}
              </button>
            </div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
              placeholder="hawthorn-vic"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Campus Distinction Toggle */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Campus Facility Classification</h3>
              <p className="text-xs text-slate-500">
                Is this a real physical academy campus/salon, or a regional service area?
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setIsRealCampus(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isRealCampus 
                    ? 'bg-fca-green text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Physical Campus</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRealCampus(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  !isRealCampus 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Service Area</span>
              </button>
            </div>
          </div>

          {isRealCampus ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Name
                </label>
                <input
                  type="text"
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  placeholder="e.g. Fran Capelli Academy Hawthorn Campus"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Campus Street Address
                </label>
                <input
                  type="text"
                  value={campusAddress}
                  onChange={(e) => setCampusAddress(e.target.value)}
                  placeholder="e.g. 355 Burwood Road, Hawthorn, VIC 3122"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="pt-2 text-xs text-blue-900 bg-blue-50/80 p-3 rounded-xl border border-blue-200">
              <strong>Service Area Notice:</strong> This area will be clearly marked as an official service delivery region with interactive virtual evening classrooms and supervised local workplace practicum without campus commuting.
            </div>
          )}
        </div>

        {/* Delivery Info & Intro */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Delivery Information & Transport / Practicum Guidance *
          </label>
          <input
            type="text"
            required
            value={deliveryInfo}
            onChange={(e) => setDeliveryInfo(e.target.value)}
            placeholder="e.g. On-campus practical salon training 2 mins from Glenferrie Station, with public transit access."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Area Introductory Overview (Useful Local Student Information) *
          </label>
          <textarea
            rows={3}
            required
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="Write helpful local context for students residing in or near this area..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed"
          />
        </div>

        {/* Relevant Courses */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Relevant Courses Delivered for this Area
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {courses.map((c) => {
              const checked = relevantCourses.includes(c.slug);
              return (
                <label
                  key={c.id}
                  className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center gap-2.5 transition-colors ${
                    checked ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-950' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCourseToggle(c.slug)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="truncate">{c.code} - {c.title}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Local Area FAQs */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Local Area Student FAQs</h3>
            <button
              type="button"
              onClick={addFaq}
              className="text-xs font-bold text-fca-green hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Local Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 relative space-y-2">
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Answer</label>
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

        {/* Image & Alt Text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Featured Image URL
            </label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Image Alt Text
            </label>
            <input
              type="text"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. Courses in Hawthorn Melbourne | Fran Capelli Academy"
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
              placeholder="Local course guide for students in this suburb."
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

