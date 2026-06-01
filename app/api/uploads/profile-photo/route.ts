import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { NextResponse } from 'next/server';
import { makeToken } from '@/lib/crypto';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
  if (!allowed.has(file.type)) return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });

  const ext = extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : file.type === 'image/gif' ? '.gif' : '.jpg');
  const filename = `${makeToken(12)}${ext}`;
  const dir = join(process.cwd(), 'data', 'uploads', 'profiles');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/uploads/profile-photo/${filename}` });
}
