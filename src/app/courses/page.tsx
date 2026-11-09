import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDB } from '@/lib/db';
import { getWpPosts, parseCourseFromWpHtml } from '@/lib/wordpress';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Search
} from 'lucide-react';

interface CoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Accredited Vocational Courses | Hairdressing, Barbering, Building & Childcare',
  description: 'Explore nationally accredited qualifications delivered by Fran Capelli Academy (RTO # 6055). Government subsidised training options in South Australia and Victoria.'
};

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

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const categoryFilter = typeof params?.category === 'string' ? params.category : null;

  const db = await getDB();
  const res = await db.query('SELECT * FROM courses ORDER BY id ASC');
  const allCourses = (res.rows && res.rows.length > 0) ? res.rows : DEFAULT_COURSES;

  const filteredCourses = categoryFilter
    ? allCourses.filter(c => c.category_slug === categoryFilter)
    : allCourses;

  const wpPosts = await getWpPosts('courses', 50);
  const wpMap = new Map<string, any>();
  if (wpPosts && Array.isArray(wpPosts)) {
    for (const p of wpPosts) {
      wpMap.set(p.slug, p);
    }
  }

  const enhancedCourses = filteredCourses.map(c => {
    const wp = wpMap.get(c.slug);
    if (wp && wp.content) {
      const parsed = parseCourseFromWpHtml(wp.content, c);
      if (wp.title) parsed.title = wp.title;
      return parsed;
    }
    return c;
  });

  const categories = [
    { slug: 'all', name: 'All Courses' },
    { slug: 'hairdressing', name: 'Hairdressing' },
    { slug: 'barbering', name: 'Barbering' },
    { slug: 'building-construction', name: 'Building & Construction' },
    { slug: 'early-childhood-education-care', name: 'Early Childhood Education' },
    { slug: 'community-services', name: 'Community Services' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header Banner with Soft Background Image */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-12 lg:py-16">
        <div className="absolute inset-0 pointer-events-none -z-0">
          <Image
            src="/images/fca/real-trades-hero.jpg"
            alt="Courses Header Background"
            fill
            className="object-cover object-center opacity-30 brightness-[1.02] saturate-[0.85]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/92" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/95" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-100/35 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-fca-green border border-emerald-200 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-fca-mint-dark" />
              <span>RTO Provider # 6055</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Nationally Accredited Vocational Courses
            </h1>
            <p className="text-slate-600 mt-4 text-base sm:text-lg leading-relaxed">
              Choose from industry-leading qualifications in Hairdressing, Barbering, Building & Construction, Early Childhood Education & Care, and Community Services across our campuses and flexible delivery hubs.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-8 border-b border-slate-200">
          {categories.map((cat) => {
            const isActive = (!categoryFilter && cat.slug === 'all') || categoryFilter === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/courses' : `/courses?category=${cat.slug}`}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${isActive
                    ? 'bg-fca-green text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {enhancedCourses.map((c) => {
            const states = JSON.parse(c.states_available || '[]');
            const outcomes = JSON.parse(c.career_outcomes || '[]').slice(0, 3);

            let cardImg = c.featured_image || '/images/fca/courses/hairdressing-hero.png';
            if (c.code?.startsWith('CPC40120')) {
              cardImg = '/images/fca/courses/building-site.png';
            } else if (c.code?.startsWith('CPC50220')) {
              cardImg = '/images/fca/real-trades-hero.jpg';
            } else if (c.code?.startsWith('SHB30416')) {
              cardImg = '/images/fca/courses/hairdressing-hero.png';
            } else if (c.code?.startsWith('SHB30516')) {
              cardImg = '/images/fca/courses/building-plans.png';
            } else if (c.code?.startsWith('CHC30125')) {
              cardImg = '/images/fca/courses/childhood-care.png';
            } else if (c.code?.startsWith('CHC52025')) {
              cardImg = '/images/fca/courses/community-chc52025.jpg';
            }

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full bg-slate-100">
                    <Image
                      src={cardImg}
                      alt={c.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3.5 left-3.5 bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wide">
                      {c.code}
                    </div>
                    {c.is_funded_sa && (
                      <div className="absolute top-3.5 right-3.5 bg-emerald-600 text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-sm">
                        Skills SA Subsidised ($0.50/hr)
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-7 space-y-4 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="h-6 flex items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          {c.category_name}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl mt-2 leading-snug line-clamp-2 min-h-[3.75rem] flex items-start">
                        {c.title}
                      </h3>
                      <p className="text-slate-600 text-base line-clamp-3 leading-relaxed mt-2 min-h-[4.5rem]">
                        {c.overview}
                      </p>
                    </div>

                    <div className="space-y-2.5 text-sm text-slate-700 pt-3 border-t border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold shrink-0">
                          <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Duration:</span>
                        </div>
                        <span className="font-bold text-slate-800 text-right">{c.duration}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold shrink-0">
                          <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Units:</span>
                        </div>
                        <span className="font-bold text-slate-800 text-right">{c.units_count} Competency Units</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold shrink-0">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Campus Hubs:</span>
                        </div>
                        <span className="font-medium text-slate-800 text-right">{states.join(', ')}</span>
                      </div>
                    </div>

                    {c.subsidised_fee && (
                      <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 shrink-0">Skills SA Subsidised:</span>
                          <span className="text-base font-black text-emerald-800 text-right">{c.subsidised_fee}</span>
                        </div>
                        {c.standard_fee && (
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-600 mt-1">
                            <span className="shrink-0">Standard Full Fee:</span>
                            <span className="font-semibold text-right">{c.standard_fee}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-7 pt-0">
                  <Link
                    href={`/courses/${c.slug}`}
                    className="flex items-center justify-center w-full py-3.5 px-5 rounded-xl text-base font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-sm group"
                  >
                    <span>View Syllabus & Requirements</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
