import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';
const schema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6) });
export async function POST(req: Request) { const input = schema.parse(await req.json()); const password_hash = await bcrypt.hash(input.password, 10); const rows = await sql<any[]>`insert into users_local ${sql({ name: input.name, email: input.email.toLowerCase(), password_hash })} returning id`; await createSession(rows[0].id); return NextResponse.json({ ok: true }); }
