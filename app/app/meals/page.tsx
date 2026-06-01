import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const categoryOptions = [
  { label: 'Breakfast', value: 'Breakfast' },
  { label: 'Lunch', value: 'Lunch' },
  { label: 'Dinner', value: 'Dinner' },
  { label: 'Snack', value: 'Snack' }
];

export default async function MealsPage() {
  const session = await requireHousehold();
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, index) => addDays(today, index));
  const meals = await sql<any[]>`select * from meals where household_id=${session.householdId} and meal_date >= ${format(days[0], 'yyyy-MM-dd')} and meal_date <= ${format(days[6], 'yyyy-MM-dd')} order by meal_date, category`;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Meal planner</p>
          <h1>This week&apos;s meals</h1>
          <p>Plan breakfast, lunch, dinner, and snacks locally. Recipe and grocery handoff can build on these saved meals.</p>
        </div>
        <a className="admin-primary-action" href="/display/meals">Open display view</a>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/meals"
          submitLabel="Plan meal"
          fields={[
            { name: 'title', label: 'Meal', required: true },
            { name: 'mealDate', label: 'Date', type: 'date', required: true },
            { name: 'category', label: 'Category', defaultValue: 'Dinner', options: categoryOptions },
            { name: 'notes', label: 'Notes', multiline: true }
          ]}
        />

        <section className="admin-meal-week">
          {days.map((day) => {
            const dayMeals = meals.filter((meal) => isSameDay(new Date(`${meal.meal_date}T00:00:00`), day));
            return (
              <article className="admin-meal-day" key={day.toISOString()}>
                <header><span>{format(day, 'EEE')}</span><b>{format(day, 'MMM d')}</b></header>
                {categoryOptions.map((category) => {
                  const slotMeals = dayMeals.filter((meal) => meal.category === category.value);
                  return (
                    <div className="admin-meal-slot" key={category.value}>
                      <small>{category.label}</small>
                      {slotMeals.length ? slotMeals.map((meal) => (
                        <div className="admin-meal-planned" key={meal.id}>
                          <strong>{meal.title}</strong>
                          <ActionButton endpoint={`/api/meals/${meal.id}/delete`}>Remove</ActionButton>
                        </div>
                      )) : <span>Not planned</span>}
                    </div>
                  );
                })}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
