import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
  }

  // Cek ukuran file di sisi server
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File melebihi batas 50MB' }, { status: 400 });
  }

  try {
    const telegramForm = new FormData();
    telegramForm.append('chat_id', CHAT_ID);
    telegramForm.append('document', file, file.name);

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: telegramForm,
    });

    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    const fileId = data.result.document?.file_id ||
                   data.result.photo?.[0]?.file_id ||
                   data.result.video?.file_id ||
                   data.result.audio?.file_id;

    // Untuk file > 20MB, getFile tidak bisa — simpan file_id saja
    // User bisa akses file lewat bot Telegram langsung
    let url = null;

    if (file.size <= 20 * 1024 * 1024) {
      const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();
      if (fileData.ok) {
        url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
      }
    }

    return NextResponse.json({
      url: url || `https://t.me/${CHAT_ID}`, // fallback ke chat Telegram
      fileId,
      name: file.name,
      size: file.size,
      bigFile: file.size > 20 * 1024 * 1024,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload gagal' }, { status: 500 });
  }
      }
