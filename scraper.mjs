import fs from 'fs';

async function main() {
  try {
    const res = await fetch('https://www.fca.edu.au/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('HTTP Status:', res.status);
    const html = await res.text();
    console.log('HTML Length:', html.length);
    fs.writeFileSync('homepage.html', html, 'utf-8');
    console.log('Saved homepage.html');

    // Extract title
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1];
    console.log('Title:', title);

    // Extract all navigation links
    const linkRegex = /href=["'](https?:\/\/www\.fca\.edu\.au\/[^"'#]+|\/[^"'#]+)["']/gi;
    const links = new Set();
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.add(match[1]);
    }
    console.log('Found total unique links:', links.size);
    fs.writeFileSync('links.json', JSON.stringify([...links], null, 2));

    // Extract all images
    const imgRegex = /(?:src|srcset|data-src)=["']([^"']+\.(?:png|jpg|jpeg|webp|svg|gif)[^"']*)["']/gi;
    const images = new Set();
    while ((match = imgRegex.exec(html)) !== null) {
      images.add(match[1]);
    }
    console.log('Found total images:', images.size);
    fs.writeFileSync('images.json', JSON.stringify([...images], null, 2));

  } catch (err) {
    console.error('Fetch error:', err);
  }
}

main();

