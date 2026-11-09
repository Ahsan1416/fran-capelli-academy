import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getWpPostBySlug, parseCourseFromWpHtml } from '@/lib/wordpress';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Building2, 
  Scissors, 
  Award,
  Eye,
  AlertCircle,
  Phone,
  MessageCircle,
  DollarSign,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Authentic Curriculum Units of Competency from fca.edu.au & training.gov.au
const COURSE_UNITS_DATA: Record<string, { 
  core: Array<{ code: string; title: string; isCbsLicence?: boolean }>; 
  elective: Array<{ code: string; title: string; isCbsLicence?: boolean }>;
  cbsNotice?: string;
}> = {
  'CPC40120': {
    cbsNotice: 'Includes 6 units directly mapped to Consumer and Business Services (CBS) business knowledge requirements for obtaining a South Australian Building Work Contractor Licence.',
    core: [
      { code: 'CPCCBC4001', title: 'Apply building codes and standards to the construction process for Class 1 and 10 buildings', isCbsLicence: true },
      { code: 'CPCCBC4002', title: 'Manage occupational health and safety in the building and construction workplace', isCbsLicence: true },
      { code: 'CPCCBC4007', title: 'Plan building or construction work', isCbsLicence: true },
      { code: 'CPCCBC4008', title: 'Conduct on-site supervision of building and construction projects' },
      { code: 'CPCCBC4009', title: 'Apply legal requirements to building and construction projects', isCbsLicence: true },
      { code: 'CPCCBC4010', title: 'Apply structural principles to residential and commercial buildings' },
      { code: 'CPCCBC4012', title: 'Read and interpret plans and specifications' },
      { code: 'CPCCBC4014', title: 'Prepare simple building contracts and oversee claims', isCbsLicence: true },
      { code: 'CPCCBC4018', title: 'Apply site surveys and set-out procedures to building projects' },
      { code: 'CPCCBC4021', title: 'Minimise waste on the building and construction site' },
      { code: 'BSBPMG422', title: 'Apply project quality management techniques' }
    ],
    elective: [
      { code: 'CPCCBC4003', title: 'Select, prepare and administer construction contracts' },
      { code: 'CPCCBC4004', title: 'Identify and produce estimated costs for building and construction projects', isCbsLicence: true },
      { code: 'CPCCBC4005', title: 'Produce labour and material schedules for ordering' },
      { code: 'CPCCBC4006', title: 'Resolve business dispute problems in building work' },
      { code: 'CPCCBC4011', title: 'Apply structural principles to commercial buildings' },
      { code: 'CPCCBC4024', title: 'Resolve business issues for small building business', isCbsLicence: true },
      { code: 'BSBPMG420', title: 'Apply project risk management techniques' },
      { code: 'BSBWHS411', title: 'Implement and monitor WHS policies, procedures and programs' }
    ]
  },
  'CPC50220': {
    cbsNotice: 'Direct pathway to General Building Work Contractor & Supervisor Licensing for residential Class 1 & 10 (up to 3 storeys) and commercial Class 2 to 9 Type C and B constructions.',
    core: [
      { code: 'CPCCBC5001', title: 'Apply building codes and standards to the construction process for large building projects' },
      { code: 'CPCCBC5002', title: 'Monitor costing systems on complex building and construction projects' },
      { code: 'CPCCBC5003', title: 'Supervise the planning of on-site medium rise building work' },
      { code: 'CPCCBC5004', title: 'Supervise the structural integrity of high-rise building projects' },
      { code: 'CPCCBC5005', title: 'Select and manage building and construction contractors' },
      { code: 'CPCCBC5007', title: 'Administer the legal obligations of a building construction contract' },
      { code: 'CPCCBC5010', title: 'Manage construction work' },
      { code: 'CPCCBC5011', title: 'Manage environmental management systems for building projects' },
      { code: 'CPCCBC5018', title: 'Manage structural principles in the construction of medium rise buildings' },
      { code: 'BSBPMG532', title: 'Manage project quality in building management' },
      { code: 'BSBPMG538', title: 'Manage project risk across construction stages' }
    ],
    elective: [
      { code: 'CPCCBC5009', title: 'Identify services layout and connection methods for medium rise buildings' },
      { code: 'CPCCBC5012', title: 'Manage the tender process for building contracts' },
      { code: 'CPCCBC5013', title: 'Develop professional building dispute resolution strategies' }
    ]
  },
  'SHB30416': {
    cbsNotice: 'Accredited qualification delivering commercial salon competencies, haircut design, advanced chemical colour formulations, and client consultation on paying salon clients.',
    core: [
      { code: 'SHBHCUT001', title: 'Design haircut structures' },
      { code: 'SHBHCUT002', title: 'Create one length or solid haircut structures' },
      { code: 'SHBHCUT003', title: 'Create graduated haircut structures' },
      { code: 'SHBHCUT004', title: 'Create layered haircut structures' },
      { code: 'SHBHCUT005', title: 'Cut hair using over-comb techniques' },
      { code: 'SHBHCUT006', title: 'Create combined haircut structures' },
      { code: 'SHBHDES003', title: 'Create finished hair designs' },
      { code: 'SHBHCLS002', title: 'Colour and lighten hair' },
      { code: 'SHBHCLS003', title: 'Provide full and partial head highlighting' },
      { code: 'SHBHCLS004', title: 'Neutralise unwanted colours and tones' },
      { code: 'SHBHCLS005', title: 'Provide on-scalp full head and retouch bleach treatments' },
      { code: 'SHBHREF002', title: 'Straighten and relax hair with chemical treatments' },
      { code: 'SHBHTRI001', title: 'Identify and treat hair and scalp conditions' },
      { code: 'SHBXCCS001', title: 'Conduct salon financial transactions' },
      { code: 'SHBXCCS002', title: 'Provide service to salon clients' },
      { code: 'SHBXIND001', title: 'Comply with organizational requirements within a personal services environment' },
      { code: 'SHBXWHS001', title: 'Apply safe hygiene, health and work practices in personal services' }
    ],
    elective: [
      { code: 'SHBHBAS001', title: 'Provide shampoo and basin services' },
      { code: 'SHBHDES004', title: 'Create classic long hair updos' },
      { code: 'SHBHCUT007', title: 'Create combined traditional and classic men’s haircut structures' },
      { code: 'SHBXCCS004', title: 'Recommend salon products and hair care services' }
    ]
  },
  'SHB30516': {
    cbsNotice: 'Master classic and modern men’s barbering, precision skin fades, beard design, and traditional straight razor head and facial shaves inside FCA commercial barbershops.',
    core: [
      { code: 'SHBHCUT007', title: 'Create combined traditional and classic men’s haircut structures' },
      { code: 'SHBHCUT009', title: 'Cut hair using freehand clipper techniques and modern fades' },
      { code: 'SHBHCUT011', title: 'Design and maintain beards and moustaches' },
      { code: 'SHBHCUT012', title: 'Shave heads and faces using traditional straight razors' },
      { code: 'SHBHCUT013', title: 'Provide men’s head and neck relaxation massages' },
      { code: 'SHBHCUT001', title: 'Design haircut structures' },
      { code: 'SHBHCUT002', title: 'Create one length or solid haircut structures' },
      { code: 'SHBHCUT003', title: 'Create graduated haircut structures' },
      { code: 'SHBHCUT004', title: 'Create layered haircut structures' },
      { code: 'SHBHCUT005', title: 'Cut hair using over-comb techniques' },
      { code: 'SHBXWHS001', title: 'Apply safe hygiene, health and work practices' },
      { code: 'SHBXCCS002', title: 'Provide service to barbershop clients' }
    ],
    elective: [
      { code: 'SHBHBAS001', title: 'Provide shampoo and basin services' },
      { code: 'SHBXCCS001', title: 'Conduct barbershop financial transactions' },
      { code: 'SHBXCCS004', title: 'Recommend male grooming products and aftercare' }
    ]
  },
  'CHC30125': {
    cbsNotice: 'Includes 160 hours of mandatory supervised work placement in registered Australian early childhood education and care centers.',
    core: [
      { code: 'CHCECE030', title: 'Support children’s health, safety and wellbeing' },
      { code: 'CHCECE031', title: 'Support children’s emotional wellbeing' },
      { code: 'CHCECE032', title: 'Nurture babies and toddlers' },
      { code: 'CHCECE033', title: 'Develop positive and respectful relationships with children' },
      { code: 'CHCECE034', title: 'Use an approved learning framework to guide practice' },
      { code: 'CHCECE035', title: 'Support children to connect with their world' },
      { code: 'CHCECE036', title: 'Provide experiences to support children’s play and learning' },
      { code: 'CHCECE037', title: 'Support children’s learning and development' },
      { code: 'CHCPRP003', title: 'Reflect on and improve own professional practice' },
      { code: 'HLTAID012', title: 'Provide First Aid in an education and care setting' }
    ],
    elective: [
      { code: 'CHCECE042', title: 'Respond to children and young people at risk' },
      { code: 'CHCECE043', title: 'Work effectively with Aboriginal and Torres Strait Islander peoples' }
    ]
  },
  'CHC52025': {
    cbsNotice: 'Includes 200 hours of mandatory community service placement across family services, emergency relief, crisis intervention, or youth advocacy organizations.',
    core: [
      { code: 'CHCCCS007', title: 'Develop and implement service programs' },
      { code: 'CHCCCS019', title: 'Assess and respond to individuals at risk of suicide or crisis' },
      { code: 'CHCCSM005', title: 'Develop, facilitate and review all aspects of case management' },
      { code: 'CHCDIV003', title: 'Manage and promote diversity in community work' },
      { code: 'CHCLEG003', title: 'Manage legal and ethical compliance in community service delivery' },
      { code: 'CHCPRP003', title: 'Reflect on and improve own professional practice' },
      { code: 'HLTWHS004', title: 'Manage work health and safety in community services' }
    ],
    elective: [
      { code: 'CHCADV002', title: 'Provide advocacy and representation for vulnerable clients' },
      { code: 'CHCCCS004', title: 'Assess co-existing needs of clients' },
      { code: 'CHCCCS023', title: 'Support independence and community wellbeing' }
    ]
  }
};

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDB();

  const courseRes = await db.query('SELECT * FROM courses WHERE slug = $1 LIMIT 1', [slug]);
  if (courseRes.rows.length > 0) {
    const course = courseRes.rows[0];
    return {
      title: `${course.title} (${course.code}) | Fran Capelli Academy`,
      description: course.overview?.slice(0, 160),
      alternates: {
        canonical: `https://www.fca.edu.au/courses/${course.slug}`
      }
    };
  }

  const categories: Record<string, string> = {
    'hairdressing': 'Hairdressing Courses & Apprenticeships',
    'barbering': 'Barbering & Men\'s Grooming Qualifications',
    'building-construction': 'Building & Construction Courses | Builder Licence Pathways',
    'early-childhood-education-care': 'Early Childhood Education & Care Qualifications',
    'community-services': 'Community Services & Case Management Diplomas'
  };

  if (categories[slug]) {
    return {
      title: `${categories[slug]} | Fran Capelli Academy`,
      description: `Study accredited ${categories[slug]} with Fran Capelli Academy (RTO # 6055). Government funding options available.`
    };
  }

  return { title: 'Courses | Fran Capelli Academy' };
}

