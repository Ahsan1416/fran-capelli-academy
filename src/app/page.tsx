import React from 'react';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getWpPageBySlug, parseHomepageFromWpHtml } from '@/lib/wordpress';
import StatePortalView from '@/components/public/StatePortalView';
import { Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

const DEFAULT_COURSES = [
  {
    id: 1,
    code: 'CPC40120',
    title: 'Certificate IV in Building and Construction',
    slug: 'cpc40120-certificate-iv-in-building-and-construction',
    category_slug: 'building-construction',
    category_name: 'Building & Construction',
    duration: '36 Weeks (excluding holidays)',
    prerequisite: 'No formal prerequisites. White Card required before site visits.',
    units_count: '19',
    subsidised_fee: '$446 *Skills SA Subsidised (Eligibility criteria apply)',
    standard_fee: '$5,800',
    delivery_mode: 'Real-time Evening Virtual Lectures + Adelaide Campus Practicums',
    funding_notes: 'Subsidised for eligible South Australian residents under Skills SA.',
    career_outcomes: '["Licensed Residential Builder (CBS SA)","Site Supervisor","Project Administrator"]',
    overview: 'The recognised educational pathway toward obtaining your South Australian Building Work Contractor Licence through Consumer and Business Services (CBS). Includes 6 units mapped to licensing criteria.',
    featured_image: '/images/fca/courses/building-plans.png',
    states_available: '["SA","VIC","ACT","WA"]',
    is_funded_sa: true,
    status: 'published'
  },
  {
    id: 2,
    code: 'CPC50220',
    title: 'Diploma of Building and Construction (Building)',
    slug: 'cpc50220-diploma-of-building-and-construction-building',
    category_slug: 'building-construction',
    category_name: 'Building & Construction',
    duration: '62 Weeks (excluding holidays)',
    prerequisite: 'CPC40120 or relevant construction industry trade experience.',
    units_count: '27',
    subsidised_fee: '$1,065 *Skills SA Subsidised (Eligibility criteria apply)',
    standard_fee: '$9,200',
    delivery_mode: 'Real-time Evening Virtual Lectures + Site Case Studies',
    funding_notes: 'Subsidised for eligible South Australian students under Skills SA.',
    career_outcomes: '["Medium-Rise Commercial Builder","Construction Project Manager","Senior Site Supervisor"]',
    overview: 'Advance your construction management expertise to medium-rise residential and commercial builds (up to 3 storeys). Covers advanced structural concrete, risk management, and commercial contracts.',
    featured_image: '/images/fca/courses/building-site.png',
    states_available: '["SA","VIC","ACT","WA"]',
    is_funded_sa: true,
    status: 'published'
  },
  {
    id: 3,
    code: 'SHB30416',
    title: 'Certificate III in Hairdressing',
    slug: 'shb30416-certificate-iii-in-hairdressing',
    category_slug: 'hairdressing-barbering',
    category_name: 'Hairdressing & Barbering',
    duration: '1-2 Years (Apprenticeship or Institutional Delivery)',
    prerequisite: 'Year 10 or equivalent language and literacy skills.',
    units_count: '28',
    subsidised_fee: 'Skills SA Subsidised / User Choice Funded',
    standard_fee: '$12,500',
    delivery_mode: 'Hands-on Commercial Training Salon Practicums + Blended Theory',
    funding_notes: 'Government funding available for eligible apprentices and trainees.',
    career_outcomes: '["Senior Hair Stylist","Salon Colour Specialist","Salon Owner / Manager"]',
    overview: 'Master the art of cutting, creative colour formulation, chemical reformations, and commercial client management in real live academy salons.',
    featured_image: '/images/fca/courses/hairdressing-hero.png',
    states_available: '["SA","VIC","ACT","WA"]',
    is_funded_sa: true,
    status: 'published'
  },
  {
    id: 4,
    code: 'SHB30516',
    title: 'Certificate III in Barbering',
    slug: 'shb30516-certificate-iii-in-barbering',
    category_slug: 'hairdressing-barbering',
    category_name: 'Hairdressing & Barbering',
    duration: '1-2 Years (Flexible Salon Delivery)',
    prerequisite: 'Year 10 or equivalent.',
    units_count: '26',
    subsidised_fee: 'Government Subsidised / Traineeship Pathways Available',
    standard_fee: '$11,000',
    delivery_mode: 'Hands-on Student Barber Salon + Live Client Training',
    funding_notes: 'Traineeship funding options for eligible candidates.',
    career_outcomes: '["Professional Barber","Modern Fade & Blade Specialist","Barbershop Entrepreneur"]',
    overview: 'Become a specialist in precision fades, traditional hot-towel open-razor shaves, beard designs, and modern men’s styling.',
    featured_image: '/images/fca/courses/barbering-hero.png',
    states_available: '["SA","VIC","ACT","WA"]',
    is_funded_sa: true,
    status: 'published'
  },
  {
    id: 5,
    code: 'CHC30125',
    title: 'Certificate III in Early Childhood Education and Care',
    slug: 'chc30125-certificate-iii-in-early-childhood-education-and-care',
    category_slug: 'early-childhood-education-care',
    category_name: 'Early Childhood Education & Care',
    duration: '53 Weeks (Includes 160h Mandatory Workplace Practicum)',
    prerequisite: 'Working with Children Check (WWCC) and Police Clearance.',
    units_count: '17',
    subsidised_fee: '$554 *Skills SA Subsidised (Eligibility criteria apply)',
    standard_fee: '$6,200',
    delivery_mode: 'Blended Learning + 160 Hours Regulated Center Practicum',
    funding_notes: 'Eligible SA students access heavily reduced tuition under Skills SA.',
    career_outcomes: '["Early Childhood Educator","Family Day Care Worker","Nanny / Au Pair"]',
    overview: 'The essential national qualification required to educate and care for babies and young children in Australian regulated early childhood services.',
    featured_image: '/images/fca/courses/childhood-care.png',
    states_available: '["SA","VIC","ACT","WA"]',
    is_funded_sa: true,
    status: 'published'
  }
];

const DEFAULT_SA_AREAS = [
  {
    id: 1,
    area_name: 'Mawson Lakes Commercial Campus',
    slug: 'mawson-lakes',
    state: 'SA',
    is_real_campus: true,
    distance_from_cbd: '12 km North of Adelaide CBD (Opposite Station)'
  },
  {
    id: 2,
    area_name: 'Adelaide City Hub',
    slug: 'adelaide-cbd',
    state: 'SA',
    is_real_campus: false,
    distance_from_cbd: 'Adelaide Central District Service Area'
  },
  {
    id: 3,
    area_name: 'Salisbury & Northern Adelaide',
    slug: 'salisbury',
    state: 'SA',
    is_real_campus: false,
    distance_from_cbd: 'Northern Adelaide Region'
  }
];

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
