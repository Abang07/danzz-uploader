import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: 'public' });

  return NextResponse.json({ url: blob.url, name: file.name, size: file.size });
}
