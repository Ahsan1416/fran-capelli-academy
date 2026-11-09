'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { saveCourseDraftAction, publishCourseAction } from '@/app/admin/actions';
import { 
  Save, 
  Sparkles, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2,
  Clock
} from 'lucide-react';

interface CourseEditorProps {
  course: any;
}

export default function CourseEditor({ course }: CourseEditorProps) {
  // If draft_data exists, offer draft values
  let initialDraft = null;
  if (course.has_draft && course.draft_data) {
    try {
      initialDraft = JSON.parse(course.draft_data);
    } catch {}
  }

  const [title, setTitle] = useState(initialDraft?.title ?? course.title ?? '');
  const [code, setCode] = useState(initialDraft?.code ?? course.code ?? '');
  const [subsidisedFee, setSubsidisedFee] = useState(initialDraft?.subsidised_fee ?? course.subsidised_fee ?? '');
  const [standardFee, setStandardFee] = useState(initialDraft?.standard_fee ?? course.standard_fee ?? '');
  const [duration, setDuration] = useState(initialDraft?.duration ?? course.duration ?? '');
  const [prerequisite, setPrerequisite] = useState(initialDraft?.prerequisite ?? course.prerequisite ?? '');
  const [unitsCount, setUnitsCount] = useState(initialDraft?.units_count ?? course.units_count ?? '');
  const [deliveryMode, setDeliveryMode] = useState(initialDraft?.delivery_mode ?? course.delivery_mode ?? '');
  const [fundingNotes, setFundingNotes] = useState(initialDraft?.funding_notes ?? course.funding_notes ?? '');
  const [overview, setOverview] = useState(initialDraft?.overview ?? course.overview ?? '');
  const [featuredImage, setFeaturedImage] = useState(initialDraft?.featured_image ?? course.featured_image ?? '');

  // FAQs
  let parsedFaqs: Array<{ question: string; answer: string }> = [];
  try {
    const raw = initialDraft?.faqs ?? course.faqs;
    parsedFaqs = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  } catch {}
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(parsedFaqs);

  // Status
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasDraft, setHasDraft] = useState(!!course.has_draft);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function getFormData() {
    return {
      title,
      code,
      subsidised_fee: subsidisedFee,
      standard_fee: standardFee,
      duration,
      prerequisite,
      units_count: unitsCount,
      delivery_mode: deliveryMode,
      funding_notes: fundingNotes,
      overview,
      featured_image: featuredImage,
      faqs
    };
  }

  async function handleSaveDraft() {
    setSaving(true);
    setStatusMsg(null);
    try {
      const data = getFormData();
      await saveCourseDraftAction(course.id, data);
      setHasDraft(true);
      setStatusMsg({ type: 'success', text: 'Course draft saved! Preview changes before publishing.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save course draft.' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setStatusMsg(null);
    try {
      const data = getFormData();
      await publishCourseAction(course.id, data);
      setHasDraft(false);
      setStatusMsg({ type: 'success', text: 'Course published live! Public website is immediately updated.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Publishing failed.' });
    } finally {
      setPublishing(false);
    }
  }

  function handleFaqChange(index: number, field: 'question' | 'answer', val: string) {
    const updated = [...faqs];
    updated[index][field] = val;
    setFaqs(updated);
  }

  function addFaq() {
    setFaqs([...faqs, { question: 'New Question', answer: 'Enter answer' }]);
  }

  function removeFaq(index: number) {
    setFaqs(faqs.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-fca-green"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
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
            href={`/courses/${course.slug}?preview=true`}
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

      {/* Draft notice */}
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

      {/* Main Form */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Edit Qualification: {course.code}</h2>
          <p className="text-xs text-slate-500">Live URL: /courses/{course.slug}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Title
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
              Course Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-emerald-800"
            />
          </div>
        </div>

        {/* Fees Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div>
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
              Subsidised Fee (Skills SA / Government Subsidised)
            </label>
            <input
              type="text"
              value={subsidisedFee}
              onChange={(e) => setSubsidisedFee(e.target.value)}
              placeholder="e.g. $446 *Government Subsidised Fee"
              className="w-full px-3.5 py-2 rounded-lg border border-emerald-200 text-sm font-bold text-emerald-800 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Standard Full Fee (Fee for Service)
            </label>
            <input
              type="text"
              value={standardFee}
              onChange={(e) => setStandardFee(e.target.value)}
              placeholder="e.g. $5,800 Full Fee"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white"
            />
          </div>
        </div>

        {/* Duration, Prerequisites & Units */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Units of Competency
            </label>
            <input
              type="text"
              value={unitsCount}
              onChange={(e) => setUnitsCount(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Prerequisites
            </label>
            <input
              type="text"
              value={prerequisite}
              onChange={(e) => setPrerequisite(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>
        </div>

        {/* Delivery Mode & Funding Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Delivery Mode Description
          </label>
          <input
            type="text"
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Government Funding Notes (e.g. CBS Licensing, Skills SA criteria)
          </label>
          <textarea
            rows={2}
            value={fundingNotes}
            onChange={(e) => setFundingNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Course Overview & Syllabus Summary
          </label>
          <textarea
            rows={4}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed"
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Featured Image Path
          </label>
          <input
            type="text"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
          />
          {featuredImage && (
            <div className="relative w-48 h-28 rounded-xl overflow-hidden mt-2 bg-slate-100 border border-slate-200">
              <Image src={featuredImage} alt="Course Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Course FAQs */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Course Specific FAQs</h3>
            <button
              type="button"
              onClick={addFaq}
              className="text-xs font-bold text-fca-green hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
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

        {/* Action Buttons */}
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

