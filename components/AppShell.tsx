import Link from 'next/link';
import { CalendarDays, CheckSquare, ClipboardList, ChefHat, Gift, Link2, Monitor, Settings, Sparkles, Users } from 'lucide-react';
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
  ['Integrations', '/app/settings/integrations', Link2],
  ['Settings', '/app/settings', Settings]
] as const;

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await requireHousehold();
  return (
    <div className="app-shell appliance-bg">
      <aside className="app-sidebar">
        <Link href="/app" className="app-sidebar-brand">
          <div>HomeBoard</div>
          <span>Local family command center</span>
        </Link>
        <nav className="app-sidebar-nav">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="app-sidebar-user">
          Signed in as <b>{session.name}</b>. Everything is scoped to your household.
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
