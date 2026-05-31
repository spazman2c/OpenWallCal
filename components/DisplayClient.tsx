'use client';

import { addDays, format, isSameDay, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns';
import { BookOpen, CalendarDays, CheckCircle2, CloudSun, Image, ListChecks, Moon, RefreshCw, Settings, ShoppingBasket, Soup, Star, Utensils, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { DisplayEvent, DisplaySnapshot } from '@/lib/types';

const displayNav = [
  { label: 'Calendar', href: '/display/calendar', icon: CalendarDays },
  { label: 'Lists', href: '/display/lists', icon: ListChecks },
  { label: 'Tasks', href: '/display/tasks', icon: CheckCircle2 },
  { label: 'Rewards', href: '/display/rewards', icon: Star },
  { label: 'Meals', href: '/display/meals', icon: Utensils },
  { label: 'Recipes', href: '/display/recipes', icon: BookOpen },
  { label: 'Photos', href: '/display/photos', icon: Image },
  { label: 'Sleep', href: '/display/sleep', icon: Moon },
  { label: 'Settings', href: '/display/settings', icon: Settings }
] as const;

function parseDate(value: string) {
  return parseISO(value.length === 10 ? `${value}T12:00:00` : value);
}

function timeLabel(value: string, allDay?: boolean) {
  if (allDay) return 'All day';
  return format(parseISO(value), 'h:mm a');
}

function dayLabel(value: string) {
  const date = parseISO(value);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE');
}

function EventCard({ event, featured = false }: { event: DisplayEvent; featured?: boolean }) {
  if (featured) {
    return <article className="hb-next-event"><div className="hb-pill">Next up</div><div className="hb-event-time">{dayLabel(event.startsAt)} · {timeLabel(event.startsAt, event.allDay)}</div><div className="hb-next-title">{event.title}</div>{event.location ? <div className="hb-muted">{event.location}</div> : null}</article>;
  }
  return <article className="hb-agenda-row"><div><b>{dayLabel(event.startsAt)}</b><span>{timeLabel(event.startsAt, event.allDay)}</span></div><div><strong>{event.title}</strong>{event.location ? <span>{event.location}</span> : null}</div></article>;
}

export function DisplayClient({ initialSnapshot }: { initialSnapshot: DisplaySnapshot }) {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [offline, setOffline] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setClock(new Date()), 1000 * 30);
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/display/snapshot', { cache: 'no-store' });
        if (!res.ok) throw new Error('snapshot failed');
        const data = await res.json();
        setSnapshot(data);
        localStorage.setItem('homeboard:lastSnapshot', JSON.stringify(data));
        setOffline(false);
      } catch {
        const cached = localStorage.getItem('homeboard:lastSnapshot');
        if (cached) setSnapshot(JSON.parse(cached));
        setOffline(true);
      }
    }, 60000);
    return () => { clearInterval(tick); clearInterval(poll); };
  }, []);

  const view = pathname === '/display' || pathname === '/display/home' ? 'calendar' : pathname.split('/').pop() ?? 'calendar';
  const today = startOfDay(clock);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(today, index)), [today.getTime()]);
  const nextEvent = snapshot.events[0];
  const upcomingEvents = snapshot.events.slice(nextEvent ? 1 : 0, nextEvent ? 6 : 5);
  const dinner = snapshot.meals.find((meal) => meal.category.toLowerCase() === 'dinner' && isToday(parseDate(meal.mealDate))) ?? snapshot.meals[0];
  const openTasks = snapshot.tasks.filter((task) => task.status === 'open').slice(0, 8);
  const grocery = snapshot.lists.find((list) => list.listType === 'grocery') ?? snapshot.lists[0];
  const todoList = snapshot.lists.find((list) => list.listType === 'todo');
  const activeProfiles = snapshot.profiles.slice(0, 6);

  function WeekGrid({ roomy = false }: { roomy?: boolean }) {
    return <div className={roomy ? 'hb-week-grid is-roomy' : 'hb-week-grid'}>{days.map((d) => {
      const dayMeals = snapshot.meals.filter((m) => isSameDay(parseDate(m.mealDate), d));
      const dayEvents = snapshot.events.filter((event) => isSameDay(parseISO(event.startsAt), d));
      return <div key={d.toISOString()} className="hb-day-card"><div className="hb-day-top"><b>{format(d, 'EEE')}</b><strong>{format(d, 'd')}</strong></div><div className="hb-day-items">{dayEvents.slice(0, roomy ? 4 : 2).map((event) => <span key={event.id} className="hb-chip hb-chip-dark">{event.title}</span>)}{dayMeals.slice(0, 2).map((m) => <span key={m.id} className="hb-chip hb-chip-meal">{m.title}</span>)}</div></div>;
    })}</div>;
  }

  const header = <header className="hb-card hb-header"><div className="hb-timeblock"><div className="hb-dayname">{format(clock, 'EEEE')}</div><div className="hb-dateline">{format(clock, 'MMMM d')} · {format(clock, 'h:mm a')}</div></div><div className="hb-profiles">{activeProfiles.map((p) => <span key={p.id} className="hb-avatar" style={{ background: p.color }} title={p.name}>{p.initials}</span>)}</div><div className="hb-status-grid"><div className="hb-mini-card"><CloudSun size={19} /><b>{snapshot.weather?.temperature}</b><span>{snapshot.weather?.highLow}</span></div><div className="hb-mini-card"><RefreshCw size={19} /><span>Updated</span><b>{format(parseISO(snapshot.generatedAt), 'h:mm a')}</b></div></div></header>;

  function MainContent() {
    if (view === 'tasks') return <><section className="hb-card hb-view-main"><div className="hb-kicker"><CheckCircle2 size={16} /> Chores and routines</div><h1>Tasks</h1><div className="hb-task-list is-large">{openTasks.map((task) => <div key={task.id} className="hb-task-row"><span>{task.emoji ?? 'ok'}</span><b>{task.title}</b>{task.starValue ? <em><Star size={14} />{task.starValue}</em> : null}</div>)}</div></section><section className="hb-card hb-view-side"><h2>Today’s focus</h2><p>{openTasks.length ? `${openTasks.length} open task${openTasks.length === 1 ? '' : 's'} for the household.` : 'All clear for now.'}</p></section></>;
    if (view === 'lists') return <><section className="hb-card hb-view-main"><div className="hb-kicker"><ListChecks size={16} /> Household lists</div><h1>Lists</h1><div className="hb-list-grid">{snapshot.lists.map((list) => <article key={list.id} className="hb-list-card"><h2>{list.title}</h2>{list.items.filter((item) => !item.completed).slice(0, 8).map((item) => <span key={item.id}>{item.name}</span>)}</article>)}</div></section><section className="hb-card hb-view-side"><h2>Quick count</h2><p>{grocery ? `${grocery.items.filter((item) => !item.completed).length} grocery items open.` : 'No grocery list yet.'}</p></section></>;
    if (view === 'meals') return <><section className="hb-card hb-view-main"><div className="hb-kicker"><Utensils size={16} /> Meal plan</div><h1>Meals</h1><WeekGrid roomy /></section><section className="hb-card hb-dinner-card hb-view-side"><h2><Soup /> Dinner</h2><strong>{dinner?.title ?? 'No dinner planned'}</strong>{dinner?.notes ? <p>{dinner.notes}</p> : null}</section></>;
    if (view === 'rewards') return <><section className="hb-card hb-view-main"><div className="hb-kicker"><Star size={16} /> Stars and rewards</div><h1>Rewards</h1><div className="hb-placeholder-grid">{snapshot.profiles.map((p) => <article key={p.id}><span style={{ background: p.color }}>{p.initials}</span><b>{p.name}</b><strong>0 stars</strong></article>)}</div></section><section className="hb-card hb-view-side"><h2>Coming next</h2><p>Reward catalog, star balances, and redemption approvals are scaffolded in the database.</p></section></>;
    if (view === 'recipes') return <><section className="hb-card hb-view-main"><div className="hb-kicker"><BookOpen size={16} /> Recipe box</div><h1>Recipes</h1><div className="hb-empty">Recipe browsing and recipe-to-grocery actions are next in the product context.</div></section><section className="hb-card hb-view-side"><h2>Starter idea</h2><p>Save dinners as recipes, then send ingredients to Grocery.</p></section></>;
    if (view === 'photos') return <><section className="hb-card hb-view-main hb-photo-preview"><div><Image size={42} /><h1>Photos</h1><p>Screensaver albums will live here for idle wall-display mode.</p></div></section><section className="hb-card hb-view-side"><h2>Idle mode</h2><p>Photos can later show behind a clock and next-event overlay.</p></section></>;
    if (view === 'sleep') return <><section className="hb-card hb-view-main hb-sleep-preview"><div><Moon size={44} /><h1>Sleep mode</h1><p>Dim overlay and scheduled wake/sleep controls for the kitchen screen.</p></div></section><section className="hb-card hb-view-side"><h2>Tonight</h2><p>Sleep schedule is not configured yet.</p></section></>;
    if (view === 'settings') return <><section className="hb-card hb-view-main"><div className="hb-kicker"><Settings size={16} /> Display settings</div><h1>Settings</h1><div className="hb-settings-list"><span>Household: {snapshot.household.name}</span><span>Timezone: {snapshot.household.timezone}</span><span>Device: {snapshot.device.name}</span><span>Mode: {snapshot.device.displayMode}</span></div></section><section className="hb-card hb-view-side"><h2>Local first</h2><p>This display is backed by your local Supabase/Postgres stack.</p></section></>;
    return <><section className="hb-card hb-today-card"><div className="hb-kicker"><CalendarDays size={16} /> Command center</div><h1>Today</h1>{nextEvent ? <EventCard event={nextEvent} featured /> : <div className="hb-empty">No events yet</div>}<div className="hb-agenda-list">{upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)}</div></section><section className="hb-card hb-week-card"><div className="hb-section-head"><h2>This week</h2><span>7 day glance</span></div><WeekGrid /></section><aside className="hb-side-stack"><section className="hb-card hb-tasks-card"><div className="hb-section-head"><h2><CheckCircle2 /> Chores</h2><span>{openTasks.length} open</span></div><div className="hb-task-list">{openTasks.slice(0, 5).map((task) => <div key={task.id} className="hb-task-row"><span>{task.emoji ?? 'ok'}</span><b>{task.title}</b>{task.starValue ? <em><Star size={14} />{task.starValue}</em> : null}</div>)}</div></section><section className="hb-card hb-dinner-card"><h2><Soup /> Dinner</h2><strong>{dinner?.title ?? 'No dinner planned'}</strong>{dinner?.notes ? <p>{dinner.notes}</p> : null}</section><section className="hb-card hb-grocery-card"><h2><ShoppingBasket /> Grocery</h2><div className="hb-grocery-list">{grocery?.items.filter((item) => !item.completed).slice(0, 4).map((item) => <span key={item.id}>{item.name}</span>)}</div></section></aside></>;
  }

  return <main className="hb-screen"><aside className="hb-rail" aria-label="Display navigation"><Link className="hb-rail-mark" href="/display" aria-label="Display home">S</Link><nav>{displayNav.map((item) => { const Icon = item.icon; const active = pathname === item.href || (view === 'calendar' && item.href === '/display/calendar'); return <Link key={item.href} className={active ? 'hb-rail-item is-active' : 'hb-rail-item'} href={item.href}><Icon size={24} strokeWidth={2.35} /><span>{item.label}</span></Link>; })}</nav></aside><section className={view === 'calendar' ? 'hb-board' : 'hb-board hb-board-view'}>{header}<MainContent /></section>{todoList ? <div className="hb-floating"><ListChecks size={18} />{todoList.items.filter((i) => !i.completed).length} to-dos</div> : null}{offline ? <div className="hb-offline"><WifiOff size={18} />Offline: showing cached data</div> : null}</main>;
}
