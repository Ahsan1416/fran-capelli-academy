import fs from 'fs';
import path from 'path';

const WP_URL = process.env.WORDPRESS_URL || 'https://darkgray-llama-274719.hostingersite.com';
const WP_USER = process.env.WORDPRESS_USER || 'admin';
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'Ls99 Aowe mQZt Yg9D RAAW mcum';
const WP_AUTH = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${WP_AUTH}`
};

async function api(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/${endpoint}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP API ${endpoint} failed (${res.status}): ${text.substring(0, 300)}`);
  }
  return res.json();
}

async function findOrCreateCategory(name, slug) {
  const existing = await api(`categories?slug=${encodeURIComponent(slug)}`);
  if (existing && existing.length > 0) return existing[0].id;
  const created = await api('categories', 'POST', { name, slug });
  return created.id;
}

async function upsertPage(pageData) {
  const existing = await api(`pages?slug=${encodeURIComponent(pageData.slug)}`);
  if (existing && existing.length > 0) {
    const pageId = existing[0].id;
    console.log(`Updating existing page: ${pageData.slug} (ID: ${pageId})`);
    return await api(`pages/${pageId}`, 'POST', pageData);
  } else {
    console.log(`Creating new page: ${pageData.slug}`);
    return await api('pages', 'POST', pageData);
  }
}

async function upsertPost(postData) {
  const existing = await api(`posts?slug=${encodeURIComponent(postData.slug)}`);
  if (existing && existing.length > 0) {
    const postId = existing[0].id;
    console.log(`Updating existing post: ${postData.slug} (ID: ${postId})`);
    return await api(`posts/${postId}`, 'POST', postData);
  } else {
    console.log(`Creating new post: ${postData.slug}`);
    return await api('posts', 'POST', postData);
  }
}

