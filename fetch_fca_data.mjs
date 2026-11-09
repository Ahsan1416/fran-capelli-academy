import fs from 'fs';
import path from 'path';

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  if (!fs.existsSync('fca_data')) fs.mkdirSync('fca_data');

  console.log('Fetching WP Pages...');
  try {
    const pages = await fetchJSON('https://www.fca.edu.au/wp-json/wp/v2/pages?per_page=100');
    console.log(`Fetched ${pages.length} pages.`);
    fs.writeFileSync('fca_data/pages.json', JSON.stringify(pages.map(p => ({
      id: p.id,
      slug: p.slug,
      link: p.link,
      title: p.title?.rendered,
      excerpt: p.excerpt?.rendered,
      content: p.content?.rendered,
      featured_media: p.featured_media
    })), null, 2));
  } catch (e) {
    console.error('Error fetching pages:', e.message);
  }

  console.log('Fetching WP Posts...');
  try {
    const posts = await fetchJSON('https://www.fca.edu.au/wp-json/wp/v2/posts?per_page=100');
    console.log(`Fetched ${posts.length} posts.`);
    fs.writeFileSync('fca_data/posts.json', JSON.stringify(posts.map(p => ({
      id: p.id,
      slug: p.slug,
      link: p.link,
      title: p.title?.rendered,
      excerpt: p.excerpt?.rendered,
      content: p.content?.rendered,
      date: p.date,
      featured_media: p.featured_media
    })), null, 2));
  } catch (e) {
    console.error('Error fetching posts:', e.message);
  }

  console.log('Fetching WP Media...');
  try {
    const media = await fetchJSON('https://www.fca.edu.au/wp-json/wp/v2/media?per_page=100');
    console.log(`Fetched ${media.length} media items.`);
    fs.writeFileSync('fca_data/media.json', JSON.stringify(media.map(m => ({
      id: m.id,
      title: m.title?.rendered,
      source_url: m.source_url,
      mime_type: m.mime_type,
      alt_text: m.alt_text,
      media_details: {
        width: m.media_details?.width,
        height: m.media_details?.height,
        sizes: m.media_details?.sizes
      }
    })), null, 2));
  } catch (e) {
    console.error('Error fetching media:', e.message);
  }
}

main();

