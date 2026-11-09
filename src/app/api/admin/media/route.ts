import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('altText') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean and unique filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // Record in media_items table
    const db = await getDB();
    const res = await db.query(
      `INSERT INTO media_items (filename, url, alt_text, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [filename, publicUrl, altText, file.type, buffer.length]
    );

    return NextResponse.json({
      success: true,
      media: res.rows[0],
      url: publicUrl
    });
  } catch (err: any) {
    console.error('Media upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

