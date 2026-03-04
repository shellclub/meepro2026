const db = require('./src/lib/db.ts');
async function run() {
  const categories = await db.query('SELECT * FROM categories limit 1');
  console.log(categories);
}
run();
