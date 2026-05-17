import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
  }

  try {
    const telegramForm = new FormData();
    telegramForm.append('chat_id', CHAT_ID);
    telegramForm.append('document', file, { filename: file.name });

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

    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    const filePath = fileData.result.file_path;
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    return NextResponse.json({ url, name: file.name, size: file.size });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload gagal' }, { status: 500 });
  }
}
