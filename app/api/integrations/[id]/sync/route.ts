import { NextResponse } from 'next/server';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

function unfoldIcs(input: string) {
  return input.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
}

function valueFor(lines: string[], key: string) {
  const line = lines.find((item) => item.startsWith(`${key}:`) || item.startsWith(`${key};`));
  return line?.slice(line.indexOf(':') + 1).trim() ?? '';
}

function parseDate(value: string) {
  if (!value) return null;
  if (/^\d{8}$/.test(value)) return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`);
  const cleaned = value.replace(/Z$/, '');
  if (/^\d{8}T\d{6}$/.test(cleaned)) return new Date(`${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T${cleaned.slice(9, 11)}:${cleaned.slice(11, 13)}:${cleaned.slice(13, 15)}${value.endsWith('Z') ? 'Z' : ''}`);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function eventsFromIcs(text: string) {
  const lines = unfoldIcs(text);
  const events: string[][] = [];
  let current: string[] | null = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') current = [];
    else if (line === 'END:VEVENT' && current) { events.push(current); current = null; }
    else if (current) current.push(line);
  }
  return events.map((eventLines) => {
    const startsAt = parseDate(valueFor(eventLines, 'DTSTART'));
    const endsAt = parseDate(valueFor(eventLines, 'DTEND')) ?? (startsAt ? new Date(startsAt.getTime() + 60 * 60 * 1000) : null);
    return { title: valueFor(eventLines, 'SUMMARY') || 'Untitled event', description: valueFor(eventLines, 'DESCRIPTION') || null, location: valueFor(eventLines, 'LOCATION') || null, startsAt, endsAt, allDay: /^\d{8}$/.test(valueFor(eventLines, 'DTSTART')) };
  }).filter((event) => event.startsAt && event.endsAt);
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHousehold();
  const { id } = await params;
  const calendars = await sql<any[]>`select c.*, ca.id as account_id from calendars c join calendar_accounts ca on ca.id = c.calendar_account_id where c.id = ${id} and c.household_id = ${session.householdId} limit 1`;
  const calendar = calendars[0];
  if (!calendar) return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
  if (!calendar.ics_url) return NextResponse.json({ error: 'This integration does not have an ICS URL yet.' }, { status: 400 });

  try {
    const response = await fetch(calendar.ics_url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`ICS request failed with ${response.status}`);
    const imported = eventsFromIcs(await response.text()).slice(0, 250);
    const source = `ics:${calendar.id}`;
    await sql`delete from events where household_id = ${session.householdId} and source = ${source}`;
    for (const event of imported) {
      await sql`insert into events ${sql({ household_id: session.householdId, title: event.title, description: event.description, location: event.location, starts_at: event.startsAt, ends_at: event.endsAt, all_day: event.allDay, source, profile_ids: calendar.profile_id ? [calendar.profile_id] : [] })}`;
    }
    await sql`update calendar_accounts set last_synced_at = now(), last_error = null, status = 'active', updated_at = now() where id = ${calendar.account_id}`;
    return NextResponse.json({ ok: true, imported: imported.length });
  } catch (error) {
    await sql`update calendar_accounts set last_error = ${error instanceof Error ? error.message : 'Sync failed'}, status = 'error', updated_at = now() where id = ${calendar.account_id}`;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sync failed' }, { status: 400 });
  }
}
