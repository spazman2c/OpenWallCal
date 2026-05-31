import { makePairingCode } from '@/lib/crypto';
import { sql } from '@/lib/db';

export default async function SetupPage() {
  const code = makePairingCode();
  await sql`insert into devices (pairing_code, pairing_expires_at, name) values (${code}, now() + interval '15 minutes', 'Unpaired Display')`;
  return <main className="display-bg grid min-h-screen place-items-center p-8 text-white"><div className="max-w-2xl rounded-[2rem] bg-white/10 p-10 text-center shadow-2xl backdrop-blur"><div className="font-display text-6xl">Pair this display</div><p className="mt-4 text-xl text-white/70">From your phone or laptop, open Devices and enter this code.</p><div className="my-8 rounded-[2rem] bg-butter px-10 py-8 font-mono text-8xl font-black tracking-[0.18em] text-ink">{code}</div><p className="text-white/55">Code expires in 15 minutes. Refresh for a new one.</p></div></main>;
}
