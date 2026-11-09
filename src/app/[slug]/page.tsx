import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getWpPageBySlug } from '@/lib/wordpress';
import StatePortalView from '@/components/public/StatePortalView';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  GraduationCap,
  Eye,
  CheckCircle2,
  Globe
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const STATE_SLUG_MAP: Record<string, 'SA' | 'VIC' | 'ACT' | 'WA'> = {
  // South Australia
  'south-australia': 'SA',
  'sa': 'SA',
  'south-australia-funding': 'SA',
  // Victoria
  'victoria': 'VIC',
  'vic': 'VIC',
  'courses-vic': 'VIC',
  'fran-capelli-academy-vic': 'VIC',
  // ACT
  'act': 'ACT',
  'canberra': 'ACT',
  'courses-act': 'ACT',
  'fran-capelli-academy-australiacapitalterritory': 'ACT',
  // Western Australia
  'western-australia': 'WA',
  'wa': 'WA',
  'perth': 'WA',
  'fran-capelli-academy-wa': 'WA'
};

interface StaticPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (STATE_SLUG_MAP[slug]) {
    const st = STATE_SLUG_MAP[slug];
    const titles: Record<string, string> = {
      SA: 'South Australia Funding & Mawson Lakes Campus | Fran Capelli Academy',
      VIC: 'Victoria Campus & Courses (Hawthorn & Coolaroo) | Fran Capelli Academy',
      ACT: 'ACT Delivery Hub & Canberra Courses | Fran Capelli Academy',
      WA: 'Western Australia Blended Courses & Perth Hub | Fran Capelli Academy'
    };
    return {
      title: titles[st] || 'State Division | Fran Capelli Academy',
      description: `Study accredited qualifications with Fran Capelli Academy (RTO # 6055) in ${st}. Government funding, commercial salons, and builder licensing pathways.`,
      alternates: {
        canonical: `https://www.fca.edu.au/${slug}`
      }
    };
  }
  
  // Check WordPress first
  const wpPage = await getWpPageBySlug(slug);
  if (wpPage) {
    return {
      title: `${wpPage.title} | Fran Capelli Academy`,
      description: wpPage.content.replace(/<[^>]+>/g, '').slice(0, 160),
      alternates: {
        canonical: `https://www.fca.edu.au/${slug}`
      }
    };
  }

  const db = await getDB();
  const res = await db.query('SELECT title, seo_title, meta_description, hero_heading FROM pages WHERE slug = $1 LIMIT 1', [slug]);
  if (res.rows.length === 0) return { title: 'Page Not Found | Fran Capelli Academy' };

  const p = res.rows[0];
  return {
    title: p.seo_title || `${p.title} | Fran Capelli Academy`,
    description: p.meta_description || p.hero_heading,
    alternates: {
      canonical: `https://www.fca.edu.au/${slug}`
    }
  };
}

