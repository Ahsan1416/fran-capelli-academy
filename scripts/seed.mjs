import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function getClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    console.log('Connecting to PostgreSQL via DATABASE_URL:', dbUrl);
    const pool = new pg.Pool({ connectionString: dbUrl });
    const client = await pool.connect();
    return {
      query: (sql, params) => client.query(sql, params),
      exec: (sql) => client.query(sql),
      close: () => { client.release(); pool.end(); }
    };
  } else {
    const dataDir = path.join(process.cwd(), 'data', 'fca_postgres');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    console.log('Connecting to Embedded PostgreSQL (PGlite) at:', dataDir);
    const pglite = new PGlite(dataDir);
    return {
      query: (sql, params) => pglite.query(sql, params),
      exec: (sql) => pglite.exec(sql),
      close: () => pglite.close()
    };
  }
}

async function runSeed() {
  console.log('--- Starting Fran Capelli Academy Seed Script ---');
  const client = await getClient();

  // Run schema SQL
  const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await client.exec(schemaSql);
  console.log('Schema confirmed.');

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fca.edu.au';
  const adminPass = process.env.ADMIN_PASSWORD || 'FcaAcademy2026!';
  const passHash = hashPassword(adminPass);

  await client.query(`
    INSERT INTO admin_users (email, name, password_hash, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `, [adminEmail, 'FCA Academy Administrator', passHash, 'admin']);
  console.log(`Admin user seeded: ${adminEmail}`);

  // 2. Site Settings
  const navMenu = JSON.stringify([
    { label: 'Home', href: '/' },
    {
      label: 'Courses',
      href: '/courses',
      children: [
        { label: 'Hairdressing', href: '/courses/hairdressing' },
        { label: 'Barbering', href: '/courses/barbering' },
        { label: 'Building & Construction', href: '/courses/building-construction' },
        { label: 'Early Childhood Education', href: '/courses/early-childhood-education-care' },
        { label: 'Community Services', href: '/courses/community-services' }
      ]
    },
    {
      label: 'Campuses & States',
      href: '/courses',
      children: [
        { label: 'Victoria (Hawthorn & Coolaroo)', href: '/fran-capelli-academy-vic' },
        { label: 'South Australia (Mawson Lakes)', href: '/south-australia-funding' },
        { label: 'Australian Capital Territory', href: '/fran-capelli-academy-australiacapitalterritory' },
        { label: 'Western Australia', href: '/fran-capelli-academy-wa' }
      ]
    },
    { label: 'Local Hubs', href: '/areas/hawthorn-vic' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ]);

  const footerText = 'Fran Capelli Academy is a registered training organisation (RTO # 6055) delivering nationally recognised qualifications across Australia. Eligible South Australian students can access subsidised training through Skills SA.';

  await client.query(`
    INSERT INTO site_settings (
      id, site_name, rto_code, logo_url, logo_alt,
      phone_melbourne, phone_adelaide, phone_general, whatsapp, email,
      address_hawthorn, address_coolaroo, address_mawson, address_canberra,
      nav_menu, footer_text
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (id) DO UPDATE SET
      site_name = EXCLUDED.site_name,
      rto_code = EXCLUDED.rto_code,
      logo_url = EXCLUDED.logo_url,
      phone_melbourne = EXCLUDED.phone_melbourne,
      phone_adelaide = EXCLUDED.phone_adelaide,
      whatsapp = EXCLUDED.whatsapp,
      nav_menu = EXCLUDED.nav_menu
  `, [
    1,
    'Fran Capelli Academy',
    '6055',
    '/images/fca/logo.png',
    'Fran Capelli Academy Logo',
    '03 9818 0089',
    '08 7137 1433',
    '08 7690 6185',
    '+61 413 826 320',
    'enquiries@fca.edu.au',
    '355 Burwood Road, Hawthorn, VIC 3122',
    'G01, 1510 Pascoe Vale Road, Coolaroo, VIC, 3048',
    '1-3 Metro Parade, Mawson Lakes, South Australia, 5095',
    'Level 5, 15 Moore Street, Canberra City, ACT 2601',
    navMenu,
    footerText
  ]);
  console.log('Site settings seeded.');

  // 3. Homepage Config
  const homepageFaqs = JSON.stringify([
    {
      question: 'Is Fran Capelli Academy a Nationally Recognised RTO?',
      answer: 'Yes, Fran Capelli Academy is registered under RTO # 6055. All our certificates and diplomas comply with the Australian Qualifications Framework (AQF) and are recognised by employers and licensing authorities nationwide.'
    },
    {
      question: 'What Government Subsidies are available?',
      answer: 'In South Australia, eligible students may access subsidised training funded by Skills SA with student contribution fees starting from just $0.50 per nominal hour for approved vocational courses.'
    },
    {
      question: 'Where are the physical campuses located?',
      answer: 'Our main Victorian campuses are located at Hawthorn (355 Burwood Rd) and Coolaroo (1510 Pascoe Vale Rd). Our South Australian campus is in Mawson Lakes (1-3 Metro Parade). We also deliver blended programs across the ACT and WA.'
    },
    {
      question: 'Can I study while working?',
      answer: 'Yes. We offer flexible blended learning combining interactive virtual theory sessions with scheduled practical salon or construction site workshops to fit around student schedules.'
    }
  ]);

  const sectionOrder = JSON.stringify(['hero', 'stats', 'categories', 'featured_courses', 'support', 'states', 'testimonials', 'faqs', 'cta']);
  const sectionVisibility = JSON.stringify({
    hero: true,
    stats: true,
    categories: true,
    featured_courses: true,
    support: true,
    states: true,
    testimonials: true,
    faqs: true,
    cta: true
  });
  const featuredSlugs = JSON.stringify([
    'shb30416-certificate-iii-in-hairdressing-non-apprenticeship',
    'cpc40120-certificate-iv-in-building-and-construction',
    'shb30516-certificate-iii-in-barbering-non-apprenticeship',
    'chc30125-certificate-iii-in-early-childhood-education-care'
  ]);

  await client.query(`
    INSERT INTO homepage_config (
      id, hero_badge, hero_title, hero_subtitle, hero_image,
      hero_primary_btn_text, hero_primary_btn_link,
      hero_secondary_btn_text, hero_secondary_btn_link,
      featured_course_slugs, faqs, section_order, section_visibility
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      hero_title = EXCLUDED.hero_title,
      hero_subtitle = EXCLUDED.hero_subtitle,
      hero_image = EXCLUDED.hero_image
  `, [
    1,
    'RTO # 6055 • Nationally Recognised Training Provider',
    'Practical Industry Training Designed for Real Careers',
    'Master high-demand trades in Hairdressing, Barbering, Building & Construction, Early Childhood Education & Care, and Community Services with state-of-the-art facilities and government funding options.',
    '/images/fca/hero-header.png',
    'Explore All Courses',
    '/courses',
    'Check Government Funding',
    '/south-australia-funding',
    featuredSlugs,
    homepageFaqs,
    sectionOrder,
    sectionVisibility
  ]);
  console.log('Homepage configuration seeded.');

  // 4. Courses
  const coursesData = [
    {
      code: 'SHB30416',
      title: 'Certificate III in Hairdressing (Non-Apprenticeship)',
      slug: 'shb30416-certificate-iii-in-hairdressing-non-apprenticeship',
      category_slug: 'hairdressing',
      category_name: 'Hairdressing',
      duration: '52 Weeks (Excluding holidays)',
      prerequisite: 'There is no qualification prerequisite',
      units_count: '28 Units (21 Core, 7 Elective)',
      subsidised_fee: '$1,250 *Government Subsidised',
      standard_fee: '$8,500 Full Fee',
      delivery_mode: 'On-Campus Salon & Blended Practical Workshops',
      funding_notes: 'Eligible students may access Skills SA subsidised funding in South Australia. Student contribution fees apply.',
      career_outcomes: JSON.stringify(['Qualified Senior Hairdresser', 'Salon Stylist', 'Hairdressing Colorist Specialist', 'Salon Manager / Owner']),
      overview: 'This qualification reflects the role of hairdressers who use a range of well-developed sales, consultative and technical skills and knowledge to provide a broad range of hairdressing services to clients. You will train in our fully equipped student salons on real clients.',
      featured_image: '/images/fca/courses/hairdressing-hero.png',
      states_available: JSON.stringify(['VIC', 'SA', 'WA', 'ACT']),
      is_funded_sa: true,
      faqs: JSON.stringify([
        { question: 'Do I need previous hairdressing experience?', answer: 'No prior salon experience is required. We start with fundamental scissor control, shampooing, basin service, and client consultation.' },
        { question: 'Will I practice on real clients?', answer: 'Yes! Our Hawthorn and Mawson Lakes campuses feature active commercial training salons where students work with real paying clients under trainer supervision.' }
      ])
    },
    {
      code: 'SHB30416',
      title: 'Certificate III in Hairdressing (Apprenticeship)',
      slug: 'shb30416-certificate-iii-in-hairdressing-apprenticeship',
      category_slug: 'hairdressing',
      category_name: 'Hairdressing',
      duration: '24-36 Months (Apprenticeship)',
      prerequisite: 'Apprenticeship contract with an approved employer',
      units_count: '28 Units (21 Core, 7 Elective)',
      subsidised_fee: '$0 - Subsidised Traineeship',
      standard_fee: '$7,200',
      delivery_mode: 'Workplace Training with Campus Release Days',
      funding_notes: 'Employer incentives and State government subsidised apprenticeship rates apply across VIC, SA, and ACT.',
      career_outcomes: JSON.stringify(['Trade Qualified Hairdresser', 'Session Stylist', 'Creative Hair Director', 'Salon Owner']),
      overview: 'Designed for apprentices currently employed in a hair salon. Combine paid on-the-job training with structured vocational assessments delivered by Fran Capelli Academy industry master trainers.',
      featured_image: '/images/fca/courses/hairdressing-salon.png',
      states_available: JSON.stringify(['VIC', 'SA', 'ACT']),
      is_funded_sa: true,
      faqs: JSON.stringify([
        { question: 'How often do apprentices attend campus?', answer: 'Typically one day per fortnight or structured block releases depending on salon operational requirements.' }
      ])
    },
    {
      code: 'SHB30516',
      title: 'Certificate III in Barbering (Non-Apprenticeship)',
      slug: 'shb30516-certificate-iii-in-barbering-non-apprenticeship',
      category_slug: 'barbering',
      category_name: 'Barbering',
      duration: '52 Weeks (Excluding holidays)',
      prerequisite: 'No prior barbering experience needed',
      units_count: '28 Units (21 Core, 7 Elective)',
      subsidised_fee: '$1,400 *Skills SA Subsidised',
      standard_fee: '$8,900 Full Fee',
      delivery_mode: 'Practical Barber Shop Studio & Blended Theory',
      funding_notes: 'South Australian Government subsidies available for eligible jobseekers and upskillers through Skills SA.',
      career_outcomes: JSON.stringify(['Master Barber', 'Fade & Beard Specialist', 'Barber Shop Manager', 'Freelance Grooming Artist']),
      overview: 'Learn traditional and modern barbering techniques including skin fades, beard shaping, traditional hot towel cut-throat wet shaves, and clipper-over-comb artistry in our barber studio.',
      featured_image: '/images/fca/courses/barbering-hero.png',
      states_available: JSON.stringify(['VIC', 'SA', 'WA', 'ACT']),
      is_funded_sa: true,
      faqs: JSON.stringify([
        { question: 'What tools are provided?', answer: 'Students receive professional kit access including professional clippers, trimmers, straight razors, and texturising shears.' }
      ])
    },
    {
      code: 'CPC40120',
      title: 'Certificate IV in Building and Construction',
      slug: 'cpc40120-certificate-iv-in-building-and-construction',
      category_slug: 'building-construction',
      category_name: 'Building & Construction',
      duration: '36 Weeks (Excluding holidays)',
      prerequisite: 'Basic numeracy and literacy; building experience recommended',
      units_count: '19 Units (11 Core, 8 Elective)',
      subsidised_fee: '$446 *Government Subsidised Fee',
      standard_fee: '$5,800 Full Fee',
      delivery_mode: 'Flexible (Real Time Virtual Classrooms + Site Practicals)',
      funding_notes: 'Includes 6 units specifically aligned with Consumer and Business Services (CBS) business knowledge requirements for a South Australian Building Work Contractor Licence.',
      career_outcomes: JSON.stringify(['Licensed Builder / Contractor', 'Site Supervisor', 'Construction Project Coordinator', 'Foreperson']),
      overview: 'This course is the premier pathway toward gaining your residential builder licence in Australia. Learn structural principles, building codes (BCA/NCC), project estimation, contract administration, and site safety.',
      featured_image: '/images/fca/courses/building-cpc40120.png',
      states_available: JSON.stringify(['SA', 'VIC', 'ACT', 'WA']),
      is_funded_sa: true,
      faqs: JSON.stringify([
        { question: 'Does this meet the licence requirement in SA?', answer: 'Yes! CPC40120 is the recognised educational qualification benchmark for the CBS Building Work Contractor Licence in South Australia.' },
        { question: 'Are classes held after work hours?', answer: 'Yes, interactive evening virtual classroom sessions are provided so active tradespeople can study without missing work on site.' }
      ])
    },
    {
      code: 'CPC50220',
      title: 'Diploma of Building and Construction (Building)',
      slug: 'cpc50220-diploma-of-building-and-construction-building',
      category_slug: 'building-construction',
      category_name: 'Building & Construction',
      duration: '62 Weeks (Excluding holidays)',
      prerequisite: 'CPC40120 or relevant trade background',
      units_count: '27 Units (24 Core, 3 Elective)',
      subsidised_fee: '$1,065 *Government Subsidised Fee',
      standard_fee: '$9,200 Full Fee',
      delivery_mode: 'Real Time Virtual Interactive Classrooms + Site Case Studies',
      funding_notes: 'South Australian Government Skills SA approved qualification for eligible participants.',
      career_outcomes: JSON.stringify(['Commercial Builder', 'Construction Manager', 'General Foreperson', 'Principal Contractor']),
      overview: 'Advance your construction management expertise to medium-rise residential and commercial builds (up to 3 storeys). Covers advanced structural concrete, seismic design, cost management, and legal dispute management.',
      featured_image: '/images/fca/courses/building-cpc50220.png',
      states_available: JSON.stringify(['SA', 'VIC', 'ACT', 'WA']),
      is_funded_sa: true,
      faqs: JSON.stringify([
        { question: 'Can I progress from Certificate IV to Diploma?', answer: 'Yes, units completed in Certificate IV map directly with credit transfer towards the Diploma.' }
      ])
    },
    {
      code: 'CHC30125',
      title: 'Certificate III in Early Childhood Education and Care',
      slug: 'chc30125-certificate-iii-in-early-childhood-education-care',
      category_slug: 'early-childhood-education-care',
      category_name: 'Early Childhood Education & Care',
      duration: '53 Weeks (Includes 160h Work Placement)',
      prerequisite: 'Working with Children Check (WWCC) & National Police Clearance',
      units_count: '17 Units (15 Core, 2 Elective)',
      subsidised_fee: '$554 *Government Subsidised Fee',
      standard_fee: '$4,900 Full Fee',
      delivery_mode: 'Blended Learning + 160 Hours Regulated Center Practicum',
      funding_notes: 'Fully approved for South Australia Skills funding with high employer demand across daycare centers.',
      career_outcomes: JSON.stringify(['Early Childhood Educator', 'Child Care Center Worker', 'Family Day Care Educator', 'Kindergarten Assistant']),
      overview: 'Prepare for a rewarding career nurturing early child development. Gain essential skills in Early Years Learning Framework (EYLF), child health and safety, cultural responsiveness, and play-based pedagogy.',
      featured_image: '/images/fca/courses/childhood-chc30125.png',
      states_available: JSON.stringify(['SA', 'VIC', 'ACT', 'WA']),
      is_funded_sa: true,
      faqs: JSON.stringify([
        { question: 'Does FCA assist with work placement?', answer: 'Yes, our Student Services team maintains partnerships with accredited childcare providers to help place students in approved centers.' }
      ])
    },
    {
      code: 'CHC52025',
      title: 'Diploma of Community Services',
      slug: 'chc52025-diploma-of-community-services-sa',
      category_slug: 'community-services',
      category_name: 'Community Services',
      duration: '14 Months (Includes 200h Work Placement)',
      prerequisite: 'Completion of Year 12 or Certificate III in Community Services',
      units_count: '20 Units (12 Core, 8 Elective)',
      subsidised_fee: '$770 *Government Subsidised Fee',
      standard_fee: '$7,800 Full Fee',
      delivery_mode: 'Blended Online Workshops + Supervised Field Practicum',
      funding_notes: 'Subsidised by the Government of South Australia through Skills SA. High industry priority.',
      career_outcomes: JSON.stringify(['Case Manager', 'Community Development Worker', 'Youth & Family Support Specialist', 'Crisis Support Coordinator']),
      overview: 'Equip yourself to support vulnerable individuals and communities. Learn crisis intervention, advocacy, person-centred case coordination, and mental health first aid with hands-on field experience.',
      featured_image: '/images/fca/courses/community-chc52025.jpg',
      states_available: JSON.stringify(['SA', 'VIC']),
      is_funded_sa: true,
      faqs: JSON.stringify([
        { question: 'What sector can I work in after graduating?', answer: 'Graduates find roles in family support, youth justice, housing advocacy, mental health organisations, and non-profit community centres.' }
      ])
    }
  ];

  for (const c of coursesData) {
    await client.query(`
      INSERT INTO courses (
        code, title, slug, category_slug, category_name,
        duration, prerequisite, units_count, subsidised_fee, standard_fee,
        delivery_mode, funding_notes, career_outcomes, overview,
        featured_image, states_available, is_funded_sa, faqs
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        duration = EXCLUDED.duration,
        subsidised_fee = EXCLUDED.subsidised_fee,
        delivery_mode = EXCLUDED.delivery_mode,
        featured_image = EXCLUDED.featured_image
    `, [
      c.code, c.title, c.slug, c.category_slug, c.category_name,
      c.duration, c.prerequisite, c.units_count, c.subsidised_fee, c.standard_fee,
      c.delivery_mode, c.funding_notes, c.career_outcomes, c.overview,
      c.featured_image, c.states_available, c.is_funded_sa, c.faqs
    ]);
  }
  console.log(`Seeded ${coursesData.length} courses.`);

  // 5. Existing & State Pages
  const pagesData = [
    {
      slug: 'fran-capelli-academy-vic',
      title: 'Victoria Campus & Courses | Fran Capelli Academy',
      hero_heading: 'Fran Capelli Academy Victoria',
      hero_subheading: 'Melbourne Campuses in Hawthorn and Coolaroo providing fully equipped salon and trade facilities.',
      hero_image: '/images/fca/courses/hairdressing-salon.png',
      state_code: 'VIC',
      campus_address: '355 Burwood Road, Hawthorn, VIC 3122 & G01, 1510 Pascoe Vale Road, Coolaroo, VIC 3048',
      phone: '03 9818 0089',
      email: 'enquiries@fca.edu.au',
      funding_info: 'Victorian traineeship incentives and fee-for-service payment plans available.',
      content_html: `
        <h2>Welcome to Fran Capelli Academy Victoria</h2>
        <p>Fran Capelli Academy (RTO # 6055) delivers hands-on vocational training across two prime Melbourne locations:</p>
        <ul>
          <li><strong>Hawthorn Campus:</strong> 355 Burwood Road, Hawthorn VIC (Near Glenferrie Station)</li>
          <li><strong>Coolaroo Campus:</strong> G01, 1510 Pascoe Vale Road, Coolaroo VIC</li>
        </ul>
        <p>Our Melbourne facilities include a dedicated student hair and barber salon, interactive classroom amenities, and industry-connected trainers ready to guide you from enrollment to graduation.</p>
      `,
      seo_title: 'Hairdressing & Barbering Courses Melbourne VIC | Fran Capelli Academy',
      meta_description: 'Study Hairdressing, Barbering, and Building qualifications at Fran Capelli Academy Melbourne campuses in Hawthorn & Coolaroo.'
    },
    {
      slug: 'south-australia-funding',
      title: 'South Australia Funding & Mawson Lakes Campus | Fran Capelli Academy',
      hero_heading: 'South Australia Skills SA Funded Training',
      hero_subheading: 'Government subsidised training from $0.50 per nominal hour for eligible South Australian residents.',
      hero_image: '/images/fca/courses/building-cpc40120.png',
      state_code: 'SA',
      campus_address: '1-3 Metro Parade, Mawson Lakes, South Australia, 5095',
      phone: '08 7137 1433',
      email: 'enquiries@fca.edu.au',
      funding_info: 'Skills SA subsidised fees apply for eligible students with contribution fees starting at $0.50 per nominal hour.',
      content_html: `
        <h2>Skills SA Subsidised Qualifications in South Australia</h2>
        <p>Fran Capelli Academy is proud to deliver government-subsidised vocational training supported by the Government of South Australia. If you reside in South Australia and meet the eligibility requirements, your tuition fees are heavily subsidised.</p>
        <h3>Funded Qualifications Available:</h3>
        <ul>
          <li><strong>CPC40120</strong> Certificate IV in Building and Construction (Pathway to Builder Licence)</li>
          <li><strong>CPC50220</strong> Diploma of Building and Construction (Building)</li>
          <li><strong>CHC30125</strong> Certificate III in Early Childhood Education and Care</li>
          <li><strong>CHC52025</strong> Diploma of Community Services</li>
          <li><strong>SHB30416</strong> Certificate III in Hairdressing</li>
        </ul>
      `,
      seo_title: 'South Australia Government Subsidised Courses | Fran Capelli Academy',
      meta_description: 'Check eligibility for Skills SA subsidised building, childcare, and hairdressing training at our Mawson Lakes campus.'
    },
    {
      slug: 'fran-capelli-academy-australiacapitalterritory',
      title: 'ACT Delivery Hub & Canberra Courses | Fran Capelli Academy',
      hero_heading: 'Fran Capelli Academy Canberra ACT',
      hero_subheading: 'Vocational education delivery hub in Canberra City providing blended learning and workplace practicals.',
      hero_image: '/images/fca/courses/building-site.png',
      state_code: 'ACT',
      campus_address: 'Level 5, 15 Moore Street, Canberra City, ACT 2601',
      phone: '03 9818 0089',
      email: 'enquiries@fca.edu.au',
      funding_info: 'ACT User Choice apprenticeship funding and fee-for-service options.',
      content_html: `
        <h2>Canberra City Training Hub</h2>
        <p>Fran Capelli Academy provides flexible blended training for Canberra students looking to advance their careers in Building & Construction, Hairdressing, and Barbering.</p>
        <p>Our training hub at Level 5, 15 Moore Street, Canberra City supports students with regular workshops, virtual lectures, and one-on-one mentor consultations.</p>
      `,
      seo_title: 'Canberra Vocational Training & Courses ACT | Fran Capelli Academy',
      meta_description: 'Study nationally recognised courses in Canberra ACT with flexible virtual and workplace delivery.'
    },
    {
      slug: 'fran-capelli-academy-wa',
      title: 'Western Australia Blended Courses | Fran Capelli Academy',
      hero_heading: 'Fran Capelli Academy Western Australia',
      hero_subheading: 'Flexible virtual delivery and supervised workplace practicals across Perth and regional WA.',
      hero_image: '/images/fca/courses/childhood-chc30125.png',
      state_code: 'WA',
      campus_address: 'Service Area Delivery Hub (Perth Metro & Regional WA)',
      phone: '08 7690 6185',
      email: 'enquiries@fca.edu.au',
      funding_info: 'Fee-for-service flexible installments and employer sponsored traineeships.',
      content_html: `
        <h2>Vocational Training Across Western Australia</h2>
        <p>Students in Western Australia can access nationally recognised courses through our interactive virtual learning environment combined with approved workplace practicums in Perth and regional areas.</p>
      `,
      seo_title: 'Western Australia Vocational Training | Fran Capelli Academy',
      meta_description: 'Nationally accredited qualifications in Building, Barbering, and Early Childhood for Western Australian students.'
    },
    {
      slug: 'about',
      title: 'About Fran Capelli Academy | RTO # 6055',
      hero_heading: 'About Fran Capelli Academy',
      hero_subheading: 'Dedicated to empowering Australian students with practical skills, master trainers, and industry outcomes.',
      hero_image: '/images/fca/about-hero.png',
      state_code: null,
      campus_address: 'Head Office: 355 Burwood Road, Hawthorn, VIC 3122',
      phone: '03 9818 0089',
      email: 'enquiries@fca.edu.au',
      funding_info: 'Nationally Recognised Training Provider RTO # 6055.',
      content_html: `
        <h2>Our Mission</h2>
        <p>At Fran Capelli Academy, we believe vocational education should be grounded in real-world application. Whether you are cutting and coloring in our Melbourne salons, managing residential timber frames in Adelaide, or supporting families in early childhood education, our curriculum is shaped by current Australian trade standards.</p>
      `,
      seo_title: 'About Fran Capelli Academy | RTO # 6055',
      meta_description: 'Learn about Fran Capelli Academy, our facilities, history, and commitment to job-ready vocational training.'
    },
    {
      slug: 'contact',
      title: 'Contact Us | Fran Capelli Academy',
      hero_heading: 'Get in Touch with FCA',
      hero_subheading: 'Speak with our course advisory team or visit one of our campus locations.',
      hero_image: '/images/fca/hero-header.png',
      state_code: null,
      campus_address: 'Melbourne, Adelaide & Canberra Campuses',
      phone: '03 9818 0089',
      email: 'enquiries@fca.edu.au',
      funding_info: 'Direct WhatsApp support: +61 413 826 320',
      content_html: `
        <h2>Campus Offices</h2>
        <p>Reach out to our friendly enrollment advisors for immediate guidance on course eligibility, timetables, and government funding subsidies.</p>
      `,
      seo_title: 'Contact Fran Capelli Academy | Melbourne & Adelaide',
      meta_description: 'Contact Fran Capelli Academy campuses in Melbourne, Adelaide, and Canberra.'
    }
  ];

  for (const p of pagesData) {
    await client.query(`
      INSERT INTO pages (
        slug, title, hero_heading, hero_subheading, hero_image,
        content_html, state_code, campus_address, phone, email,
        funding_info, seo_title, meta_description, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        hero_heading = EXCLUDED.hero_heading,
        content_html = EXCLUDED.content_html,
        campus_address = EXCLUDED.campus_address
    `, [
      p.slug, p.title, p.hero_heading, p.hero_subheading, p.hero_image,
      p.content_html, p.state_code, p.campus_address, p.phone, p.email,
      p.funding_info, p.seo_title, p.meta_description, 'published'
    ]);
  }
  console.log(`Seeded ${pagesData.length} core and state pages.`);

  // 6. Blog Posts
  const postsData = [
    {
      slug: 'how-to-become-a-licensed-builder-in-south-australia',
      title: 'How to Become a Licensed Builder in South Australia: Step-by-Step Guide',
      excerpt: 'Understand CBS licensing regulations, required qualifications (CPC40120), and business knowledge criteria in South Australia.',
      category: 'Building & Construction',
      featured_image: '/images/fca/courses/building-cpc40120.png',
      image_alt_text: 'South Australian Builder Licensing Guide',
      seo_title: 'How to Become a Licensed Builder in South Australia | FCA Guide',
      meta_description: 'A complete step-by-step breakdown of obtaining a Building Work Contractor Licence in SA using CPC40120.',
      status: 'published',
      published_at: new Date(),
      content: `
        <p>Stepping up from an on-site tradesperson to a registered building contractor is one of the most lucrative career milestones in the Australian construction sector.</p>
        <h2>1. The Licensing Authority: Consumer and Business Services (CBS)</h2>
        <p>In South Australia, builder licences and contractor registrations are managed by Consumer and Business Services (CBS). To legally contract for domestic or commercial building work, you must hold an active Building Work Contractor Licence.</p>
        <h2>2. Educational Benchmark: CPC40120 Certificate IV in Building and Construction</h2>
        <p>Fran Capelli Academy delivers the CPC40120 Certificate IV in Building and Construction, which incorporates the mandatory 6 units specified by CBS for technical building and business knowledge.</p>
        <h2>3. Skills SA Subsidised Training</h2>
        <p>Eligible South Australian candidates can enrol in this qualification under Skills SA funding, lowering the student contribution to just $446 for the complete course.</p>
      `
    },
    {
      slug: 'top-hairdressing-and-barbering-trends-2026',
      title: 'Top Hairdressing & Barbering Trends in 2026: Master the Modern Salon',
      excerpt: 'From precision low-taper skin fades to custom balayage foil techniques, see what clients are asking for in Australian salons.',
      category: 'Hair & Beauty',
      featured_image: '/images/fca/courses/hairdressing-hero.png',
      image_alt_text: 'Modern Hairdressing Salon Trends',
      seo_title: 'Hairdressing & Barbering Industry Trends 2026 | Fran Capelli Academy',
      meta_description: 'Discover the latest haircutting, coloring, and salon grooming trends dominating Australian barbershops and salons.',
      status: 'published',
      published_at: new Date(),
      content: `
        <p>The Australian grooming industry continues to expand as client demand for specialised texture haircuts, sustainable coloring, and luxury barber experiences hits record highs.</p>
        <h2>Precision Fading & Scissor-Over-Comb</h2>
        <p>Modern clients expect flawless taper fades and textured crop styling. In our Certificate III in Barbering (SHB30516), students spend extensive hours refining cut-throat blade angles and clipper blending.</p>
        <h2>Dimensional Coloring & Salon Consultation</h2>
        <p>Healthy hair biology, glossing, and dimensional foil placement are central to our Certificate III in Hairdressing (SHB30416). Hands-on client days prepare students for high-end boutique salon employment.</p>
      `
    },
    {
      slug: 'early-childhood-educator-career-pathways-australia',
      title: 'Early Childhood Educator Career Pathways in Australia',
      excerpt: 'Explore the booming demand for certified educators across daycare, kindergarten, and family day care services.',
      category: 'Education & Care',
      featured_image: '/images/fca/courses/childhood-chc30125.png',
      image_alt_text: 'Early Childhood Education Career Pathways',
      seo_title: 'Career Pathways in Early Childhood Education & Care | FCA',
      meta_description: 'Why the CHC30125 Certificate III in Early Childhood Education is one of the highest employment qualifications in Australia.',
      status: 'published',
      published_at: new Date(),
      content: `
        <p>Early childhood educators play an irreplaceable role in children's social, emotional, and cognitive development during their first five critical years.</p>
        <h2>Why Study CHC30125?</h2>
        <p>Australian regulations require certified educator-to-child ratios in all licensed services. Graduating with CHC30125 opens immediate employment opportunities in long day care, preschools, and out-of-school hours care (OSHC).</p>
      `
    }
  ];

  for (const post of postsData) {
    await client.query(`
      INSERT INTO posts (
        slug, title, excerpt, content, category,
        featured_image, image_alt_text, seo_title, meta_description,
        status, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        status = EXCLUDED.status
    `, [
      post.slug, post.title, post.excerpt, post.content, post.category,
      post.featured_image, post.image_alt_text, post.seo_title, post.meta_description,
      post.status, post.published_at
    ]);
  }
  console.log(`Seeded ${postsData.length} published blog posts.`);

  // 7. Local Area Pages
  const areasData = [
    {
      area_name: 'Hawthorn',
      state: 'VIC',
      slug: 'hawthorn-vic',
      intro: 'Hawthorn is the vibrant educational heart of inner-east Melbourne, home to Fran Capelli Academy’s flagship hair salon and training facility on Burwood Road.',
      relevant_courses: JSON.stringify([
        'shb30416-certificate-iii-in-hairdressing-non-apprenticeship',
        'shb30516-certificate-iii-in-barbering-non-apprenticeship',
        'shb30416-certificate-iii-in-hairdressing-apprenticeship'
      ]),
      is_real_campus: true,
      campus_name: 'Fran Capelli Academy Hawthorn Flagship Campus',
      campus_address: '355 Burwood Road, Hawthorn, VIC 3122',
      delivery_info: 'On-campus training in our live commercial hairdressing and barber salon, located just 2 minutes walk from Glenferrie Railway Station with easy access to Route 16 trams.',
      faqs: JSON.stringify([
        { question: 'Is parking available at the Hawthorn campus?', answer: 'Street parking is available along Burwood Road and adjacent side streets. We are also 200m from Glenferrie Station.' },
        { question: 'What courses are run on campus at Hawthorn?', answer: 'Our Certificate III in Hairdressing and Certificate III in Barbering practical salon classes are delivered here weekly.' }
      ]),
      featured_image: '/images/fca/courses/hairdressing-salon.png',
      image_alt_text: 'FCA Hawthorn Melbourne Campus',
      seo_title: 'Hairdressing & Barbering School Hawthorn Melbourne | Fran Capelli Academy',
      meta_description: 'Study Certificate III Hairdressing and Barbering at FCA Hawthorn campus on Burwood Road. Live student salons and hands-on training.',
      status: 'published',
      published_at: new Date()
    },
    {
      area_name: 'Mawson Lakes',
      state: 'SA',
      slug: 'mawson-lakes-sa',
      intro: 'Mawson Lakes is Adelaide’s premier technology and vocational hub, hosting our South Australian training centre supported by Skills SA subsidies.',
      relevant_courses: JSON.stringify([
        'cpc40120-certificate-iv-in-building-and-construction',
        'cpc50220-diploma-of-building-and-construction-building',
        'chc30125-certificate-iii-in-early-childhood-education-care',
        'chc52025-diploma-of-community-services-sa'
      ]),
      is_real_campus: true,
      campus_name: 'Fran Capelli Academy Adelaide Campus',
      campus_address: '1-3 Metro Parade, Mawson Lakes, South Australia, 5095',
      delivery_info: 'Equipped lecture spaces, building workshop case study hubs, and direct transit access from Mawson Lakes interchange.',
      faqs: JSON.stringify([
        { question: 'Can I access Skills SA funding at Mawson Lakes?', answer: 'Yes! Eligible South Australian students can access subsidised tuition for CPC40120, CPC50220, and CHC30125 starting from $0.50/nominal hour.' },
        { question: 'How close is the campus to public transit?', answer: 'Our campus is directly adjacent to the Mawson Lakes bus and train interchange (Gawler rail line).' }
      ]),
      featured_image: '/images/fca/courses/building-cpc40120.png',
      image_alt_text: 'FCA Mawson Lakes Adelaide Campus',
      seo_title: 'Building, Childcare & Community Courses Mawson Lakes SA | Fran Capelli Academy',
      meta_description: 'Study government subsidised courses at Fran Capelli Academy Adelaide in Mawson Lakes. Skills SA funding available.',
      status: 'published',
      published_at: new Date()
    },
    {
      area_name: 'Coolaroo',
      state: 'VIC',
      slug: 'coolaroo-vic',
      intro: 'Serving Melbourne’s northern suburbs, our Coolaroo campus provides accessible vocational training for trade careers in barbering and hairdressing.',
      relevant_courses: JSON.stringify([
        'shb30516-certificate-iii-in-barbering-non-apprenticeship',
        'shb30416-certificate-iii-in-hairdressing-non-apprenticeship'
      ]),
      is_real_campus: true,
      campus_name: 'Fran Capelli Academy Coolaroo Northern Campus',
      campus_address: 'G01, 1510 Pascoe Vale Road, Coolaroo, VIC, 3048',
      delivery_info: 'Modern student salon studio with ample on-site parking on Pascoe Vale Road, 5 minutes from Coolaroo Railway Station.',
      faqs: JSON.stringify([
        { question: 'Is free parking available?', answer: 'Yes, our Coolaroo location features a large dedicated free parking lot right outside the building.' }
      ]),
      featured_image: '/images/fca/courses/barbering-clipper.png',
      image_alt_text: 'FCA Coolaroo Melbourne North Campus',
      seo_title: 'Barbering & Hairdressing School Coolaroo VIC | Fran Capelli Academy',
      meta_description: 'Train at our northern Melbourne campus in Coolaroo on Pascoe Vale Road. Free parking and state-of-the-art barbering studios.',
      status: 'published',
      published_at: new Date()
    },
    {
      area_name: 'Perth Metro',
      state: 'WA',
      slug: 'perth-metro-wa',
      intro: 'Providing students across Perth and regional Western Australia with accredited vocational qualifications through blended learning and workplace delivery.',
      relevant_courses: JSON.stringify([
        'cpc40120-certificate-iv-in-building-and-construction',
        'chc30125-certificate-iii-in-early-childhood-education-care'
      ]),
      is_real_campus: false, // SERVICE AREA ONLY!
      campus_name: null,
      campus_address: null,
      delivery_info: 'Service Area Delivery: Interactive real-time virtual evening classrooms paired with student-arranged and supervised workplace practicums in registered WA businesses.',
      faqs: JSON.stringify([
        { question: 'Is there a physical campus to attend in Perth?', answer: 'No. This is an official service area delivered via interactive virtual classrooms and supervised workplace practicum. You do not need to commute to a campus.' },
        { question: 'Is the certificate recognised in Western Australia?', answer: 'Yes. All qualifications issued by Fran Capelli Academy (RTO # 6055) are nationally recognised across WA and throughout Australia under the AQF.' }
      ]),
      featured_image: '/images/fca/courses/building-site.png',
      image_alt_text: 'Vocational Training Perth Western Australia',
      seo_title: 'Online & Blended Vocational Courses Perth WA | Fran Capelli Academy',
      meta_description: 'Study nationally recognised Building & Construction or Childcare in Perth WA with flexible evening virtual delivery.',
      status: 'published',
      published_at: new Date()
    }
  ];

  for (const a of areasData) {
    await client.query(`
      INSERT INTO local_areas (
        area_name, state, slug, intro, relevant_courses,
        is_real_campus, campus_name, campus_address, delivery_info,
        faqs, featured_image, image_alt_text, seo_title, meta_description,
        status, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (slug) DO UPDATE SET
        area_name = EXCLUDED.area_name,
        intro = EXCLUDED.intro,
        is_real_campus = EXCLUDED.is_real_campus,
        campus_address = EXCLUDED.campus_address,
        status = EXCLUDED.status
    `, [
      a.area_name, a.state, a.slug, a.intro, a.relevant_courses,
      a.is_real_campus, a.campus_name, a.campus_address, a.delivery_info,
      a.faqs, a.featured_image, a.image_alt_text, a.seo_title, a.meta_description,
      a.status, a.published_at
    ]);
  }
  console.log(`Seeded ${areasData.length} published local area pages.`);

  // 8. Media Items Inventory
  const mediaInventory = [
    { filename: 'logo.png', url: '/images/fca/logo.png', alt_text: 'Fran Capelli Academy Official Logo', mime_type: 'image/png', size_bytes: 42390 },
    { filename: 'logo-alt.png', url: '/images/fca/logo-alt.png', alt_text: 'Fran Capelli Academy Crest Emblem', mime_type: 'image/png', size_bytes: 1200 },
    { filename: 'hero-header.png', url: '/images/fca/hero-header.png', alt_text: 'FCA Academy Students in Practical Training', mime_type: 'image/png', size_bytes: 35000 },
    { filename: 'about-hero.png', url: '/images/fca/about-hero.png', alt_text: 'Student Learning in Hands-on Studio', mime_type: 'image/png', size_bytes: 31000 },
    { filename: 'australia-map.png', url: '/images/fca/australia-map.png', alt_text: 'FCA National Campus Locations Map', mime_type: 'image/png', size_bytes: 64000 },
    { filename: 'student-support.png', url: '/images/fca/student-support.png', alt_text: 'Student Journey & Support Banner', mime_type: 'image/png', size_bytes: 31000 },
    { filename: 'hairdressing-hero.png', url: '/images/fca/courses/hairdressing-hero.png', alt_text: 'Hairdressing Course Hero & Category', mime_type: 'image/png', size_bytes: 3786000 },
    { filename: 'hairdressing-salon.png', url: '/images/fca/courses/hairdressing-salon.png', alt_text: 'Hairdressing Salon Practice', mime_type: 'image/png', size_bytes: 577000 },
    { filename: 'hairdressing-styling.png', url: '/images/fca/courses/hairdressing-styling.png', alt_text: 'Hairdressing Styling Techniques', mime_type: 'image/png', size_bytes: 1211000 },
    { filename: 'hairdressing-client.png', url: '/images/fca/courses/hairdressing-client.png', alt_text: 'Hairdressing Apprenticeship Practical', mime_type: 'image/png', size_bytes: 1063000 },
    { filename: 'barbering-hero.png', url: '/images/fca/courses/barbering-hero.png', alt_text: 'Barbering Course Hero & Category', mime_type: 'image/png', size_bytes: 31000 },
    { filename: 'barbering-fades.png', url: '/images/fca/courses/barbering-fades.png', alt_text: 'Barbering Precision Fades & Beards', mime_type: 'image/png', size_bytes: 2043000 },
    { filename: 'barbering-clipper.png', url: '/images/fca/courses/barbering-clipper.png', alt_text: 'Barbering Masterclass Workshop', mime_type: 'image/png', size_bytes: 1142000 },
    { filename: 'building-cpc40120.png', url: '/images/fca/courses/building-cpc40120.png', alt_text: 'CPC40120 Cert IV Building and Construction', mime_type: 'image/png', size_bytes: 290000 },
    { filename: 'building-cpc50220.png', url: '/images/fca/courses/building-cpc50220.png', alt_text: 'CPC50220 Diploma of Building', mime_type: 'image/png', size_bytes: 156000 },
    { filename: 'building-site.png', url: '/images/fca/courses/building-site.png', alt_text: 'Construction Site Management & Licencing', mime_type: 'image/png', size_bytes: 1436000 },
    { filename: 'building-plans.png', url: '/images/fca/courses/building-plans.png', alt_text: 'Building Plans & Compliance Review', mime_type: 'image/png', size_bytes: 1203000 },
    { filename: 'childhood-chc30125.png', url: '/images/fca/courses/childhood-chc30125.png', alt_text: 'CHC30125 Early Childhood Education Hero', mime_type: 'image/png', size_bytes: 1413000 },
    { filename: 'childhood-learning.png', url: '/images/fca/courses/childhood-learning.png', alt_text: 'Early Childhood Learning Framework', mime_type: 'image/png', size_bytes: 1225000 },
    { filename: 'childhood-development.png', url: '/images/fca/courses/childhood-development.png', alt_text: 'Child Development & Play Practice', mime_type: 'image/png', size_bytes: 1299000 },
    { filename: 'childhood-care.png', url: '/images/fca/courses/childhood-care.png', alt_text: 'Early Childhood Classroom Experience', mime_type: 'image/png', size_bytes: 1249000 },
    { filename: 'community-chc52025.jpg', url: '/images/fca/courses/community-chc52025.jpg', alt_text: 'CHC52025 Diploma of Community Services', mime_type: 'image/jpeg', size_bytes: 284000 },
    { filename: 'community-teamwork.jpg', url: '/images/fca/courses/community-teamwork.jpg', alt_text: 'Community Support Teamwork & Case Management', mime_type: 'image/jpeg', size_bytes: 341000 },
    { filename: 'community-advocacy.jpg', url: '/images/fca/courses/community-advocacy.jpg', alt_text: 'Community Advocacy & Client Welfare', mime_type: 'image/jpeg', size_bytes: 346000 }
  ];

  for (const m of mediaInventory) {
    await client.query(`
      INSERT INTO media_items (filename, url, alt_text, mime_type, size_bytes)
      VALUES ($1, $2, $3, $4, $5)
    `, [m.filename, m.url, m.alt_text, m.mime_type, m.size_bytes]);
  }
  console.log(`Seeded ${mediaInventory.length} authentic FCA media items.`);

  await client.close();
  console.log('--- Database Seed Complete! ---');
}

runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