export default async function CourseOrCategoryPage({ params, searchParams }: CoursePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreviewRequested = query?.preview === 'true';
  const admin = await getCurrentAdmin();
  const showPreview = isPreviewRequested && !!admin;

  const db = await getDB();

  // Known Category Slugs
  const knownCategories: Record<string, { name: string; heroImage: string; description: string }> = {
    'hairdressing': {
      name: 'Hairdressing',
      heroImage: '/images/fca/courses/hairdressing-hero.png',
      description: 'Prepare for high-end boutique salons, session styling, and salon ownership with our Certificate III Hairdressing qualifications in Melbourne and Adelaide.'
    },
    'barbering': {
      name: 'Barbering',
      heroImage: '/images/fca/courses/building-plans.png',
      description: 'Master precision skin fades, beard sculpts, and traditional wet razor shaving under Australian master barbers.'
    },
    'building-construction': {
      name: 'Building & Construction',
      heroImage: '/images/fca/real-trades-hero.jpg',
      description: 'The recognised educational pathway to obtaining your South Australian Building Work Contractor Licence through Consumer and Business Services (CBS).'
    },
    'early-childhood-education-care': {
      name: 'Early Childhood Education & Care',
      heroImage: '/images/fca/courses/childhood-care.png',
      description: 'Become a certified early childhood educator with 160 hours of real childcare center practicum across Australia.'
    },
    'community-services': {
      name: 'Community Services',
      heroImage: '/images/fca/courses/community-chc52025.jpg',
      description: 'Learn crisis intervention, case management, and advocacy to support individuals and families across community welfare sectors.'
    }
  };

  // 1. CATEGORY VIEW
  if (knownCategories[slug]) {
    const cat = knownCategories[slug];
    const catCoursesRes = await db.query('SELECT * FROM courses WHERE category_slug = $1 ORDER BY id ASC', [slug]);
    const catCourses = catCoursesRes.rows;

    return (
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Category Hero Banner with Course-Related Background Image (No side image) */}
          <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="absolute inset-0 pointer-events-none -z-0">
              <Image
                src={cat.heroImage}
                alt={cat.name}
                fill
                className="object-cover object-center opacity-30 brightness-[1.02] saturate-[0.85]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/92" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/95" />
            </div>
            <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                Course Category
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                {cat.name} Qualifications
              </h1>
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
                {cat.description}
              </p>
              <div className="pt-2">
                <Link
                  href="/courses"
                  className="text-sm font-bold text-fca-green hover:underline inline-flex items-center gap-1.5"
                >
                  ← Back to All Courses
                </Link>
              </div>
            </div>
          </div>

          {/* Courses in this Category */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Available Qualifications in {cat.name}
              </h2>
              <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {catCourses.length} Approved Programs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {catCourses.map((c) => (
                <div key={c.id} className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                        {c.code}
                      </span>
                      {c.is_funded_sa && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          Skills SA Subsidised ($0.50/hr)
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 leading-snug">{c.title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed">{c.overview}</p>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-sm">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-xs font-medium">Duration:</span>
                        <strong className="text-slate-900">{c.duration}</strong>
                      </div>
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                        <span className="text-emerald-800 block text-xs font-medium">Subsidised Fee:</span>
                        <strong className="text-emerald-950">{c.subsidised_fee || 'On Inquiry'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/courses/${c.slug}`}
                      className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl text-base font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-sm group"
                    >
                      <span>View Full Syllabus & Requirements</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. INDIVIDUAL COURSE VIEW
  const courseRes = await db.query('SELECT * FROM courses WHERE slug = $1 LIMIT 1', [slug]);
  if (courseRes.rows.length === 0) {
    notFound();
  }

  let course = courseRes.rows[0];

  // If admin preview is active and draft_data exists, merge draft changes
  let isDraftPreviewing = false;
  if (showPreview && course.has_draft && course.draft_data) {
    try {
      const draftObj = JSON.parse(course.draft_data);
      course = { ...course, ...draftObj };
      isDraftPreviewing = true;
    } catch (e) {
      console.error('Failed to parse draft_data for course:', e);
    }
  }

  // Check if WordPress has live edits for this course
  const wpPost = await getWpPostBySlug(slug);
  if (wpPost && !isDraftPreviewing) {
    if (wpPost.title) course.title = wpPost.title;
    if (wpPost.content) {
      course = parseCourseFromWpHtml(wpPost.content, course);
      course.wp_content = wpPost.content;
    }
  }

  const outcomes = JSON.parse(course.career_outcomes || '[]');
  const states = JSON.parse(course.states_available || '[]');
  const faqs = JSON.parse(course.faqs || '[]');

  // Match Curriculum units
  const unitsData = COURSE_UNITS_DATA[course.code] || null;

  // Real course-related background image
  let courseBgImage = course.image_url || course.featured_image;
  if (course.code === 'CPC40120' || course.code === 'CPC50220') {
    courseBgImage = '/images/fca/real-trades-hero.jpg';
  } else if (course.code === 'SHB30416') {
    courseBgImage = '/images/fca/courses/hairdressing-hero.png';
  } else if (course.code === 'SHB30516') {
    courseBgImage = '/images/fca/courses/building-plans.png';
  } else if (course.code === 'CHC30125') {
    courseBgImage = '/images/fca/courses/childhood-care.png';
  } else if (course.code === 'CHC52025') {
    courseBgImage = '/images/fca/courses/community-chc52025.jpg';
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      {/* Draft Preview Alert */}
      {isDraftPreviewing && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-inner mb-6 max-w-7xl mx-auto rounded-xl">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>
              <strong>Course Draft Preview:</strong> You are viewing uncommitted edits (e.g. updated fees, syllabus or notes). Regular visitors see the live published version.
            </span>
          </div>
          <Link 
            href={`/admin/courses/${course.id}/edit`}
            className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Editor
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-fca-green">Home</Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-fca-green">Courses</Link>
          <span>/</span>
          <Link href={`/courses/${course.category_slug}`} className="hover:text-fca-green">{course.category_name}</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{course.code}</span>
        </nav>

        {/* Top Hero Card with Course-Related Background Image (No side image) */}
        <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="absolute inset-0 pointer-events-none -z-0">
            <Image
              src={courseBgImage || '/images/fca/real-trades-hero.jpg'}
              alt={course.title}
              fill
              className="object-cover object-center opacity-30 brightness-[1.02] saturate-[0.85]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/92" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/95" />
          </div>
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-4xl space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                {course.code}
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-fca-green border border-emerald-200">
                {course.category_name}
              </span>
              {course.is_funded_sa && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                  Skills SA Subsidised (from $0.50/hr)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl">
              {course.overview}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/contact"
                className="font-bold px-7 py-3.5 rounded-xl text-white bg-fca-green hover:bg-fca-green-dark transition-all duration-200 shadow-md text-base"
              >
                Enrol in this Course
              </Link>
              <Link
                href="/south-australia-funding"
                className="font-bold px-7 py-3.5 rounded-xl text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all text-base"
              >
                Check Funding Eligibility
              </Link>
              <a
                href="tel:0871371433"
                className="inline-flex items-center gap-2 font-bold px-5 py-3.5 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-base"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Call 08 7137 1433</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Facts Matrix Banner (Removes blank paper feel) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Duration</span>
            </div>
            <p className="text-base font-extrabold text-slate-900">{course.duration}</p>
            <p className="text-xs text-slate-500">Structured delivery model</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Competency Units</span>
            </div>
            <p className="text-base font-extrabold text-slate-900">{course.units_count} Units</p>
            <p className="text-xs text-slate-500">Nationally Recognised</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Government Subsidy</span>
            </div>
            <p className="text-base font-extrabold text-emerald-700">{course.subsidised_fee || '$0.50 / hr'}</p>
            <p className="text-xs text-slate-500">Skills SA Approved</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>RTO Accreditation</span>
            </div>
            <p className="text-base font-extrabold text-slate-900">ASQA RTO # 6055</p>
            <p className="text-xs text-slate-500">Australian Qualifications Framework</p>
          </div>
        </div>

        {/* Detailed Sections: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Course Content (Col 8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* WordPress Live Content if available */}
            {course.wp_content && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                    WordPress Live Content
                  </span>
                </div>
                <div 
                  className="prose prose-slate max-w-none text-base text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: course.wp_content }} 
                />
              </div>
            )}

            {/* Government Funding & Subsidies Breakdown Card */}
            <div className="bg-white rounded-3xl border border-emerald-200/90 p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Government Funding Breakdown
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  RTO # 6055 Subsidised Delivery
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Skills SA Tuition Fee Schedule & Government Contributions
              </h2>
              <p className="text-slate-700 text-base leading-relaxed">
                Eligible South Australian residents who meet citizenship or permanent residency criteria can access Skills SA subsidised tuition. The South Australian Government covers the majority of the tuition cost, leaving only a minor student contribution:
              </p>

              {/* Fee Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Subsidised Student Contribution</span>
                  <div className="text-3xl font-extrabold text-emerald-950">{course.subsidised_fee || 'Fee on inquiry'}</div>
                  <p className="text-xs text-emerald-800 pt-1">
                    Funded at <strong>$0.50 per nominal training hour</strong> under Skills SA.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Standard Full Fee (Non-Subsidised)</span>
                  <div className="text-3xl font-extrabold text-slate-900">{course.standard_fee || '$5,800 Full Fee'}</div>
                  <p className="text-xs text-slate-500 pt-1">
                    Applicable to interstate and full-fee paying candidates.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed">
                <strong>Participant Eligibility Note:</strong> Eligibility criteria apply to South Australian Government subsidised training. Course availability, funding conditions, and concession eligibility must be confirmed before enrolment.
              </div>
            </div>

            {/* Curriculum Units of Competency (Training Package) */}
            {unitsData && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    National Curriculum
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    Total: {unitsData.core.length + unitsData.elective.length} Units
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Units of Competency ({course.code})
                  </h2>
                  {unitsData.cbsNotice && (
                    <div className="mt-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 font-medium">
                      🏛️ <strong>Licensing Alignment:</strong> {unitsData.cbsNotice}
                    </div>
                  )}
                </div>

                {/* Core Units */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Core Units ({unitsData.core.length} Units)</span>
                  </h3>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {unitsData.core.map((u, i) => (
                      <div key={i} className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-sm">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {u.code}
                          </span>
                          <p className="text-slate-800 font-medium mt-1">{u.title}</p>
                        </div>
                        {u.isCbsLicence && (
                          <span className="shrink-0 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            CBS Licence Unit
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Elective Units */}
                {unitsData.elective.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Elective Units ({unitsData.elective.length} Units)</span>
                    </h3>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                      {unitsData.elective.map((u, i) => (
                        <div key={i} className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-sm">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {u.code}
                            </span>
                            <p className="text-slate-800 font-medium mt-1">{u.title}</p>
                          </div>
                          {u.isCbsLicence && (
                            <span className="shrink-0 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              CBS Licence Unit
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Mode & Campus Practical Training */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Delivery Format
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Delivery Mode & Practical Hands-on Training
              </h2>
              <div className="space-y-4 text-base text-slate-700 leading-relaxed">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Real-Time Virtual Lectures & Site Practicums:</span>
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {course.delivery_mode}
                  </p>
                  <p className="text-xs text-slate-500 pt-1">
                    Evening online webinars allow working trades and salon apprentices to complete theoretical units without taking time off during the work day.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>Dedicated Campus Facilities:</span>
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                    <li><strong>South Australia:</strong> Mawson Lakes Campus (1-3 Metro Parade, Mawson Lakes SA 5095) with dedicated construction site simulations and student salons.</li>
                    <li><strong>Victoria:</strong> Hawthorn Campus (355 Burwood Road, Hawthorn VIC 3122) active high-street commercial salon and workshop.</li>
                    <li><strong>ACT & WA:</strong> Canberra & Perth blended delivery hubs with arranged workplace visits.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Admission Requirements & LLND */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Admission Criteria
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Entry Requirements & Enrolment Process
              </h2>
              <div className="space-y-3 text-base text-slate-700 leading-relaxed">
                <p>
                  There are no mandatory formal prerequisites for entry into this qualification ({course.prerequisite}).
                </p>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                  <strong className="text-slate-900 block font-bold">Standard Enrolment Suitability Process:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    All applicants complete a <strong>Pre-Training Review (PTR)</strong> (Upfront Assessment of Need), a <strong>Language, Literacy, Numeracy & Digital (LLND) assessment</strong>, and an enrolment form. This verifies course suitability, explores Recognition of Prior Learning (RPL) or Credit Transfers, and ensures optimal student support throughout training.
                  </p>
                </div>
              </div>
            </div>

            {/* Career Outcomes & Contractor Licensing */}
            {outcomes.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Career Pathways
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  Vocational Outcomes & Licensing Opportunities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {outcomes.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-base font-bold text-slate-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course FAQs */}
            {faqs.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-fca-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Common Inquiries
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq: { question: string; answer: string }, idx: number) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 text-base flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-slate-600 text-base leading-relaxed pl-6">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar (Col 4) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* High-Converting Tuition Fee Card */}
            <div className="bg-gradient-to-br from-[#00381e] via-[#00512C] to-[#072418] text-white rounded-3xl p-7 shadow-xl space-y-5 border border-emerald-700/60">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-600">
                Tuition & Subsidy
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Skills SA Subsidised Contribution:</p>
                <p className="text-3xl font-black text-white">{course.subsidised_fee || 'Fee on inquiry'}</p>
                {course.standard_fee && (
                  <p className="text-xs text-emerald-300/80 pt-1">Standard Full Fee: {course.standard_fee}</p>
                )}
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed pt-2 border-t border-emerald-700/60">
                Government subsidised funding applies to eligible South Australian citizens, PRs and approved visa holders.
              </p>
              
              <div className="space-y-2.5 pt-2">
                <Link
                  href="/contact"
                  className="block text-center w-full py-3.5 rounded-xl bg-white text-emerald-950 font-black text-base hover:bg-emerald-50 transition-colors shadow-md"
                >
                  Apply for This Course
                </Link>
                <a
                  href="tel:0871371433"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-sm transition-colors border border-emerald-600"
                >
                  <Phone className="w-4 h-4 text-emerald-300" />
                  <span>Call 08 7137 1433</span>
                </a>
                <a
                  href="https://wa.me/61413826320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors border border-emerald-600"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>WhatsApp Enquiries</span>
                </a>
              </div>
            </div>

            {/* Campus Delivery Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span>Available Delivery Hubs</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Delivered across registered campuses and flexible virtual classrooms:
              </p>
              <div className="space-y-2 text-xs">
                {states.includes('SA') && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-bold text-emerald-950">
                    <span>Mawson Lakes SA Campus</span>
                    <Link href="/south-australia-funding" className="text-emerald-700 hover:underline">View Portal →</Link>
                  </div>
                )}
                {states.includes('VIC') && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-medium text-slate-800">
                    <span>Melbourne Campuses (Hawthorn & Coolaroo)</span>
                    <Link href="/fran-capelli-academy-vic" className="text-fca-green hover:underline">VIC →</Link>
                  </div>
                )}
                {states.includes('ACT') && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-medium text-slate-800">
                    <span>Canberra Delivery Hub</span>
                    <Link href="/fran-capelli-academy-australiacapitalterritory" className="text-fca-green hover:underline">ACT →</Link>
                  </div>
                )}
                {states.includes('WA') && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-medium text-slate-800">
                    <span>Perth Blended Service Area</span>
                    <Link href="/fran-capelli-academy-wa" className="text-fca-green hover:underline">WA →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
