import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { 
  MapPin, 
  Building2, 
  Globe, 
  Clock, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Eye,
  Bus,
  Car
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface LocalAreaProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: LocalAreaProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDB();
  const res = await db.query('SELECT * FROM local_areas WHERE slug = $1 LIMIT 1', [slug]);
  if (res.rows.length === 0) return { title: 'Area Not Found | Fran Capelli Academy' };

  const area = res.rows[0];
  return {
    title: area.seo_title || `${area.area_name} (${area.state}) Courses & Delivery | Fran Capelli Academy`,
    description: area.meta_description || area.intro?.slice(0, 160),
    alternates: {
      canonical: `https://www.fca.edu.au/areas/${area.slug}`
    }
  };
}

export default async function LocalAreaPage({ params, searchParams }: LocalAreaProps) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreviewRequested = query?.preview === 'true';
  const admin = await getCurrentAdmin();

  const db = await getDB();
  const res = await db.query('SELECT * FROM local_areas WHERE slug = $1 LIMIT 1', [slug]);
  if (res.rows.length === 0) {
    notFound();
  }

  const area = res.rows[0];

  // Draft Access Control
  const isDraft = area.status === 'draft';
  if (isDraft && !admin) {
    notFound();
  }

  // Parse JSON fields
  let relevantCourseSlugs: string[] = [];
  try {
    relevantCourseSlugs = typeof area.relevant_courses === 'string' ? JSON.parse(area.relevant_courses) : (area.relevant_courses || []);
  } catch {
    relevantCourseSlugs = [];
  }

  let faqs: Array<{ question: string; answer: string }> = [];
  try {
    faqs = typeof area.faqs === 'string' ? JSON.parse(area.faqs) : (area.faqs || []);
  } catch {
    faqs = [];
  }

  // Fetch relevant courses
  let courses: any[] = [];
  if (relevantCourseSlugs.length > 0) {
    const coursesRes = await db.query('SELECT * FROM courses ORDER BY id ASC');
    courses = coursesRes.rows.filter(c => relevantCourseSlugs.includes(c.slug));
  }

  // Map state to destination URL
  const stateUrls: Record<string, string> = {
    'VIC': '/fran-capelli-academy-vic',
    'SA': '/south-australia-funding',
    'ACT': '/fran-capelli-academy-australiacapitalterritory',
    'WA': '/fran-capelli-academy-wa'
  };
  const stateUrl = stateUrls[area.state] || '/courses';

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      {/* Draft Warning */}
      {isDraft && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-inner mb-6 max-w-7xl mx-auto rounded-xl">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>
              <strong>Draft Area Page:</strong> This local area page is unpublished and hidden from public visitors. Visible to staff only.
            </span>
          </div>
          <Link 
            href={`/admin/areas/${area.id}/edit`}
            className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-semibold hover:bg-slate-800 transition-colors"
          >
            Edit in Dashboard
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-fca-green">Home</Link>
          <span>/</span>
          <Link href={stateUrl} className="hover:text-fca-green">{area.state} Division</Link>
          <span>/</span>
          <span className="text-slate-900">{area.area_name}</span>
        </nav>

        {/* Hero Card with Real Background Image (No side image) */}
        <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="absolute inset-0 pointer-events-none -z-0">
            <Image
              src={area.featured_image || (area.state === 'VIC' ? '/images/fca/courses/hairdressing-salon.png' : '/images/fca/real-trades-hero.jpg')}
              alt={area.image_alt_text || area.area_name}
              fill
              className="object-cover object-center opacity-30 brightness-[1.02] saturate-[0.85]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/92" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/95" />
          </div>
          <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-4xl space-y-5">
            {/* Campus vs Service Area Distinction Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                {area.state}
              </span>
              {area.is_real_campus ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-fca-green border border-emerald-300">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Real Physical Campus & Salon Studio</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Official Service Area (Blended Virtual + Practicum)</span>
                </span>
              )}
              {isDraft && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                  Draft
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Vocational Training & Courses in {area.area_name}
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              {area.intro}
            </p>

            {/* Physical Campus Address vs Delivery Info Card */}
            <div className={`p-5 rounded-2xl border text-sm leading-relaxed max-w-2xl ${
              area.is_real_campus 
                ? 'bg-emerald-50/70 border-emerald-200' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              {area.is_real_campus ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 font-bold text-slate-900">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p>{area.campus_name || `Fran Capelli Academy ${area.area_name} Campus`}</p>
                      <p className="font-normal text-slate-700 text-xs sm:text-sm">{area.campus_address}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 pt-1 border-t border-emerald-100">
                    <strong>Delivery Details:</strong> {area.delivery_info}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 font-bold text-slate-900">
                    <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p>Service Area Delivery (No Campus Commute Required)</p>
                      <p className="font-normal text-slate-600 text-xs sm:text-sm">
                        {area.delivery_info}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 pt-1 border-t border-slate-200">
                    Students in {area.area_name} complete interactive evening virtual theory sessions combined with arranged workplace practicals in registered local businesses.
                  </p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/contact"
                className="font-bold px-7 py-3 rounded-xl text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-md text-sm"
              >
                Enrol in {area.area_name}
              </Link>
              <Link
                href={stateUrl}
                className="font-bold px-7 py-3 rounded-xl text-fca-green bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors text-sm"
              >
                View All {area.state} Programs
              </Link>
            </div>
          </div>
        </div>

        {/* Relevant Courses in this Area */}
        {courses.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Curriculum
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                  Accredited Courses Available for {area.area_name} Students
                </h2>
              </div>
              <Link href="/courses" className="text-xs font-bold text-fca-green hover:underline">
                View All Courses Directory →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {courses.map((c) => (
                <div key={c.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow h-full">
                  <div className="space-y-3 flex flex-col flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
                        {c.code}
                      </span>
                      {c.is_funded_sa && (
                        <span className="text-xs font-bold text-emerald-700">Skills SA Funded</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg min-h-[3.25rem] flex items-start">{c.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[2.5rem] leading-relaxed">{c.overview}</p>
                    <div className="pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-1.5 mt-auto">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-500 shrink-0">Duration:</span>
                        <span className="font-bold text-slate-800 text-right">{c.duration}</span>
                      </div>
                      {c.subsidised_fee && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-500 shrink-0">Subsidised:</span>
                          <span className="text-emerald-700 font-bold text-right">{c.subsidised_fee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-5 mt-auto">
                    <Link
                      href={`/courses/${c.slug}`}
                      className="block text-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors"
                    >
                      View Course Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local Area FAQs */}
        {faqs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {area.area_name} Student FAQs
            </h2>
            <div className="space-y-4 pt-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">{faq.question}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
