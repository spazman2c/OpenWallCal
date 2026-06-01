import { ApiForm } from '@/components/Forms';
import { sql } from '@/lib/db';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rows = await sql<any[]>`select hi.*, h.name as household_name from household_invites hi join households h on h.id = hi.household_id where hi.token=${token} limit 1`;
  const invite = rows[0];
  if (!invite) return <main className="appliance-bg grid min-h-screen place-items-center p-6"><div className="max-w-lg rounded-3xl bg-white p-8 shadow-card"><h1 className="font-display text-5xl">Invite not found</h1><p className="mt-3 text-ink/60">This household invite may have expired or already been removed.</p></div></main>;
  return <main className="appliance-bg grid min-h-screen place-items-center p-6"><div className="w-full max-w-lg"><p className="mb-3 inline-flex rounded-full bg-butter px-4 py-2 text-sm font-black text-ink">Household invite</p><h1 className="font-display text-6xl leading-none">Join {invite.household_name}</h1><p className="mb-6 mt-4 text-lg font-semibold text-ink/65">Create a local account for this household. Everything stays on this local OpenWallCal setup.</p><ApiForm endpoint="/api/household/invite/accept" redirectTo="/app" submitLabel="Accept invite" fields={[{ name: 'name', label: 'Your name', defaultValue: invite.invited_name ?? '', required: true }, { name: 'email', label: 'Email', type: 'email', defaultValue: invite.invited_email ?? '', required: true }, { name: 'password', label: 'Password', type: 'password', required: true }]}><input type="hidden" name="token" value={token} /></ApiForm></div></main>;
}
