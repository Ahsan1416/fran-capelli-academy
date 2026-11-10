export interface CourseData {
  id: number;
  code: string;
  title: string;
  slug: string;
  category_slug: string;
  category_name: string;
  duration: string;
  prerequisite: string;
  units_count: string;
  subsidised_fee: string;
  standard_fee: string;
  delivery_mode: string;
  funding_notes: string;
  career_outcomes: string;
  overview: string;
  featured_image: string;
  states_available: string;
  is_funded_sa: boolean;
  status: string;
  faqs?: string;
  has_draft?: boolean;
  draft_data?: string;
}

export const DEFAULT_COURSES: CourseData[] = [
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
  },
  {
    id: 6,
    code: 'CHC52025',
    title: 'Diploma of Community Services',
    slug: 'chc52025-diploma-of-community-services',
    category_slug: 'community-services',
    category_name: 'Community Services',
    duration: '78 Weeks (Includes 200h Work Placement)',
    prerequisite: 'Year 12 or equivalent. Police Clearance required.',
    units_count: '16',
    subsidised_fee: '$1,240 *Government Subsidised',
    standard_fee: '$8,900',
    delivery_mode: 'Virtual Classroom + Industry Field Placement',
    funding_notes: 'Subsidised tuition places available for eligible domestic students.',
    career_outcomes: '["Case Manager","Community Development Officer","Family Support Worker"]',
    overview: 'Develop the advanced competencies required to deliver social welfare programs, client advocacy, crisis management, and person-centered community services.',
    featured_image: '/images/fca/courses/community-chc52025.jpg',
    states_available: '["SA","VIC","ACT","WA"]',
    is_funded_sa: true,
    status: 'published'
  }
];

export const DEFAULT_SA_AREAS = [
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
