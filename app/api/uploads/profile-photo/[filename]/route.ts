import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { NextResponse } from 'next/server';

const contentTypes: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (filename.includes('/') || filename.includes('..')) return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  const file = await readFile(join(process.cwd(), 'data', 'uploads', 'profiles', filename)).catch(() => null);
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(file, { headers: { 'content-type': contentTypes[extname(filename).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' } });
}
