import bcrypt from 'bcryptjs';
import { sql } from '../lib/db';

async function main() {
  const password_hash = await bcrypt.hash('homeboard123', 10);
  const users = await sql<any[]>`insert into users_local (email, name, password_hash) values ('local@example.com', 'Local Owner', ${password_hash}) on conflict (email) do update set name=excluded.name returning id`;
  const households = await sql<any[]>`insert into households (name, timezone) values ('Santangelo Family', 'America/New_York') returning id`;
  const householdId = households[0].id;
  await sql`insert into household_members (household_id, user_id, role) values (${householdId}, ${users[0].id}, 'owner') on conflict do nothing`;
  const profiles = await sql<any[]>`insert into profiles (household_id, name, initials, emoji, color, type) values (${householdId}, 'Chris', 'C', 'C', '#3f7f8f', 'adult'), (${householdId}, 'Presley', 'P', '*', '#d97745', 'child'), (${householdId}, 'Family', 'F', 'H', '#8fa58a', 'generic') returning id`;
  await sql`insert into events (household_id, title, starts_at, ends_at, location, profile_ids) values (${householdId}, 'Soccer practice', now() + interval '3 hours', now() + interval '4 hours', 'Community fields', ${[profiles[1].id]}), (${householdId}, 'Family movie night', now() + interval '1 day 19 hours', now() + interval '1 day 21 hours', 'Living room', ${[profiles[2].id]})`;
  await sql`insert into task_series (household_id, title, emoji, due_date, time_of_day, star_value, assigned_profile_ids) values (${householdId}, 'Make bed', 'bed', current_date, 'morning', 2, ${[profiles[1].id]}), (${householdId}, 'Feed pets', 'pet', current_date, 'evening', 3, ${[profiles[1].id]})`;
  const lists = await sql<any[]>`insert into lists (household_id, title, list_type, color) values (${householdId}, 'Grocery', 'grocery', '#d97745'), (${householdId}, 'To-Dos', 'todo', '#3f7f8f') returning id`;
  await sql`insert into list_items (household_id, list_id, name) values (${householdId}, ${lists[0].id}, 'Milk'), (${householdId}, ${lists[0].id}, 'Blueberries'), (${householdId}, ${lists[1].id}, 'Return library books')`;
  await sql`insert into meals (household_id, meal_date, category, title, notes) values (${householdId}, current_date, 'Dinner', 'Taco bowls', 'Prep toppings early'), (${householdId}, current_date + 1, 'Dinner', 'Sheet pan chicken', null)`;
  console.log('Seeded local@example.com / homeboard123');
}
main().finally(() => sql.end());
