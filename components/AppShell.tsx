import Link from 'next/link';
import { CalendarDays, CheckSquare, ClipboardList, ChefHat, Gift, Monitor, Settings, Sparkles, Users } from 'lucide-react';
import { requireHousehold } from '@/lib/auth';

const nav = [
  ['Dashboard', '/app', CalendarDays],
  ['Calendar', '/app/calendar', CalendarDays],
  ['Tasks', '/app/tasks', CheckSquare],
  ['Lists', '/app/lists', ClipboardList],
  ['Meals', '/app/meals', ChefHat],
  ['Recipes', '/app/recipes', ChefHat],
  ['Rewards', '/app/rewards', Gift],
  ['Profiles', '/app/profiles', Users],
  ['Devices', '/app/devices', Monitor],
  ['Import', '/app/import', Sparkles],
  ['Settings', '/app/settings', Settings]
] as const;

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await requireHousehold();
  return (
    <div className="min-h-screen appliance-bg">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-amber-900/10 bg-white/55 p-5 backdrop-blur-xl lg:block">
        <Link href="/app" className="block rounded-3xl bg-ink p-5 text-cream shadow-card">
          <div className="font-display text-3xl">HomeBoard</div>
          <div className="mt-1 text-sm text-cream/70">Local family command center</div>
        </Link>
        <nav className="mt-6 grid gap-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink/75 hover:bg-white/80 hover:text-ink">
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-white/70 p-4 text-sm text-ink/65">
          Signed in as <b>{session.name}</b>. Everything is scoped to your household.
        </div>
      </aside>
      <main className="p-4 lg:ml-72 lg:p-8">{children}</main>
    </div>
  );
}
