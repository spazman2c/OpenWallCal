import { addDays, endOfDay, formatISO, startOfDay } from 'date-fns';
import { sql } from '@/lib/db';
import type { DisplaySnapshot } from '@/lib/types';

function dateOnly(value: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return formatISO(value, { representation: 'date' });
  return value.slice(0, 10);
}

export async function getDisplaySnapshot(householdId: string, deviceId?: string): Promise<DisplaySnapshot> {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(addDays(now, 6));

  const [households, devices, profiles, events, tasks, lists, listItems, meals] = await Promise.all([
    sql<any[]>`select id, name, timezone, week_starts_on from households where id = ${householdId} limit 1`,
    deviceId
      ? sql<any[]>`select id, name, display_mode, orientation from devices where id = ${deviceId} and household_id = ${householdId} limit 1`
      : sql<any[]>`select id, name, display_mode, orientation from devices where household_id = ${householdId} order by created_at asc limit 1`,
    sql<any[]>`select id, name, color, initials, emoji from profiles where household_id = ${householdId} and archived_at is null order by created_at asc`,
    sql<any[]>`select id, title, starts_at, ends_at, all_day, location, profile_ids, source from events where household_id = ${householdId} and starts_at <= ${end} and ends_at >= ${start} order by starts_at asc`,
    sql<any[]>`select id, title, emoji, due_date, due_time, time_of_day, assigned_profile_ids, claimed_by_profile_id, assignment_type, status, star_value from task_series where household_id = ${householdId} and (due_date is null or due_date <= ${formatISO(end, { representation: 'date' })}) order by due_time nulls last, created_at asc limit 24`,
    sql<any[]>`select id, title, color, list_type from lists where household_id = ${householdId} and hide_from_display = false order by created_at asc limit 4`,
    sql<any[]>`select id, list_id, name, quantity, completed_at from list_items where household_id = ${householdId} order by completed_at nulls first, sort_order asc, created_at asc limit 40`,
    sql<any[]>`select id, meal_date, category, title, notes from meals where household_id = ${householdId} and meal_date >= ${formatISO(start, { representation: 'date' })} and meal_date <= ${formatISO(end, { representation: 'date' })} order by meal_date asc`
  ]);

  const household = households[0];
  if (!household) throw new Error('Household not found');
  const device = devices[0] ?? { id: 'preview', name: 'Kitchen Calendar', display_mode: 'home', orientation: 'landscape' };

  return {
    household: { id: household.id, name: household.name, timezone: household.timezone, weekStartsOn: household.week_starts_on },
    device: { id: device.id, name: device.name, displayMode: device.display_mode, orientation: device.orientation },
    profiles: profiles.map((p) => ({ id: p.id, name: p.name, color: p.color, initials: p.initials, emoji: p.emoji })),
    events: events.map((e) => ({ id: e.id, title: e.title, startsAt: e.starts_at.toISOString(), endsAt: e.ends_at.toISOString(), allDay: e.all_day, location: e.location, profileIds: e.profile_ids ?? [], source: e.source })),
    tasks: tasks.map((t) => ({ id: t.id, title: t.title, emoji: t.emoji, dueDate: dateOnly(t.due_date), dueTime: t.due_time, timeOfDay: t.time_of_day, assignedProfileId: t.assigned_profile_ids?.[0] ?? null, claimedByProfileId: t.claimed_by_profile_id, assignmentType: t.assignment_type, status: t.status, starValue: t.star_value, isLate: Boolean(t.due_date && t.status === 'open' && new Date(t.due_date) < start) })),
    lists: lists.map((list) => ({ id: list.id, title: list.title, color: list.color, listType: list.list_type, items: listItems.filter((item) => item.list_id === list.id).slice(0, 6).map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, completed: Boolean(item.completed_at) })) })),
    meals: meals.map((m) => ({ id: m.id, mealDate: dateOnly(m.meal_date) ?? formatISO(now, { representation: 'date' }), category: m.category, title: m.title, notes: m.notes })),
    weather: { label: 'Local forecast', temperature: '--', highLow: 'Add weather API later', icon: 'partly-cloudy' },
    sync: { lastSyncedAt: now.toISOString(), hasErrors: false, errors: [] },
    generatedAt: now.toISOString()
  };
}
