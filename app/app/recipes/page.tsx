import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const categoryOptions = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
  { label: 'Other', value: 'other' }
];

export default async function RecipesPage() {
  const session = await requireHousehold();
  const recipes = await sql<any[]>`select * from recipes where household_id = ${session.householdId} order by created_at desc`;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Recipe box</p>
          <h1>Recipes</h1>
          <p>Save local recipes now, then connect them to meal planning and grocery lists as the platform grows.</p>
        </div>
        <a className="admin-primary-action" href="/display/recipes">Open display view</a>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/recipes"
          submitLabel="Save recipe"
          fields={[
            { name: 'title', label: 'Recipe title', required: true },
            { name: 'category', label: 'Category', defaultValue: 'dinner', options: categoryOptions },
            { name: 'ingredients', label: 'Ingredients', multiline: true, placeholder: 'One ingredient per line' },
            { name: 'instructions', label: 'Instructions', multiline: true, placeholder: 'One step per line' },
            { name: 'notes', label: 'Notes', multiline: true },
            { name: 'sourceUrl', label: 'Source URL', type: 'url' }
          ]}
        />

        <section className="admin-list-grid">
          {recipes.length ? recipes.map((recipe) => (
            <article className="admin-list-card" key={recipe.id}>
              <h2>{recipe.title}</h2>
              <p>{recipe.category}</p>
              <div className="admin-recipe-detail">
                <b>Ingredients</b>
                <span>{Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0} saved</span>
              </div>
              <div className="admin-recipe-detail">
                <b>Steps</b>
                <span>{recipe.instructions?.length ?? 0} saved</span>
              </div>
              {recipe.notes ? <p>{recipe.notes}</p> : null}
              <ActionButton endpoint={`/api/recipes/${recipe.id}/delete`}>Delete recipe</ActionButton>
            </article>
          )) : <p className="admin-empty">No recipes yet. Add your first family favorite on the left.</p>}
        </section>
      </div>
    </div>
  );
}
