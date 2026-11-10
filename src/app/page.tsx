import React from 'react';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getWpPageBySlug, parseHomepageFromWpHtml } from '@/lib/wordpress';
import StatePortalView from '@/components/public/StatePortalView';
import { DEFAULT_COURSES, DEFAULT_SA_AREAS } from '@/lib/defaultData';
import { Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const isPreviewRequested = params?.preview === 'true';
  const admin = await getCurrentAdmin();
  const showPreview = isPreviewRequested && !!admin;

  const db = await getDB();

  // Fetch Homepage Config
  const homeRes = await db.query('SELECT * FROM homepage_config WHERE id = 1 LIMIT 1');
  const home = homeRes.rows[0] || {};

  const wpHome = await getWpPageBySlug('home');
  let parsedWpHome: any = {};
  if (wpHome && !showPreview) {
    parsedWpHome = parseHomepageFromWpHtml(wpHome.content, home);
  }

  // Resolve preview vs live values
  let heroTitle = home.hero_title || 'Practical Industry Training Designed for Real Careers';
  if (showPreview && home.has_draft && home.draft_hero_title) {
    heroTitle = home.draft_hero_title;
  } else if (!showPreview && parsedWpHome.heroTitle && parsedWpHome.heroTitle !== 'Practical Industry Training Designed for Real Careers') {
    heroTitle = parsedWpHome.heroTitle;
  } else if (!showPreview && wpHome?.title && !wpHome.title.toLowerCase().startsWith('homepage') && wpHome.title !== 'Practical Industry Training Designed for Real Careers') {
    heroTitle = wpHome.title;
  }
  let heroSubtitle = (showPreview && home.has_draft && home.draft_hero_subtitle) 
    ? home.draft_hero_subtitle 
    : parsedWpHome.heroSubtitle || home.hero_subtitle || 'Study nationally recognised vocational qualifications in Mawson Lakes. Eligible South Australian students access government subsidised courses from $0.50 per nominal hour, plus consumer-approved builder contractor licence courses.';
  const heroImage = (showPreview && home.has_draft && home.draft_hero_image) 
    ? home.draft_hero_image 
    : home.hero_image || '/images/fca/hero-header.png';

  // Fetch South Australia courses with rock-solid fallback
  const coursesRes = await db.query('SELECT * FROM courses ORDER BY id ASC');
  const dbCourses = coursesRes.rows || [];
  const allCourses = dbCourses.length > 0 ? dbCourses : DEFAULT_COURSES;
  const saCourses = allCourses.filter(c => {
    try {
      const states = JSON.parse(c.states_available || '[]');
      return Array.isArray(states) && states.includes('SA');
    } catch {
      return typeof c.states_available === 'string' && c.states_available.includes('SA');
    }
  });

  // Fetch South Australia local areas / campuses
  const areasRes = await db.query(
    "SELECT * FROM local_areas WHERE state = 'SA' AND status = 'published' ORDER BY is_real_campus DESC, area_name ASC"
  );
  const saAreas = (areasRes.rows && areasRes.rows.length > 0) ? areasRes.rows : DEFAULT_SA_AREAS;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Draft Preview Warning Banner for Admin */}
      {showPreview && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-inner sticky top-20 z-40">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>
              <strong>Draft Preview Mode:</strong> You are currently viewing uncommitted draft edits. Standard visitors still see the live published version.
            </span>
          </div>
          <Link 
            href="/admin/homepage" 
            className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Editor
          </Link>
        </div>
      )}

      {/* Front Page is now South Australia Portal with authentic FCA content */}
      <StatePortalView
        stateCode="SA"
        pageOverride={{
          hero_heading: heroTitle,
          hero_subheading: heroSubtitle,
          hero_image: heroImage
        }}
        courses={saCourses.length > 0 ? saCourses : allCourses}
        localAreas={saAreas}
      />
    </div>
  );
}