async function main() {
  console.log('=== PUSHING FCA CONTENT & STRUCTURE TO WORDPRESS BACKEND ===');
  console.log(`Target: ${WP_URL}`);

  // 1. Categories
  console.log('\n--- 1. Setting up Categories ---');
  const catBlogId = await findOrCreateCategory('Blog & Industry News', 'blog');
  const catCoursesId = await findOrCreateCategory('Courses & Qualifications', 'courses');
  const catHairdressingId = await findOrCreateCategory('Hairdressing', 'hairdressing');
  const catBarberingId = await findOrCreateCategory('Barbering', 'barbering');
  const catBuildingId = await findOrCreateCategory('Building & Construction', 'building-construction');
  const catChildcareId = await findOrCreateCategory('Early Childhood Education', 'early-childhood-education-care');
  const catCommunityId = await findOrCreateCategory('Community Services', 'community-services');
  const catAreasId = await findOrCreateCategory('Local Areas & Campuses', 'local-areas');

  // 2. State & Core Pages
  console.log('\n--- 2. Setting up Core & State Pages ---');
  
  // Homepage
  await upsertPage({
    title: 'Homepage - Fran Capelli Academy',
    slug: 'home',
    content: `
      <!-- wp:heading -->
      <h2>Practical Industry Training Designed for Real Careers</h2>
      <!-- /wp:heading -->
      <!-- wp:paragraph -->
      <p>Nationally recognised training in Hairdressing, Barbering, Building & Construction, Early Childhood Education, and Community Services across Melbourne, Adelaide, Canberra, and Perth.</p>
      <!-- /wp:paragraph -->
      <!-- wp:paragraph -->
      <p><strong>RTO Code:</strong> 6055 | <strong>Skills SA Funding:</strong> Eligible students receive subsidised vocational training.</p>
      <!-- /wp:paragraph -->
    `,
    status: 'publish'
  });

  // Victoria Campus
  await upsertPage({
    title: 'Victoria Campus & Courses',
    slug: 'fran-capelli-academy-vic',
    content: `
      <h2>Fran Capelli Academy Victoria</h2>
      <p>Melbourne Campuses in Hawthorn and Coolaroo providing fully equipped salon and trade facilities.</p>
      <h3>Campus Locations:</h3>
      <ul>
        <li><strong>Hawthorn Campus:</strong> 355 Burwood Road, Hawthorn VIC 3122 (Near Glenferrie Station)</li>
        <li><strong>Coolaroo Campus:</strong> G01, 1510 Pascoe Vale Road, Coolaroo VIC 3048</li>
      </ul>
      <p><strong>Phone:</strong> 03 9818 0089 | <strong>Email:</strong> enquiries@fca.edu.au</p>
      <p>Victorian traineeship incentives and fee-for-service payment plans available.</p>
    `,
    status: 'publish'
  });

  // South Australia Funding
  await upsertPage({
    title: 'South Australia Funding & Mawson Lakes Campus',
    slug: 'south-australia-funding',
    content: `
      <h2>South Australia Skills SA Funded Training</h2>
      <p>Government subsidised training from $0.50 per nominal hour for eligible South Australian residents.</p>
      <h3>Mawson Lakes Campus:</h3>
      <p>1-3 Metro Parade, Mawson Lakes, South Australia, 5095</p>
      <p><strong>Phone:</strong> 08 7137 1433 | <strong>Email:</strong> enquiries@fca.edu.au</p>
      <h3>Subsidised Courses Available:</h3>
      <ul>
        <li><strong>CPC40120</strong> Certificate IV in Building and Construction (Pathway to Builder Licence)</li>
        <li><strong>CPC50220</strong> Diploma of Building and Construction (Building)</li>
        <li><strong>CHC30125</strong> Certificate III in Early Childhood Education and Care</li>
        <li><strong>CHC52025</strong> Diploma of Community Services</li>
        <li><strong>SHB30416</strong> Certificate III in Hairdressing</li>
      </ul>
    `,
    status: 'publish'
  });

  // ACT Hub
  await upsertPage({
    title: 'Canberra ACT Delivery Hub & Courses',
    slug: 'fran-capelli-academy-australiacapitalterritory',
    content: `
      <h2>Fran Capelli Academy Canberra ACT</h2>
      <p>Vocational education delivery hub in Canberra City providing blended learning and workplace practicals.</p>
      <p><strong>Address:</strong> Level 5, 15 Moore Street, Canberra City, ACT 2601</p>
      <p><strong>Phone:</strong> 03 9818 0089 | <strong>Email:</strong> enquiries@fca.edu.au</p>
    `,
    status: 'publish'
  });

  // WA Hub
  await upsertPage({
    title: 'Western Australia Blended Courses',
    slug: 'fran-capelli-academy-wa',
    content: `
      <h2>Fran Capelli Academy Western Australia</h2>
      <p>Flexible blended learning options for WA students in Barbering and Building qualifications.</p>
      <p><strong>Delivery:</strong> Virtual evening workshops with Perth salon partnerships.</p>
      <p><strong>Contact:</strong> enquiries@fca.edu.au</p>
    `,
    status: 'publish'
  });

  // About Us
  await upsertPage({
    title: 'About Fran Capelli Academy',
    slug: 'about-us',
    content: `
      <h2>About Fran Capelli Academy (RTO #6055)</h2>
      <p>Fran Capelli Academy is a distinguished Australian Registered Training Organisation dedicated to excellence in trade and vocational education.</p>
      <p>With modern campuses across Melbourne and Adelaide, and interactive delivery hubs in Canberra and Perth, we provide hands-on industry skills that lead directly into rewarding careers.</p>
    `,
    status: 'publish'
  });

  // Contact Us
  await upsertPage({
    title: 'Contact Us',
    slug: 'contact-us',
    content: `
      <h2>Get in Touch with Fran Capelli Academy</h2>
      <p><strong>National Inquiries:</strong> 03 9818 0089 / 08 7137 1433</p>
      <p><strong>Email:</strong> enquiries@fca.edu.au</p>
      <p><strong>Head Office:</strong> 355 Burwood Road, Hawthorn, VIC 3122</p>
    `,
    status: 'publish'
  });

  // 3. Accredited Courses in WordPress
  console.log('\n--- 3. Setting up Courses in WordPress ---');
  const courses = [
    {
      code: 'CPC40120',
      title: 'Certificate IV in Building and Construction',
      slug: 'cpc40120-certificate-iv-in-building-and-construction',
      category_id: catBuildingId,
      subsidised_fee: '$446 *Government Subsidised Fee',
      standard_fee: '$5,800 Full Fee',
      duration: '36 Weeks (Excluding holidays)',
      delivery_mode: 'Flexible (Real Time Virtual Classrooms + Site Practicals)',
      overview: 'This course is the premier pathway toward gaining your residential builder licence in Australia. Learn structural principles, building codes (BCA/NCC), project estimation, contract administration, and site safety.',
      funding_notes: 'Includes 6 units specifically aligned with Consumer and Business Services (CBS) business knowledge requirements for a South Australian Building Work Contractor Licence.'
    },
    {
      code: 'CPC50220',
      title: 'Diploma of Building and Construction (Building)',
      slug: 'cpc50220-diploma-of-building-and-construction-building',
      category_id: catBuildingId,
      subsidised_fee: '$1,065 *Government Subsidised Fee',
      standard_fee: '$9,200 Full Fee',
      duration: '62 Weeks (Excluding holidays)',
      delivery_mode: 'Real Time Virtual Interactive Classrooms + Site Case Studies',
      overview: 'Advance your construction management expertise to medium-rise residential and commercial builds (up to 3 storeys). Covers advanced structural concrete, seismic design, cost management, and legal dispute management.',
      funding_notes: 'South Australian Government Skills SA approved qualification for eligible participants.'
    },
    {
      code: 'SHB30416',
      title: 'Certificate III in Hairdressing',
      slug: 'shb30416-certificate-iii-in-hairdressing',
      category_id: catHairdressingId,
      subsidised_fee: '$1,250 *Government Subsidised',
      standard_fee: '$8,500 Full Fee',
      duration: '52 Weeks (Excluding holidays)',
      delivery_mode: 'On-Campus Salon & Blended Practical Workshops',
      overview: 'This qualification reflects the role of hairdressers who use a range of well-developed sales, consultative and technical skills and knowledge to provide a broad range of hairdressing services to clients. Train in fully equipped student salons on real clients.',
      funding_notes: 'Eligible students may access Skills SA subsidised funding in South Australia.'
    },
    {
      code: 'SHB30516',
      title: 'Certificate III in Barbering (Non-Apprenticeship)',
      slug: 'shb30516-certificate-iii-in-barbering-non-apprenticeship',
      category_id: catBarberingId,
      subsidised_fee: '$1,400 *Skills SA Subsidised',
      standard_fee: '$8,900 Full Fee',
      duration: '52 Weeks (Excluding holidays)',
      delivery_mode: 'Practical Barber Shop Studio & Blended Theory',
      overview: 'Learn traditional and modern barbering techniques including skin fades, beard shaping, traditional hot towel cut-throat wet shaves, and clipper-over-comb artistry in our barber studio.',
      funding_notes: 'South Australian Government subsidies available for eligible jobseekers and upskillers through Skills SA.'
    },
    {
      code: 'CHC30125',
      title: 'Certificate III in Early Childhood Education and Care',
      slug: 'chc30125-certificate-iii-in-early-childhood-education-care',
      category_id: catChildcareId,
      subsidised_fee: '$554 *Government Subsidised Fee',
      standard_fee: '$4,900 Full Fee',
      duration: '53 Weeks (Includes 160h Work Placement)',
      delivery_mode: 'Blended Learning + 160 Hours Regulated Center Practicum',
      overview: 'Prepare for a rewarding career nurturing early child development. Gain essential skills in Early Years Learning Framework (EYLF), child health and safety, cultural responsiveness, and play-based pedagogy.',
      funding_notes: 'Fully approved for South Australia Skills funding with high employer demand across daycare centers.'
    },
    {
      code: 'CHC52025',
      title: 'Diploma of Community Services',
      slug: 'chc52025-diploma-of-community-services-sa',
      category_id: catCommunityId,
      subsidised_fee: '$770 *Government Subsidised Fee',
      standard_fee: '$7,800 Full Fee',
      duration: '14 Months (Includes 200h Work Placement)',
      delivery_mode: 'Blended Online Workshops + Supervised Field Practicum',
      overview: 'Equip yourself to support vulnerable individuals and communities. Learn crisis intervention, advocacy, person-centred case coordination, and mental health first aid with hands-on field experience.',
      funding_notes: 'Subsidised by the Government of South Australia through Skills SA. High industry priority.'
    }
  ];

  for (const c of courses) {
    // Save as Post under Courses & Category
    await upsertPost({
      title: `${c.code} ${c.title}`,
      slug: c.slug,
      categories: [catCoursesId, c.category_id],
      excerpt: c.overview.substring(0, 160) + '...',
      content: `
        <h2>${c.code} - ${c.title}</h2>
        <p><strong>Duration:</strong> ${c.duration}</p>
        <p><strong>Subsidised Fee:</strong> ${c.subsidised_fee}</p>
        <p><strong>Standard Fee:</strong> ${c.standard_fee}</p>
        <p><strong>Delivery Mode:</strong> ${c.delivery_mode}</p>
        <hr />
        <h3>Course Overview</h3>
        <p>${c.overview}</p>
        <h3>Funding & Subsidies</h3>
        <p>${c.funding_notes}</p>
      `,
      status: 'publish'
    });
  }

  // 4. Blog Posts
  console.log('\n--- 4. Setting up Blog Posts in WordPress ---');
  const blogPosts = [
    {
      title: 'Why Barbering is Fastest Growing Trade in 2026',
      slug: 'why-barbering-is-fastest-growing-trade-2026',
      categories: [catBlogId, catBarberingId],
      excerpt: 'Explore modern fade techniques, boutique salon demand, and high student retention.',
      content: `
        <p>Barbering has rapidly evolved from a traditional grooming necessity into one of Australia’s most vibrant, high-demand creative trades.</p>
        <h3>Modern Salon & Barber Studio Culture</h3>
        <p>From high-precision skin fades and texturised scissor work to classic beard shaping and luxury hot towel shave treatments, today's barbers are sought after as skilled artisans.</p>
        <p>At Fran Capelli Academy, students train in working salon spaces with real clients, mastering customer service alongside technical styling mastery.</p>
      `
    },
    {
      title: 'Navigating Skills SA Subsidised Training in 2026',
      slug: 'navigating-skills-sa-subsidised-training-2026',
      categories: [catBlogId],
      excerpt: 'How eligible South Australian residents can access government-supported qualifications from $0.50 per nominal hour.',
      content: `
        <p>The Government of South Australia continues to invest heavily in vocational education through Skills SA subsidised initiatives.</p>
        <h3>Eligibility Essentials:</h3>
        <ul>
          <li>Australian Citizen, Permanent Resident, or eligible visa holder residing in South Australia</li>
          <li>Aged 16 years or over and not currently enrolled in school</li>
          <li>Seeking employment or advancing within priority trade sectors like Building, Early Childhood, or Community Services</li>
        </ul>
        <p>Contact our Mawson Lakes student advisory team to verify your course fee entitlement today.</p>
      `
    },
    {
      title: 'Salon Safety and Compliance Guidelines for Trainees',
      slug: 'salon-safety-and-compliance-guidelines',
      categories: [catBlogId, catHairdressingId],
      excerpt: 'Essential sterilization, chemical handling, and workplace health standards in professional hairdressing.',
      content: `
        <p>Professional salon hygiene is the bedrock of client trust and industry accreditation under Australian RTO standards.</p>
        <p>Every student at Fran Capelli Academy learns strict disinfection protocols, safe storage of colour chemicals, and ergonomic workstation setups before their first live client appointment.</p>
      `
    }
  ];

  for (const b of blogPosts) {
    await upsertPost({
      title: b.title,
      slug: b.slug,
      categories: b.categories,
      excerpt: b.excerpt,
      content: b.content,
      status: 'publish'
    });
  }

  // 5. Local Area Pages in WordPress
  console.log('\n--- 5. Setting up Local Areas in WordPress ---');
  const areas = [
    {
      title: 'Hawthorn Campus - Melbourne VIC',
      slug: 'hawthorn-vic',
      categories: [catAreasId],
      excerpt: 'Primary Victorian campus equipped with commercial student hair salon and lecture facilities.',
      content: `
        <h2>Hawthorn Campus - Physical Campus</h2>
        <p><strong>Address:</strong> 355 Burwood Road, Hawthorn VIC 3122</p>
        <p><strong>Campus Facilities:</strong> Student commercial hair and barber salon, modern theory suites, close to Glenferrie Station.</p>
        <p><strong>Delivery:</strong> On-campus practical salon sessions and daytime trade classes.</p>
      `
    },
    {
      title: 'Mawson Lakes Campus - Adelaide SA',
      slug: 'mawson-lakes-sa',
      categories: [catAreasId],
      excerpt: 'Flagship South Australian campus delivering Skills SA subsidised training in Building, Childcare, and Trades.',
      content: `
        <h2>Mawson Lakes Campus - Physical Campus</h2>
        <p><strong>Address:</strong> 1-3 Metro Parade, Mawson Lakes SA 5095</p>
        <p><strong>Campus Facilities:</strong> Trade workshops, seminar halls, dedicated student consultation rooms.</p>
        <p><strong>Subsidised Training:</strong> Supported by Skills SA for eligible South Australian participants.</p>
      `
    },
    {
      title: 'Geelong Regional Delivery Hub - VIC',
      slug: 'geelong-vic',
      categories: [catAreasId],
      excerpt: 'Official service delivery area offering blended virtual evening lectures and arranged local salon practicals.',
      content: `
        <h2>Geelong - Official Service Area</h2>
        <p><em>Note: This is an accredited regional delivery area rather than a physical campus.</em></p>
        <p><strong>Delivery:</strong> Interactive virtual evening lectures with arranged salon practical training in local Geelong partner studios.</p>
        <p><strong>Relevant Qualifications:</strong> Barbering, Building & Construction.</p>
      `
    }
  ];

  for (const a of areas) {
    await upsertPost({
      title: a.title,
      slug: a.slug,
      categories: a.categories,
      excerpt: a.excerpt,
      content: a.content,
      status: 'publish'
    });
  }

  console.log('\n======================================================');
  console.log('   WORDPRESS CONTENT SYNC COMPLETED SUCCESSFULLY!     ');
  console.log('======================================================');
}

main().catch(err => {
  console.error('WordPress Sync Error:', err);
  process.exit(1);
});

