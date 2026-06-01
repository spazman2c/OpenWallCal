import { pglite } from '../lib/pglite-db';

async function main() {
  const result = await pglite.query('select count(*)::int as households from households');
  console.log(result.rows[0]);
}

main().finally(() => pglite.close());
