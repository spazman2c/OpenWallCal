import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';
const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(req: Request) { const input = schema.parse(await req.json()); const rows = await sql<any[]>`select id, password_hash from users_local where email=${input.email.toLowerCase()} limit 1`; if (!rows[0] || !(await bcrypt.compare(input.password, rows[0].password_hash))) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 }); await createSession(rows[0].id); return NextResponse.json({ ok: true }); }
