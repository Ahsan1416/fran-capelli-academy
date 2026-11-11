import fs from 'fs';

const WP_URL = process.env.WORDPRESS_URL || 'https://darkgray-llama-274719.hostingersite.com';
const WP_USER = process.env.WORDPRESS_USER || 'admin';
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';
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

async function upsertPage(pageData) {
  const existing = await api(`pages?slug=${encodeURIComponent(pageData.slug)}`);
  if (existing && existing.length > 0) {
    const page = existing[0];
    console.log(`Updating WP Page: ${pageData.slug} (ID: ${page.id})`);
    return await api(`pages/${page.id}`, 'POST', pageData);
  } else {
    console.log(`Creating WP Page: ${pageData.slug}`);
    return await api('pages', 'POST', pageData);
  }
}

async function upsertPost(postData) {
  const existing = await api(`posts?slug=${encodeURIComponent(postData.slug)}`);
  if (existing && existing.length > 0) {
    const post = existing[0];
    console.log(`Updating WP Post: ${postData.slug} (ID: ${post.id})`);
    return await api(`posts/${post.id}`, 'POST', postData);
  } else {
    console.log(`Creating WP Post: ${postData.slug}`);
    return await api('posts', 'POST', postData);
  }
}

async function main() {
  console.log('=== SYNCING PERFECT HUMAN-EDITABLE CONTENT TO WORDPRESS ===');

  // 1. Homepage
  console.log('\n--- 1. Syncing Homepage ---');
  await upsertPage({
    slug: 'home',
    title: 'Practical Industry Training Designed for Real Careers',
    content: `
      <h1>Practical Industry Training Designed for Real Careers</h1>
      <p class="lead">Master high-demand trades in Hairdressing, Barbering, Building &amp; Construction, Early Childhood Education &amp; Care, and Community Services with state-of-the-art facilities and government funding options.</p>

      <h2>Why Study With Fran Capelli Academy?</h2>
      <p>Fran Capelli Academy (RTO # 6055) delivers hands-on vocational training designed for real career outcomes. With commercial student salons in Melbourne and Mawson Lakes, we focus on practical skills, industry knowledge, and job-ready training.</p>

      <h3>Key Academy Accreditations &amp; Highlights</h3>
      <ul>
        <li><strong>RTO # 6055:</strong> Nationally recognised Australian qualifications framework provider.</li>
        <li><strong>Skills SA Subsidised Funding:</strong> Eligible South Australian students access government funded courses from $0.50 per nominal hour.</li>
        <li><strong>Active Commercial Salons:</strong> Hands-on training on real paying clients in our Hawthorn and Mawson Lakes salons.</li>
        <li><strong>Flexible Evening Classes:</strong> Active tradespeople study virtual theory lectures in the evening without missing work on building sites.</li>
        <li><strong>Builder Licence Benchmarks:</strong> CPC40120 units map directly to CBS South Australia Building Work Contractor Licence educational requirements.</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <h3>Are Fran Capelli Academy qualifications nationally recognised?</h3>
      <p>Yes. Fran Capelli Academy is a Registered Training Organisation (RTO # 6055) accredited by ASQA. All certificates and diplomas are recognised across Australia.</p>
      <h3>How does South Australia Skills SA funding work?</h3>
      <p>Eligible South Australian residents can access government-subsidised training with student contributions starting from just $0.50 per nominal hour.</p>
      <h3>Where are your training salons located?</h3>
      <p>We operate fully equipped commercial student salons in Hawthorn VIC (355 Burwood Road) and Mawson Lakes SA (1-3 Metro Parade).</p>
      <h3>Can I study building qualifications while working on site?</h3>
      <p>Yes! Our CPC40120 and CPC50220 qualifications feature flexible evening virtual classes so active tradespeople can study without missing work.</p>
    `,
    status: 'publish'
  });

  // 2. All 6 Courses (Clean structured text matching website)
  console.log('\n--- 2. Syncing Courses with Exact Fields ---');

  const courses = [
    {
      slug: 'cpc40120-certificate-iv-in-building-and-construction',
      title: 'CPC40120 Certificate IV in Building and Construction',
      code: 'CPC40120',
      duration: '36 Weeks (Excluding holidays)',
      subsidised_fee: '$446 *Government Subsidised Fee',
      standard_fee: '$5,800 Full Fee',
      delivery_mode: 'Flexible (Real Time Virtual Classrooms + Site Practicals)',
      prerequisite: 'Basic numeracy and literacy; building experience recommended',
      funding_notes: 'Includes 6 units specifically aligned with Consumer and Business Services (CBS) business knowledge requirements for a South Australian Building Work Contractor Licence.',
      overview: 'This course is the premier pathway toward gaining your residential builder licence in Australia. Learn structural principles, building codes (BCA/NCC), project estimation, contract administration, and site safety.',
      career_outcomes: ['Licensed Builder / Contractor', 'Site Supervisor', 'Construction Project Coordinator', 'Foreperson']
    },
    {
      slug: 'cpc50220-diploma-of-building-and-construction-building',
      title: 'CPC50220 Diploma of Building and Construction (Building)',
      code: 'CPC50220',
      duration: '62 Weeks (Excluding holidays)',
      subsidised_fee: '$1,065 *Government Subsidised Fee',
      standard_fee: '$9,200 Full Fee',
      delivery_mode: 'Real Time Virtual Interactive Classrooms + Site Case Studies',
      prerequisite: 'CPC40120 or relevant trade background',
      funding_notes: 'South Australian Government Skills SA approved qualification for eligible participants.',
      overview: 'Advance your construction management expertise to medium-rise residential and commercial builds (up to 3 storeys). Covers advanced structural concrete, seismic design, cost management, and legal dispute management.',
      career_outcomes: ['Commercial Builder', 'Construction Manager', 'General Foreperson', 'Principal Contractor']
    },
    {
      slug: 'shb30416-certificate-iii-in-hairdressing',
      title: 'SHB30416 Certificate III in Hairdressing',
      code: 'SHB30416',
      duration: '52 Weeks (Excluding holidays)',
      subsidised_fee: '$1,250 *Government Subsidised',
      standard_fee: '$8,500 Full Fee',
      delivery_mode: 'On-Campus Salon & Blended Practical Workshops',
      prerequisite: 'There is no qualification prerequisite',
      funding_notes: 'Eligible students may access Skills SA subsidised funding in South Australia. Student contribution fees apply.',
      overview: 'This qualification reflects the role of hairdressers who use a range of well-developed sales, consultative and technical skills and knowledge to provide a broad range of hairdressing services to clients. You will train in our fully equipped student salons on real clients.',
      career_outcomes: ['Qualified Senior Hairdresser', 'Salon Stylist', 'Hairdressing Colorist Specialist', 'Salon Manager / Owner']
    },
    {
      slug: 'shb30516-certificate-iii-in-barbering-non-apprenticeship',
      title: 'SHB30516 Certificate III in Barbering (Non-Apprenticeship)',
      code: 'SHB30516',
      duration: '52 Weeks (Excluding holidays)',
      subsidised_fee: '$1,400 *Skills SA Subsidised',
      standard_fee: '$8,900 Full Fee',
      delivery_mode: 'Practical Barber Shop Studio & Blended Theory',
      prerequisite: 'No prior barbering experience needed',
      funding_notes: 'South Australian Government subsidies available for eligible jobseekers and upskillers through Skills SA.',
      overview: 'Learn traditional and modern barbering techniques including skin fades, beard shaping, traditional hot towel cut-throat wet shaves, and clipper-over-comb artistry in our barber studio.',
      career_outcomes: ['Master Barber', 'Fade & Beard Specialist', 'Barber Shop Manager', 'Freelance Grooming Artist']
    },
    {
      slug: 'chc30125-certificate-iii-in-early-childhood-education-care',
      title: 'CHC30125 Certificate III in Early Childhood Education and Care',
      code: 'CHC30125',
      duration: '53 Weeks (Includes 160h Work Placement)',
      subsidised_fee: '$554 *Government Subsidised Fee',
      standard_fee: '$4,900 Full Fee',
      delivery_mode: 'Blended Learning + 160 Hours Regulated Center Practicum',
      prerequisite: 'Working with Children Check (WWCC) & National Police Clearance',
      funding_notes: 'Fully approved for South Australia Skills funding with high employer demand across daycare centers.',
      overview: 'Prepare for a rewarding career nurturing early child development. Gain essential skills in Early Years Learning Framework (EYLF), child health and safety, cultural responsiveness, and play-based pedagogy.',
      career_outcomes: ['Early Childhood Educator', 'Child Care Center Worker', 'Family Day Care Educator', 'Kindergarten Assistant']
    },
    {
      slug: 'chc52025-diploma-of-community-services-sa',
      title: 'CHC52025 Diploma of Community Services',
      code: 'CHC52025',
      duration: '14 Months (Includes 200h Work Placement)',
      subsidised_fee: '$770 *Government Subsidised Fee',
      standard_fee: '$7,800 Full Fee',
      delivery_mode: 'Blended Online Workshops + Supervised Field Practicum',
      prerequisite: 'Completion of Year 12 or Certificate III in Community Services',
      funding_notes: 'Subsidised by the Government of South Australia through Skills SA. High industry priority.',
      overview: 'Equip yourself to support vulnerable individuals and communities. Learn crisis intervention, advocacy, person-centred case coordination, and mental health first aid with hands-on field experience.',
      career_outcomes: ['Case Manager', 'Community Development Worker', 'Youth & Family Support Specialist', 'Crisis Support Coordinator']
    }
  ];

  for (const c of courses) {
    const content = `
      <h2>${c.title}</h2>
      <p><strong>Duration:</strong> ${c.duration}</p>
      <p><strong>Subsidised Fee:</strong> ${c.subsidised_fee}</p>
      <p><strong>Standard Fee:</strong> ${c.standard_fee}</p>
      <p><strong>Delivery Mode:</strong> ${c.delivery_mode}</p>
      <p><strong>Prerequisite:</strong> ${c.prerequisite}</p>
      <p><strong>Government Funding Notes:</strong> ${c.funding_notes}</p>

      <h3>Course Overview</h3>
      <p>${c.overview}</p>

      <h3>Career Pathways &amp; Job Outcomes</h3>
      <ul>
        ${c.career_outcomes.map(item => `<li>${item}</li>`).join('\n        ')}
      </ul>
    `;

    // Save as Post
    await upsertPost({
      slug: c.slug,
      title: c.title,
      content,
      status: 'publish'
    });

    // Also save as Page
    await upsertPage({
      slug: c.slug,
      title: c.title,
      content,
      status: 'publish'
    });
  }

  // 3. State & Core Pages
  console.log('\n--- 3. Syncing State Pages ---');

  // Victoria
  await upsertPage({
    slug: 'fran-capelli-academy-vic',
    title: 'Victoria Campus & Courses | Fran Capelli Academy',
    content: `
      <h2>Fran Capelli Academy Victoria</h2>
      <p class="lead">Melbourne Campuses in Hawthorn and Coolaroo providing fully equipped commercial salon and trade facilities.</p>

      <h3>Campus Locations &amp; Contacts</h3>
      <ul>
        <li><strong>Hawthorn Campus:</strong> 355 Burwood Road, Hawthorn VIC 3122 (Near Glenferrie Station)</li>
        <li><strong>Coolaroo Campus:</strong> G01, 1510 Pascoe Vale Road, Coolaroo VIC 3048</li>
        <li><strong>Campus Phone:</strong> 03 9818 0089</li>
        <li><strong>Email:</strong> enquiries@fca.edu.au</li>
      </ul>

      <h3>Victorian Training Facilities</h3>
      <p>Our Melbourne facilities include a dedicated student hair and barber salon open to the general public, interactive classroom amenities, and industry-connected master trainers ready to guide you from enrollment to graduation.</p>

      <h3>Funding &amp; Payment Options</h3>
      <p>Victorian traineeship incentives and fee-for-service flexible payment plans are available across all trade qualifications.</p>
    `,
    status: 'publish'
  });

  // South Australia
  await upsertPage({
    slug: 'south-australia-funding',
    title: 'South Australia Funding & Mawson Lakes Campus | Fran Capelli Academy',
    content: `
      <h2>South Australia Skills SA Funded Training</h2>
      <p class="lead">Government subsidised training starting from $0.50 per nominal hour for eligible South Australian residents.</p>

      <h3>Mawson Lakes Flagship Campus</h3>
      <p><strong>Campus Address:</strong> 1-3 Metro Parade, Mawson Lakes, South Australia, 5095</p>
      <p><strong>Campus Phone:</strong> 08 7137 1433 | <strong>Email:</strong> enquiries@fca.edu.au</p>

      <h3>Skills SA Subsidised Qualifications</h3>
      <ul>
        <li><strong>CPC40120 Certificate IV in Building and Construction:</strong> Benchmark pathway to CBS Building Work Contractor Licence.</li>
        <li><strong>CPC50220 Diploma of Building and Construction (Building):</strong> Medium-rise construction and management.</li>
        <li><strong>CHC30125 Certificate III in Early Childhood Education and Care:</strong> High demand childcare qualification.</li>
        <li><strong>CHC52025 Diploma of Community Services:</strong> Case management and family support.</li>
        <li><strong>SHB30416 Certificate III in Hairdressing:</strong> Comprehensive cutting and colouring.</li>
      </ul>

      <h3>Am I Eligible for Skills SA Funding?</h3>
      <p>You may be eligible if you are an Australian citizen, permanent resident, or eligible visa holder residing or working in South Australia, aged 16 or over, and not enrolled in school.</p>
    `,
    status: 'publish'
  });

  // About Us (preserving any edits)
  await upsertPage({
    slug: 'about-us',
    title: 'About Fran Capelli Academy lun',
    content: `
      <h2>About Fran Capelli Academy (RTO # 6055)</h2>
      <p class="lead">Dedicated to empowering Australian students with practical skills, master trainers, and industry outcomes.</p>

      <h3>Our Mission &amp; Industry Standards</h3>
      <p>At Fran Capelli Academy, we believe vocational education should be grounded in real-world application. Whether you are cutting and coloring in our Melbourne salons, managing residential timber frames in Adelaide, or supporting families in early childhood education, our curriculum is shaped by current Australian trade standards.</p>

      <h3>Key Accreditations</h3>
      <ul>
        <li><strong>Registered Training Organisation:</strong> National Provider RTO # 6055.</li>
        <li><strong>Skills SA Approved:</strong> Subsidised training partner with the Government of South Australia.</li>
        <li><strong>National Quality Framework:</strong> Compliant with ASQA standards across all delivery locations.</li>
      </ul>
    `,
    status: 'publish'
  });

  // Contact Us
  await upsertPage({
    slug: 'contact-us',
    title: 'Contact Us | Fran Capelli Academy',
    content: `
      <h2>Contact Fran Capelli Academy</h2>
      <p class="lead">Speak with our student enrollment advisors or visit one of our campus locations.</p>

      <h3>National Campus Phone Lines</h3>
      <ul>
        <li><strong>Melbourne Campus (VIC):</strong> 03 9818 0089</li>
        <li><strong>Adelaide Campus (SA):</strong> 08 7137 1433</li>
        <li><strong>Direct WhatsApp:</strong> +61 413 826 320</li>
        <li><strong>General Email:</strong> enquiries@fca.edu.au</li>
      </ul>

      <h3>Physical Campus Locations</h3>
      <ul>
        <li><strong>Hawthorn Campus (VIC):</strong> 355 Burwood Road, Hawthorn VIC 3122</li>
        <li><strong>Coolaroo Campus (VIC):</strong> G01, 1510 Pascoe Vale Road, Coolaroo VIC 3048</li>
        <li><strong>Mawson Lakes Campus (SA):</strong> 1-3 Metro Parade, Mawson Lakes SA 5095</li>
        <li><strong>Canberra City Hub (ACT):</strong> Level 5, 15 Moore Street, Canberra City ACT 2601</li>
      </ul>
    `,
    status: 'publish'
  });

  console.log('\n============================================================');
  console.log('   PERFECT HUMAN-EDITABLE WORDPRESS CONTENT SYNC COMPLETE!  ');
  console.log('============================================================');
}

main().catch(err => {
  console.error('Sync error:', err);
  process.exit(1);
});

