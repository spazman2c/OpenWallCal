import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, CheckCircle2, ClipboardList, Monitor, Soup, Users } from 'lucide-react';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';
import { getDisplaySnapshot } from '@/lib/snapshot';
import { isSetupAcknowledged } from '@/lib/setup';

export default async function DashboardPage() {
  if (!(await isSetupAcknowledged())) redirect('/onboarding');
  const session = await requireHousehold();
  const [households, profiles] = await Promise.all([
    sql<any[]>`select * from households where id=${session.householdId} limit 1`,
    sql<any[]>`select id, name, initials, color, emoji, relationship, avatar_url, type from profiles where household_id=${session.householdId} and archived_at is null order by created_at asc`
  ]);
  const household = households[0];
  const snap = await getDisplaySnapshot(session.householdId);
  const cards = [
    ['Calendar', `${snap.events.length} events`, '/app/calendar', CalendarDays],
    ['Tasks', `${snap.tasks.filter(t => t.status === 'open').length} open`, '/app/tasks', CheckCircle2],
    ['Lists', `${snap.lists.length} lists`, '/app/lists', ClipboardList],
    ['Meals', `${snap.meals.length} planned`, '/app/meals', Soup],
    ['Profiles', `${profiles.length} people`, '/app/profiles', Users],
    ['Displays', snap.device.name, '/app/devices', Monitor]
  ] as const;

  return <div className="admin-home"><section className="admin-hero-card"><div><p className="admin-eyebrow">Local household hub</p><h1>{household.name}</h1><p>Manage your local family command center. These profiles and schedules feed the wall display running in kiosk mode.</p></div><div className="admin-hero-actions"><Link href="/display" className="admin-primary-action">Open wall display</Link><Link href="/app/settings" className="admin-secondary-action">Household settings</Link></div></section><section className="admin-profile-strip">{profiles.map((profile) => <Link href="/app/profiles" key={profile.id} className="admin-profile-card"><span className="admin-profile-photo" style={{ background: profile.avatar_url ? `center / cover url(${profile.avatar_url})` : profile.color }}>{profile.avatar_url ? '' : profile.emoji || profile.initials}</span><b>{profile.name}</b><small>{profile.relationship || profile.type}</small></Link>)}</section><section className="admin-dashboard-grid">{cards.map(([label, value, href, Icon]) => <Link key={href} href={href} className="admin-module-card"><Icon size={28} /><span>{label}</span><strong>{value}</strong></Link>)}</section><section className="admin-next-panel"><div><h2>Next on your wall</h2>{snap.events[0] ? <p><b>{snap.events[0].title}</b><br />{new Date(snap.events[0].startsAt).toLocaleString()}</p> : <p>No upcoming events yet. Add one from Calendar.</p>}</div><div><h2>Dinner</h2><p>{snap.meals[0]?.title ?? 'No meal planned yet.'}</p></div><div><h2>Local data</h2><p>Household data is stored locally and ready for file-DB mode as we continue the local-first build.</p></div></section></div>;
}