export default async function TopLevelSlugPage({ params, searchParams }: StaticPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreviewRequested = query?.preview === 'true';
  const admin = await getCurrentAdmin();
  const showPreview = isPreviewRequested && !!admin;

  const targetStateCode = STATE_SLUG_MAP[slug];

  // 1. Check WordPress Live REST API
  const wpPage = await getWpPageBySlug(slug);

  const db = await getDB();
  let res = await db.query('SELECT * FROM pages WHERE slug = $1 LIMIT 1', [slug]);
  
  // If not found by exact slug, but targetStateCode is known, try finding by state_code
  if (res.rows.length === 0 && targetStateCode) {
    res = await db.query('SELECT * FROM pages WHERE state_code = $1 LIMIT 1', [targetStateCode]);
  }

  if (res.rows.length === 0 && !wpPage && !targetStateCode) {
    notFound();
  }

  let page = res.rows[0] || {
    slug,
    title: wpPage?.title || slug,
    hero_heading: wpPage?.title || slug,
    hero_subheading: '',
    hero_image: '/images/fca/hero-students.png',
    content_html: wpPage?.content || '',
    state_code: targetStateCode || null,
    status: 'published'
  };

  // If WordPress has edited content, override title and content_html from WordPress live!
  let isWpLive = false;
  if (wpPage) {
    page.hero_heading = wpPage.title || page.hero_heading;
    page.content_html = wpPage.content || page.content_html;
    isWpLive = true;
  }

  // Draft preview merge for local DB drafts
  let isDraftPreviewing = false;
  if (showPreview && page.has_draft && page.draft_data) {
    try {
      const draftObj = JSON.parse(page.draft_data);
      page = { ...page, ...draftObj };
      isDraftPreviewing = true;
    } catch (e) {
      console.error('Failed to parse draft_data for page:', e);
    }
  }

  // If this page is a State page (VIC, SA, ACT, WA), render its dedicated State Portal!
  const effectiveState = targetStateCode || (page.state_code as 'SA' | 'VIC' | 'ACT' | 'WA');

  if (effectiveState) {
    const areasRes = await db.query(
      "SELECT * FROM local_areas WHERE state = $1 AND status = 'published' ORDER BY is_real_campus DESC, area_name ASC",
      [effectiveState]
    );
    const stateAreas = areasRes.rows || [];

    const coursesRes = await db.query('SELECT * FROM courses ORDER BY id ASC');
    const allCourses = coursesRes.rows || [];
    const stateCourses = allCourses.filter(c => {
      try {
        const states = JSON.parse(c.states_available || '[]');
        return Array.isArray(states) && states.includes(effectiveState);
      } catch {
        return typeof c.states_available === 'string' && c.states_available.includes(effectiveState);
      }
    });

    return (
      <>
        {/* Draft Preview Alert */}
        {isDraftPreviewing && (
          <div className="bg-amber-500 text-slate-900 px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <Eye className="w-4 h-4" />
              <span>
                <strong>State Portal Draft Preview:</strong> You are viewing uncommitted draft edits. Regular visitors see the live published version.
              </span>
            </div>
          </div>
        )}
        <StatePortalView
          stateCode={effectiveState}
          pageOverride={page}
          courses={stateCourses.length > 0 ? stateCourses : allCourses}
          localAreas={stateAreas}
        />
      </>
    );
  }

  let stateAreas: any[] = [];
  let stateCourses: any[] = [];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      {/* Draft Preview Alert */}
      {isDraftPreviewing && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-inner mb-6 max-w-7xl mx-auto rounded-xl">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>
              <strong>Page Draft Preview:</strong> You are viewing uncommitted draft edits. Regular visitors see the live published version.
            </span>
          </div>
          <Link 
            href={`/admin/pages/${page.id}/edit`}
            className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Editor
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Card with Real Background Image (No side image) */}
        <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="absolute inset-0 pointer-events-none -z-0">
            <Image
              src={page.hero_image || '/images/fca/real-trades-hero.jpg'}
              alt={page.hero_heading}
              fill
              className="object-cover object-center opacity-30 brightness-[1.02] saturate-[0.85]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/92" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/95" />
          </div>
          <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-fca-green border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-fca-mint-dark" />
              <span>RTO Provider # 6055</span>
              {page.state_code && <span>• {page.state_code} Division</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {page.hero_heading}
            </h1>

            {page.hero_subheading && (
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
                {page.hero_subheading}
              </p>
            )}

            {/* Campus / Contact quick info */}
            {(page.campus_address || page.phone) && (
              <div className="pt-2 space-y-2 text-xs sm:text-sm text-slate-700 max-w-2xl">
                {page.campus_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{page.campus_address}</span>
                  </div>
                )}
                {page.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{page.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Body & State Enhancements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 prose max-w-none prose-slate prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-fca-green hover:prose-a:underline">
              <div dangerouslySetInnerHTML={{ __html: page.content_html }} />
            </div>

            {/* If State Page: Show Local Areas in this State */}
            {stateAreas.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Campuses & Local Area Hubs in {page.state_code}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {stateAreas.map((area) => (
                    <div 
                      key={area.id} 
                      className={`p-5 rounded-xl border ${
                        area.is_real_campus 
                          ? 'border-emerald-200 bg-emerald-50/50' 
                          : 'border-slate-200 bg-slate-50'
                      } flex flex-col justify-between`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            area.is_real_campus 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {area.is_real_campus ? 'Physical Campus' : 'Service Delivery Area'}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{area.state}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{area.area_name}</h4>
                        {area.campus_address && (
                          <p className="text-xs text-slate-600 line-clamp-1">{area.campus_address}</p>
                        )}
                        <p className="text-xs text-slate-500 line-clamp-2">{area.intro}</p>
                      </div>
                      <div className="pt-3">
                        <Link
                          href={`/areas/${area.slug}`}
                          className="text-xs font-bold text-fca-green hover:underline inline-flex items-center gap-1"
                        >
                          <span>Explore {area.area_name} Guide</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Funding highlight */}
            {page.funding_info && (
              <div className="bg-gradient-to-br from-emerald-800 to-fca-green text-white rounded-2xl p-6 shadow-md space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-700">
                  Funding Notice
                </span>
                <h3 className="font-bold text-lg text-white">Subsidised Education</h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  {page.funding_info}
                </p>
                <Link
                  href="/contact"
                  className="inline-block w-full text-center py-2.5 rounded-xl bg-white text-fca-green font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm mt-2"
                >
                  Enquire About Subsidies
                </Link>
              </div>
            )}

            {/* Courses available in this State */}
            {stateCourses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-base">
                  Qualifications Delivered in {page.state_code}
                </h3>
                <div className="space-y-2.5">
                  {stateCourses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}`}
                      className="block p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                          {c.code}
                        </span>
                        {c.is_funded_sa && (
                          <span className="text-[10px] font-bold text-emerald-700">Funded</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-1 group-hover:text-fca-green transition-colors">
                        {c.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
