import { PGlite } from '@electric-sql/pglite';
import path from 'path';

async function syncStatePortals() {
  const dataDir = path.join(process.cwd(), 'data', 'fca_postgres');
  const db = new PGlite(dataDir);

  console.log('--- Syncing State Portals to Database ---');

  const statePages = [
    {
      slug: 'victoria',
      title: 'Victoria Campus & Courses | Fran Capelli Academy',
      hero_heading: "Victoria's Premier Academy for Hairdressing, Barbering & Construction in Melbourne",
      hero_subheading: 'Master high-end salon crafts and builder trade qualifications in Hawthorn and Coolaroo. Experience hands-on client appointments in our commercial salon and take advantage of Victorian apprenticeship incentives.',
      hero_image: '/images/fca/courses/hairdressing-salon.png',
      content_html: `
        <h2>Welcome to Fran Capelli Academy Victoria</h2>
        <p>Fran Capelli Academy (RTO # 6055) delivers hands-on, nationally recognised training designed for real career outcomes. With commercial student salons in Hawthorn and dedicated trade delivery in Coolaroo, our students train on real clients and active building scenarios.</p>
        <h3>Melbourne Campuses & Facilities</h3>
        <ul>
          <li><strong>Hawthorn Campus:</strong> 355 Burwood Road, Hawthorn VIC 3122 (Commercial student salon open to the public).</li>
          <li><strong>Coolaroo Campus:</strong> G01, 1510 Pascoe Vale Road, Coolaroo VIC 3048 (Trades and building workshops).</li>
        </ul>
      `,
      state_code: 'VIC',
      campus_address: '355 Burwood Road, Hawthorn, VIC 3122',
      phone: '03 9818 0089',
      email: 'info@fca.edu.au',
      funding_info: 'Victorian Apprenticeship & Traineeship Support | Commercial Salon Client Practicums',
      seo_title: 'Victoria Campus & Courses (Hawthorn & Coolaroo) | Fran Capelli Academy',
      meta_description: 'Study Certificate III Hairdressing, Barbering, and CPC40120 Building in Hawthorn Melbourne with Fran Capelli Academy (RTO 6055).'
    },
    {
      slug: 'south-australia',
      title: 'South Australia Funding & Mawson Lakes Campus | Fran Capelli Academy',
      hero_heading: 'Skills SA Subsidised Training & Builder Licence Pathways in South Australia',
      heroSubheading: 'Study nationally recognised vocational qualifications in Mawson Lakes. Eligible South Australian students access government subsidised courses from $0.50 per nominal hour, plus consumer-approved builder contractor licence courses.',
      hero_image: '/images/fca/courses/building-plans.png',
      content_html: `
        <h2>South Australia Government Funding (Skills SA)</h2>
        <p>Eligible South Australian students may be able to access Government subsidised training through Fran Capelli Academy. If you meet the eligibility requirements, the South Australian Government contributes towards your tuition fees, making nationally recognised training affordable.</p>
        <h3>Mawson Lakes Commercial Campus</h3>
        <p>Located at 1-3 Metro Parade, Mawson Lakes SA 5095, right opposite the train station. Features commercial hairdressing salons and trade lecture facilities.</p>
      `,
      state_code: 'SA',
      campus_address: '1-3 Metro Parade, Mawson Lakes, South Australia, 5095',
      phone: '08 7137 1433',
      email: 'enquiries@fca.edu.au',
      funding_info: 'Skills SA Government Subsidised Training from $0.50/nominal hour',
      seo_title: 'South Australia Funding & Mawson Lakes Campus | Fran Capelli Academy',
      meta_description: 'Access Skills SA subsidised courses and CBS approved Builder Contractor Licence qualifications in Mawson Lakes Adelaide with FCA (RTO 6055).'
    },
    {
      slug: 'act',
      title: 'ACT Delivery Hub & Canberra Courses | Fran Capelli Academy',
      hero_heading: 'ACT User Choice Funded Apprenticeships & Flexible Virtual Trade Classrooms',
      hero_subheading: 'Study accredited qualifications funded through the ACT Government User Choice program. High-retention apprentice pathways in Hairdressing, Barbering, and Building with evening virtual classrooms and Canberra assessor visits.',
      hero_image: '/images/fca/courses/building-cpc40120.png',
      content_html: `
        <h2>ACT Government User Choice Apprenticeships</h2>
        <p>Fran Capelli Academy delivers accredited Australian Apprenticeships and flexible trade qualifications funded by the ACT Government User Choice program.</p>
        <h3>Canberra Delivery Hub</h3>
        <p>Level 5, 15 Moore Street, Canberra City, ACT 2601. Real-time virtual interactive classrooms combined with on-site salon and building assessments.</p>
      `,
      state_code: 'ACT',
      campus_address: 'Level 5, 15 Moore Street, Canberra City, ACT 2601',
      phone: '03 9818 0089',
      email: 'enquiries@fca.edu.au',
      funding_info: 'ACT Government User Choice Funded Apprenticeships',
      seo_title: 'ACT Delivery Hub & Canberra Courses | Fran Capelli Academy',
      meta_description: 'Government funded apprenticeships and evening virtual trade classes for ACT students and employers with FCA (RTO 6055).'
    },
    {
      slug: 'western-australia',
      title: 'Western Australia Blended Courses & Perth Hub | Fran Capelli Academy',
      hero_heading: 'Nationally Accredited Vocational Qualifications & Blended Delivery in WA',
      hero_subheading: 'Flexible distance learning paired with Perth regional support and workplace practical validations. Earn nationally recognized ASQA qualifications in Building, Salon Trades, and Early Childhood Education.',
      hero_image: '/images/fca/courses/childhood-chc30125.png',
      content_html: `
        <h2>Flexible Blended Learning Across Western Australia</h2>
        <p>Fran Capelli Academy enables students throughout Perth, Fremantle, Joondalup, and regional WA to study accredited Australian qualifications with online flexibility and dedicated mentor oversight.</p>
      `,
      state_code: 'WA',
      campus_address: 'Perth Regional Support Center & Online Learning Hub',
      phone: '03 9818 0089',
      email: 'enquiries@fca.edu.au',
      funding_info: 'Blended Online Theory with Local WA Workplace Practicum Validation',
      seo_title: 'Western Australia Blended Courses & Perth Hub | Fran Capelli Academy',
      meta_description: 'Study accredited certificates in building, early childhood, and salon trades across Perth and WA with Fran Capelli Academy (RTO 6055).'
    }
  ];

  for (const p of statePages) {
    const existing = await db.query('SELECT id FROM pages WHERE slug = $1 LIMIT 1', [p.slug]);
    if (existing.rows.length > 0) {
      await db.query(`
        UPDATE pages SET 
          title = $1, hero_heading = $2, hero_subheading = $3, hero_image = $4,
          content_html = $5, state_code = $6, campus_address = $7, phone = $8,
          email = $9, funding_info = $10, seo_title = $11, meta_description = $12
        WHERE slug = $13
      `, [
        p.title, p.hero_heading, p.hero_subheading, p.hero_image,
        p.content_html, p.state_code, p.campus_address, p.phone,
        p.email, p.funding_info, p.seo_title, p.meta_description,
        p.slug
      ]);
      console.log(`Updated page: ${p.slug}`);
    } else {
      await db.query(`
        INSERT INTO pages (
          slug, title, hero_heading, hero_subheading, hero_image,
          content_html, state_code, campus_address, phone, email,
          funding_info, seo_title, meta_description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'published')
      `, [
        p.slug, p.title, p.hero_heading, p.hero_subheading, p.hero_image,
        p.content_html, p.state_code, p.campus_address, p.phone, p.email,
        p.funding_info, p.seo_title, p.meta_description
      ]);
      console.log(`Created page: ${p.slug}`);
    }
  }

  await db.close();
  console.log('--- Done syncing state portals to database ---');
}

syncStatePortals().catch(console.error);

