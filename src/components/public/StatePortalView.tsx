'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Scissors, 
  GraduationCap, 
  Baby, 
  HeartHandshake, 
  FileText, 
  ChevronDown, 
  HelpCircle,
  ExternalLink,
  Calendar,
  Award,
  Check,
  Download
} from 'lucide-react';

export interface StatePortalData {
  stateCode: 'SA' | 'VIC' | 'ACT' | 'WA';
  stateName: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  accentBadge: string;
  campusTitle: string;
  campusAddress: string;
  secondaryCampus?: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  fundingHeadline: string;
  fundingDescription: string;
  fundingFeatures: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  coursesTitle: string;
  coursesSubtitle: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const STATE_CONFIGS: Record<string, StatePortalData> = {
  SA: {
    stateCode: 'SA',
    stateName: 'South Australia',
    heroHeading: 'Skills SA Subsidised Training & Builder Licence Pathways in South Australia',
    heroSubheading: 'Study nationally recognised vocational qualifications in Mawson Lakes. Eligible South Australian students access government subsidised courses from $0.50 per nominal hour, plus consumer-approved builder contractor licence courses.',
    heroImage: '/images/fca/courses/building-plans.png',
    accentBadge: 'Skills SA Approved Provider • RTO # 6055',
    campusTitle: 'Mawson Lakes Commercial Campus & Training Salon',
    campusAddress: '1-3 Metro Parade, Mawson Lakes, South Australia, 5095 (Opposite Train Station)',
    phone: '08 7137 1433 / 08 8166 0140',
    whatsapp: '+61 413 826 320',
    email: 'enquiries@fca.edu.au',
    hours: 'Monday – Friday: 8:30 AM – 5:00 PM | Evening Virtual Lectures',
    fundingHeadline: 'South Australian Government Subsidised Training (Skills SA)',
    fundingDescription: 'Eligible South Australian citizens and permanent residents can access government-subsidised tuition through Fran Capelli Academy. The SA Government contributes directly towards course delivery costs, significantly lowering upfront student fees.',
    fundingFeatures: [
      {
        title: 'Subsidised Course Fees from $0.50/Hour',
        description: 'Eligible students pay as little as $446 total contribution for high-demand Certificate IV qualifications under the Skills SA program.',
        icon: 'Sparkles'
      },
      {
        title: 'CBS Builder Contractor Licence Approved',
        description: 'Includes 6 units directly mapped to Consumer and Business Services (CBS) business knowledge criteria for residential builder licensing.',
        icon: 'Award'
      },
      {
        title: 'Active Commercial Training Salon',
        description: 'Hands-on hair, barbering, and scalp treatment practicums performed on real paying clients inside our Metro Parade salon.',
        icon: 'Scissors'
      }
    ],
    coursesTitle: 'Accredited South Australia Qualifications',
    coursesSubtitle: 'Nationally accredited certificates and diplomas approved for delivery and government subsidies across South Australia.',
    faqs: [
      {
        question: 'How does Skills SA Government Subsidised Funding work?',
        answer: 'Eligible South Australian residents who meet citizenship or permanent residency criteria can access Skills SA subsidised courses. The government covers the majority of the tuition cost, leaving only a minor student contribution (e.g. $446 for CPC40120).'
      },
      {
        question: 'Does your building qualification meet SA CBS Builder Licence criteria?',
        answer: 'Yes. Our CPC40120 Certificate IV in Building and Construction includes the 6 specific units recognized by Consumer and Business Services (CBS) for obtaining a South Australian Building Work Contractor Licence.'
      },
      {
        question: 'Where is the Mawson Lakes campus located and is parking available?',
        answer: 'Our campus is located at 1-3 Metro Parade, Mawson Lakes SA 5095, directly opposite the Mawson Lakes transport interchange with ample student parking and frequent express trains from Adelaide CBD.'
      },
      {
        question: 'Can I study construction while working on site during the day?',
        answer: 'Yes! We run flexible evening virtual classes in real-time with licensed construction managers, so active tradespeople can maintain full-time jobs on building sites without missing lectures.'
      },
      {
        question: 'Are Fran Capelli Academy qualifications valid outside South Australia?',
        answer: 'Yes. Fran Capelli Academy is a nationally Registered Training Organisation (RTO # 6055) accredited by the Australian Skills Quality Authority (ASQA). All certificates are recognized in all Australian states and territories.'
      }
    ]
  },
  VIC: {
    stateCode: 'VIC',
    stateName: 'Victoria',
    heroHeading: "Victoria's Premier Academy for Hairdressing, Barbering & Construction in Melbourne",
    heroSubheading: 'Master high-end salon crafts and builder trade qualifications in Hawthorn and Coolaroo. Experience hands-on client appointments in our commercial salon and take advantage of Victorian apprenticeship incentives.',
    heroImage: '/images/fca/courses/hairdressing-salon.png',
    accentBadge: 'Melbourne Campus & Commercial Salon • RTO # 6055',
    campusTitle: 'Hawthorn Commercial Campus & Student Salon',
    campusAddress: '355 Burwood Road, Hawthorn, VIC 3122 (Near Glenferrie Station)',
    secondaryCampus: 'Coolaroo Trade Campus: G01, 1510 Pascoe Vale Road, Coolaroo, VIC 3048',
    phone: '03 9818 0089',
    whatsapp: '+61 413 826 320',
    email: 'info@fca.edu.au',
    hours: 'Monday – Friday: 9:00 AM – 5:30 PM | Salon Open To Public',
    fundingHeadline: 'Victorian Apprenticeship Pathways & Hands-on Salon Training',
    fundingDescription: 'Fran Capelli Academy Victoria connects aspiring stylists, barbers, builders, and early educators with registered Victorian employers. We combine commercial high-street training salons with flexible evening trade delivery.',
    fundingFeatures: [
      {
        title: 'High-Street Commercial Salon in Hawthorn',
        description: 'Cut, colour, and style real paying salon clients from day one under the guidance of master session stylists on Burwood Road.',
        icon: 'Scissors'
      },
      {
        title: 'Victorian Apprenticeship Support',
        description: 'Structured block-release and day-release programs designed with Victorian salon owners and builders for apprentice retention.',
        icon: 'Award'
      },
      {
        title: 'Dual Melbourne Campuses (East & North)',
        description: 'Easily accessible campuses in Hawthorn (inner east) and Coolaroo (northern suburbs) plus regional delivery across Geelong.',
        icon: 'Building2'
      }
    ],
    coursesTitle: 'Accredited Victoria Qualifications',
    coursesSubtitle: 'Industry-designed Certificates and Diplomas available for apprenticeship, full-time salon, or flexible virtual study in Victoria.',
    faqs: [
      {
        question: 'Where is the Melbourne Hawthorn campus located?',
        answer: 'Our main Victorian campus and commercial student salon is at 355 Burwood Road, Hawthorn VIC 3122, just a 3-minute walk from Glenferrie Train Station in the heart of Melbourne’s bustling student district.'
      },
      {
        question: 'Can the public book hair and barber appointments at the Hawthorn salon?',
        answer: 'Yes! Our commercial training salon is open to the public for haircuts, advanced colouring, treatments, and traditional wet razor shaving performed by senior students supervised by master educators.'
      },
      {
        question: 'How do hairdressing apprenticeships work in Victoria?',
        answer: 'If you are employed as an apprentice in a Victorian salon, FCA delivers your formal qualification (SHB30416) via flexible day-release or blended salon visits, ensuring compliance with Victorian training contracts.'
      },
      {
        question: 'Do you offer building qualifications in Melbourne?',
        answer: 'Yes. We deliver CPC40120 Certificate IV in Building & Construction and CPC50220 Diploma with flexible evening virtual theory and practical site assessments.'
      },
      {
        question: 'What childcare qualification do you offer in Victoria?',
        answer: 'We deliver the nationally accredited CHC30125 Certificate III in Early Childhood Education and Care, including 160 hours of mandatory workplace practicum in accredited Victorian early learning centres.'
      }
    ]
  },
  ACT: {
    stateCode: 'ACT',
    stateName: 'ACT (Canberra)',
    heroHeading: 'ACT User Choice Funded Apprenticeships & Flexible Virtual Trade Classrooms',
    heroSubheading: 'Study accredited qualifications funded through the ACT Government User Choice program. High-retention apprentice pathways in Hairdressing, Barbering, and Building with evening virtual classrooms and Canberra assessor visits.',
    heroImage: '/images/fca/courses/building-cpc40120.png',
    accentBadge: 'ACT User Choice Approved • RTO # 6055',
    campusTitle: 'Canberra Regional Delivery Hub & Virtual Academy',
    campusAddress: 'Level 5, 15 Moore Street, Canberra City, ACT 2601',
    phone: '03 9818 0089',
    whatsapp: '+61 413 826 320',
    email: 'enquiries@fca.edu.au',
    hours: 'Monday – Friday: 9:00 AM – 5:00 PM | Evening Virtual Sessions',
    fundingHeadline: 'ACT Government User Choice Apprenticeship Funding',
    fundingDescription: 'The ACT Government User Choice program contributes towards the cost of training for eligible apprentices and trainees who are registered in an ACT training contract. FCA delivers structured off-the-job training aligned with industry.',
    fundingFeatures: [
      {
        title: 'ACT User Choice Program Subsidies',
        description: 'Government funding covers significant course costs for eligible apprentices employed across Canberra and surrounding ACT districts.',
        icon: 'Sparkles'
      },
      {
        title: 'Interactive Evening Virtual Classes',
        description: 'Tradespeople and builders attend interactive virtual lectures 6:00 PM - 9:00 PM without sacrificing day hours on active sites.',
        icon: 'Building2'
      },
      {
        title: 'Dedicated Canberra Assessor Visits',
        description: 'Certified industry trainers conduct regular on-site apprentice competency checks and mentor reviews across Canberra salons and job sites.',
        icon: 'Award'
      }
    ],
    coursesTitle: 'Accredited ACT Qualifications',
    coursesSubtitle: 'Government approved apprenticeships and flexible certificates delivered for ACT students and employers.',
    faqs: [
      {
        question: 'How do ACT User Choice funded apprenticeships work?',
        answer: 'When an ACT employer hires an apprentice, they nominate Fran Capelli Academy (RTO # 6055) as the Supervising Registered Training Organisation. The ACT Government subsidises the qualification tuition directly.'
      },
      {
        question: 'Do Canberra students have to travel to Melbourne or Adelaide?',
        answer: 'No. ACT building students complete theory through our interactive real-time virtual classrooms, and salon apprentices receive regular workplace visits from FCA educators right inside their Canberra salons.'
      },
      {
        question: 'Is CPC40120 recognised for building contractor registration in ACT?',
        answer: 'Yes. CPC40120 Certificate IV in Building and Construction is the national educational benchmark across Australia, including the ACT Planning and Land Authority (ACTPLA) licensing prerequisites.'
      },
      {
        question: 'How often are virtual trade lectures held?',
        answer: 'Classes are held on set weekday evenings (typically 6:00 PM to 9:00 PM AEST), featuring live lecturer interaction, architectural plan analysis, and peer discussions.'
      }
    ]
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Western Australia',
    heroHeading: 'Nationally Accredited Vocational Qualifications & Blended Delivery in WA',
    heroSubheading: 'Flexible distance learning paired with Perth regional support and workplace practical validations. Earn nationally recognized ASQA qualifications in Building, Salon Trades, and Early Childhood Education.',
    heroImage: '/images/fca/courses/childhood-chc30125.png',
    accentBadge: 'WA Blended Delivery Hub • RTO # 6055',
    campusTitle: 'Perth Regional Support Center & Online Learning Hub',
    campusAddress: 'Perth Hub & Western Australia Student Resource Centre (Perth CBD / Online)',
    phone: '03 9818 0089',
    whatsapp: '+61 413 826 320',
    email: 'enquiries@fca.edu.au',
    hours: 'Monday – Friday: 8:00 AM – 5:00 PM AWST',
    fundingHeadline: 'Flexible Blended Learning & Workplace Practicums Across WA',
    fundingDescription: 'Fran Capelli Academy enables students throughout Perth, Fremantle, Joondalup, and regional Western Australia to study accredited Australian qualifications with online flexibility and dedicated mentor oversight.',
    fundingFeatures: [
      {
        title: '100% Online Theory Flexibility',
        description: 'Access digital course materials, recorded lectures, and digital plan reading 24/7 from anywhere in Western Australia.',
        icon: 'Sparkles'
      },
      {
        title: 'Local Workplace Practicum Validation',
        description: 'Complete hands-on practical logbooks in registered WA childcare centers, commercial salons, or active residential construction sites.',
        icon: 'Award'
      },
      {
        title: 'National ASQA Recognition in WA',
        description: 'Every certificate and diploma issued by FCA (RTO # 6055) is legally recognized by WA employers and regulatory licensing bodies.',
        icon: 'Building2'
      }
    ],
    coursesTitle: 'Accredited Western Australia Qualifications',
    coursesSubtitle: 'Nationally accredited certificates available for blended distance learning with Perth mentor support.',
    faqs: [
      {
        question: 'How does blended delivery work for Western Australian students?',
        answer: 'You access theoretical learning, building code analyses, and quizzes via our modern student portal, accompanied by live evening webinars. Practical competencies are validated through video submissions and on-the-job workplace supervisor sign-offs.'
      },
      {
        question: 'Are FCA certificates recognized by employers in Perth?',
        answer: 'Yes. As a Registered Training Organisation (RTO # 6055) regulated by ASQA, Fran Capelli Academy awards qualifications under the Australian Qualifications Framework (AQF), recognized throughout Western Australia.'
      },
      {
        question: 'Can I do my early childhood practicum in a Perth childcare center?',
        answer: 'Yes! The 160 hours of mandatory work placement for CHC30125 Certificate III can be completed in any registered, accredited early childhood education center in Perth or regional WA.'
      },
      {
        question: 'What time zone are live webinars scheduled in?',
        answer: 'Our evening webinars are scheduled to accommodate AWST and AEST hours, allowing WA tradespeople to join after wrapping up on site.'
      }
    ]
  }
};

interface StatePortalViewProps {
  stateCode: 'SA' | 'VIC' | 'ACT' | 'WA';
  pageOverride?: {
    hero_heading?: string;
    hero_subheading?: string;
    hero_image?: string;
    content_html?: string;
  };
  courses: any[];
  localAreas: any[];
}

export default function StatePortalView({
  stateCode,
  pageOverride,
  courses,
  localAreas
}: StatePortalViewProps) {
  const config = STATE_CONFIGS[stateCode] || STATE_CONFIGS.SA;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const cpc40120 = courses.find(c => c.code === 'CPC40120');
  const cpc50220 = courses.find(c => c.code === 'CPC50220');

  const filteredCourses = courses.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'BUILDING') {
      return c.category_slug?.includes('building') || c.category_name?.toLowerCase().includes('building') || c.code?.startsWith('CPC');
    }
    if (selectedCategory === 'HAIR') {
      return c.category_slug?.includes('hair') || c.category_slug?.includes('barber') || c.code?.startsWith('SHB');
    }
    if (selectedCategory === 'CARE') {
      return c.category_slug?.includes('child') || c.category_slug?.includes('community') || c.code?.startsWith('CHC');
    }
    return true;
  });

  const heroHeading = pageOverride?.hero_heading || config.heroHeading;
  const heroSubheading = pageOverride?.hero_subheading || config.heroSubheading;
  const heroImage = pageOverride?.hero_image || config.heroImage;

  return (
    <div className="bg-transparent min-h-screen">
      {/* Main State Hero */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        {/* Real Course-Related Photography Background in Hero Section (No side image) */}
        <div className="absolute inset-0 pointer-events-none -z-0">
          <Image
            src={heroImage || config.heroImage || '/images/fca/real-trades-hero.jpg'}
            alt={heroHeading}
            fill
            className="object-cover object-center opacity-30 brightness-[1.02] saturate-[0.85]"
            priority
          />
          {/* Soft Light Gradient Overlays (real image softly visible, text 100% crisp) */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/88 to-white/92" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/95" />
          {/* Delicate Ambient Tint */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-100/35 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-100/25 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{config.accentBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl">
            {heroHeading}
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
            {heroSubheading}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#courses-section"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-fca-green hover:bg-fca-green-dark shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore {config.stateName} Courses</span>
            </a>
            <a
              href={`tel:${config.phone.replace(/[^0-9]/g, '').slice(0, 10)}`}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Call {config.phone.split('/')[0].trim()}</span>
            </a>
            <a
              href={`https://wa.me/61413826320`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <span>WhatsApp Enquiries</span>
            </a>
          </div>

          {/* Campus Micro Bar */}
          <div className="pt-4 border-t border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1.5 max-w-3xl">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">{config.campusTitle}:</strong> {config.campusAddress}
                {config.secondaryCampus && (
                  <div className="text-xs text-slate-500 mt-0.5">{config.secondaryCampus}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{config.hours}</span>
            </div>
          </div>
        </div>
      </section>

      {/* State Funding & Key Highlights Section */}
      <section className="py-12 sm:py-16 bg-white/40 backdrop-blur-sm border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Government Funding & Accreditations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {config.fundingHeadline}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              {config.fundingDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.fundingFeatures.map((feat, idx) => (
              <div 
                key={idx}
                className="bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold mb-4">
                    {idx === 0 ? <Sparkles className="w-6 h-6 text-emerald-700" /> : idx === 1 ? <Award className="w-6 h-6 text-emerald-700" /> : <Building2 className="w-6 h-6 text-emerald-700" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 min-h-[3.25rem] flex items-start">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mt-2">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* South Australia Dedicated Building & Construction Showcase (CBS Builder Licence & Skills SA) - Light Aesthetic */}
      {stateCode === 'SA' && (
        <section className="py-14 bg-white/70 backdrop-blur-md border-y border-emerald-200/80 text-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-900 border border-emerald-300/80">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>SA Consumer &amp; Business Services (CBS) Pathway</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Building &amp; Construction in South Australia
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Study government-subsidised qualifications through Fran Capelli Academy with flexible real-time evening virtual classes. Designed for working tradespeople seeking a South Australian Building Work Contractor Licence.
              </p>
            </div>

            {/* Side-by-Side Building Qualifications Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1: CPC40120 */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-300/80 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-700 text-white">
                      CPC40120
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Skills SA Subsidised: $0.50 / hr
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 min-h-[3.75rem] flex items-start">
                    Certificate IV in Building and Construction
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed min-h-[4.5rem]">
                    The premier qualification for tradespeople wanting to become licensed residential builders and site supervisors. Includes 6 units specifically aligned with CBS business knowledge criteria.
                  </p>

                  {/* Fee Highlight Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-600 font-medium">Student Contribution Fee:</span>
                      <span className="text-2xl font-black text-emerald-800">
                        {cpc40120?.subsidised_fee?.split('*')[0]?.trim() || '$446'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Standard Full Fee: <s className="text-slate-500">$5,800</s></span>
                      <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">You Save $5,354+</span>
                    </div>
                  </div>

                  {/* Course Details Checklist */}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Duration:</strong> 36 Weeks (excluding holidays)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Units:</strong> 19 Units (11 Core + 8 Elective)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Licence:</strong> CBS Building Work Contractor Licence Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Delivery:</strong> Real-time Evening Virtual Lectures + Adelaide Campus</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 relative z-10">
                  <Link
                    href={`/courses/${cpc40120?.slug || 'cpc40120-certificate-iv-in-building-and-construction'}`}
                    className="flex-1 text-center py-3.5 px-4 rounded-xl font-bold text-sm bg-fca-green hover:bg-fca-green-dark text-white transition-colors shadow-md"
                  >
                    View CPC40120 Syllabus &amp; Enrol
                  </Link>
                  <a
                    href="https://wa.me/61413826320?text=Hi%20I%20am%20interested%20in%20CPC40120%20Building%20Course%20in%20South%20Australia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-4 rounded-xl font-semibold text-xs text-center border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Check SA Eligibility</span>
                  </a>
                </div>
              </div>

              {/* Card 2: CPC50220 */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white">
                      CPC50220
                    </span>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      Skills SA Subsidised Available
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 min-h-[3.75rem] flex items-start">
                    Diploma of Building and Construction (Building)
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed min-h-[4.5rem]">
                    Advance to managing medium-rise residential and commercial construction projects (up to 3 storeys). Covers advanced contracts, structural concrete, and risk management.
                  </p>

                  {/* Fee Highlight Box */}
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-600 font-medium">Student Contribution Fee:</span>
                      <span className="text-2xl font-black text-teal-800">
                        {cpc50220?.subsidised_fee?.split('*')[0]?.trim() || '$1,065'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Standard Full Fee: <s className="text-slate-500">$9,200</s></span>
                      <span className="text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded border border-teal-200">You Save $8,135+</span>
                    </div>
                  </div>

                  {/* Course Details Checklist */}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Duration:</strong> 62 Weeks (excluding holidays)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Units:</strong> 27 Units (24 Core + 3 Elective)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Outcomes:</strong> Medium-Rise Builder, Site Supervisor, Project Manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Delivery:</strong> Real-time Evening Virtual Lectures</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 relative z-10">
                  <Link
                    href={`/courses/${cpc50220?.slug || 'cpc50220-diploma-of-building-and-construction-building'}`}
                    className="flex-1 text-center py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-md"
                  >
                    View CPC50220 Syllabus &amp; Enrol
                  </Link>
                  <a
                    href="https://wa.me/61413826320?text=Hi%20I%20am%20interested%20in%20CPC50220%20Building%20Diploma%20in%20South%20Australia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-4 rounded-xl font-semibold text-xs text-center border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Check SA Eligibility</span>
                  </a>
                </div>
              </div>
            </div>

            {/* South Australia Skills SA Subsidised Course Fee Table - Light Themed */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    South Australia Official Course Fee Schedule (Skills SA)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Eligible South Australian students contribute only $0.50 per nominal hour for approved qualifications.
                  </p>
                </div>
                <div className="shrink-0 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  RTO # 6055 Accredited
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] bg-slate-50/70">
                      <th className="py-3 px-3">Course Code &amp; Title</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">Standard Fee</th>
                      <th className="py-3 px-3">Skills SA Student Fee</th>
                      <th className="py-3 px-3">Funding Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-emerald-50/40">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        CPC40120 Certificate IV in Building &amp; Construction
                      </td>
                      <td className="py-3 px-3">36 Weeks</td>
                      <td className="py-3 px-3 text-slate-400 line-through">$5,800</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{cpc40120?.subsidised_fee?.split('*')[0]?.trim() || '$446'}</td>
                      <td className="py-3 px-3"><span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">CBS Builder Approved</span></td>
                    </tr>
                    <tr className="hover:bg-emerald-50/40">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        CPC50220 Diploma of Building &amp; Construction (Building)
                      </td>
                      <td className="py-3 px-3">62 Weeks</td>
                      <td className="py-3 px-3 text-slate-400 line-through">$9,200</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{cpc50220?.subsidised_fee?.split('*')[0]?.trim() || '$1,065'}</td>
                      <td className="py-3 px-3"><span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Skills SA Subsidised</span></td>
                    </tr>
                    <tr className="hover:bg-emerald-50/40">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        SHB30416 Certificate III in Hairdressing
                      </td>
                      <td className="py-3 px-3">52 Weeks</td>
                      <td className="py-3 px-3 text-slate-400 line-through">$8,500</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">$1,250 / $0 Appr</td>
                      <td className="py-3 px-3"><span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Mawson Lakes Salon</span></td>
                    </tr>
                    <tr className="hover:bg-emerald-50/40">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        SHB30516 Certificate III in Barbering
                      </td>
                      <td className="py-3 px-3">40 Weeks</td>
                      <td className="py-3 px-3 text-slate-400 line-through">$8,900</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">$1,400</td>
                      <td className="py-3 px-3"><span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Skills SA Subsidised</span></td>
                    </tr>
                    <tr className="hover:bg-emerald-50/40">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        CHC30125 Certificate III in Early Childhood Education &amp; Care
                      </td>
                      <td className="py-3 px-3">52 Weeks</td>
                      <td className="py-3 px-3 text-slate-400 line-through">$4,900</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">$554</td>
                      <td className="py-3 px-3"><span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">High Demand SA Sector</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* State Courses Directory Grid */}
      <section id="courses-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Available Programs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {config.coursesTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              {config.coursesSubtitle}
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${selectedCategory === 'ALL' ? 'bg-[#072418] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Qualifications ({courses.length})
            </button>
            <button
              onClick={() => setSelectedCategory('BUILDING')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${selectedCategory === 'BUILDING' ? 'bg-[#072418] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              🏗️ Building &amp; Construction
            </button>
            <button
              onClick={() => setSelectedCategory('HAIR')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${selectedCategory === 'HAIR' ? 'bg-[#072418] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              ✂️ Hair &amp; Barbering
            </button>
            <button
              onClick={() => setSelectedCategory('CARE')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${selectedCategory === 'CARE' ? 'bg-[#072418] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              👶 Early Childhood &amp; Community
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between group h-full"
            >
              <div className="flex flex-col flex-grow">
                {/* Image */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden shrink-0">
                  <Image
                    src={course.featured_image || '/images/fca/hero-header.png'}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-white shadow-sm">
                      {course.code}
                    </span>
                    {course.is_funded_sa && stateCode === 'SA' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                        Skills SA Subsidised
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div>
                    <div className="h-5 flex items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        {course.category_name}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-fca-green transition-colors leading-snug mt-2 line-clamp-2 min-h-[3.25rem] flex items-start">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mt-2 min-h-[3.75rem]">
                      {course.overview}
                    </p>
                  </div>

                  {/* Meta Specs Box - Fixed alignment, no text colliding */}
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 rounded-xl p-3 border border-slate-100/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-slate-500 shrink-0">Duration:</span>
                      <span className="font-bold text-slate-800 text-right">{course.duration}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-slate-500 shrink-0">Subsidised Fee:</span>
                      <span className="font-bold text-emerald-700 text-right">
                        {course.subsidised_fee || 'Government subsidised / On Inquiry'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-slate-500 shrink-0">Delivery:</span>
                      <span className="text-slate-800 text-right">{course.delivery_mode?.split('(')[0]?.trim()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-6 pt-0 mt-auto">
                <Link
                  href={`/courses/${course.slug}`}
                  className="block w-full text-center py-3 rounded-xl text-xs font-bold text-white bg-[#072418] hover:bg-[#0c3927] transition-colors shadow-2xs"
                >
                  View Course Syllabus & Enrolment
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Local Delivery Hubs in this State */}
      {localAreas.length > 0 && (
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Regional Presence
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Delivery Hubs & Campuses in {config.stateName}
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  We distinguish between physical student salons and regional distance delivery service areas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {localAreas.map((area) => (
                <Link
                  key={area.id}
                  href={`/areas/${area.slug}`}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all duration-200 group flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    {area.is_real_campus ? <Building2 className="w-5 h-5 text-emerald-700" /> : <MapPin className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {area.area_name}
                      </span>
                      {area.is_real_campus ? (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-700 text-white">
                          Campus
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          Delivery Hub
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {area.intro}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:underline pt-1">
                      <span>View Location Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* State-Specific FAQs Accordion */}
      <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Frequently Asked Questions for {config.stateName} Students
          </h2>
          <p className="text-slate-600 text-sm">
            Everything you need to know about funding, campuses, and studying in {config.stateName}.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          {config.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-800 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-700' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Direct Contact & Enrolment CTA Card */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#072418] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/60">
                Ready to Start Your Career?
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Enrol with Fran Capelli Academy in {config.stateName}
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Connect with our state admissions advisors to verify your government funding eligibility, tour our training salons, or review virtual trade timetables.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`tel:${config.phone.replace(/[^0-9]/g, '').slice(0, 10)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#072418] hover:bg-emerald-50 font-bold text-sm transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Call {config.phone.split('/')[0].trim()}</span>
                </a>
                <a
                  href="https://wa.me/61413826320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-colors"
                >
                  <span>Chat on WhatsApp (+61 413 826 320)</span>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-emerald-200 hover:text-white font-medium text-sm transition-colors border border-emerald-700/60"
                >
                  <span>Send Online Enquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

