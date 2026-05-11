import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

const POSTGRES_URL = 'postgresql://neondb_owner:npg_snuRU01kcKXM@ep-polished-math-ahci2i3j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(POSTGRES_URL);

const users = await sql`SELECT id, username, email FROM users ORDER BY username`;
console.log('Użytkownicy w bazie:');
users.forEach(u => console.log(`  id=${u.id}  username=${u.username}  email=${u.email}`));

const admin = users.find(u => u.username.toLowerCase() === 'admin');
if (!admin) {
  console.log('\nBrak konta Admin w bazie — sprawdź powyższą listę i podaj właściwe ID lub username.');
  process.exit(1);
}

console.log(`\nAdmin znaleziony: id=${admin.id}`);

const chars = await sql`SELECT * FROM characters WHERE user_id = ${admin.id} ORDER BY created_at`;
console.log(`Aktualne postacie (${chars.length}):`);
chars.forEach(c => console.log(`  - ${c.name} | ${c.class} | ${c.gender} ${c.race} | lvl ${c.level}`));

if (chars.length === 0) {
  console.log('\nBrak postaci — tworzę 3 przykładowe...');
  const seed = [
    { name: 'AdminWarrior', class: 'warrior', gender: 'male',   race: 'human', game_mode: 'pve', server_id: 0, level: 10 },
    { name: 'AdminArcher',  class: 'archer',  gender: 'female', race: 'elf',   game_mode: 'pve', server_id: 0, level: 7  },
    { name: 'AdminMage',    class: 'mage',    gender: 'female', race: 'human', game_mode: 'pvp', server_id: 0, level: 5  },
  ];
  for (const c of seed) {
    const id = uuidv4();
    await sql`
      INSERT INTO characters (id, user_id, name, server_id, game_mode, gender, race, class, level)
      VALUES (${id}, ${admin.id}, ${c.name}, ${c.server_id}, ${c.game_mode}, ${c.gender}, ${c.race}, ${c.class}, ${c.level})
    `;
    console.log(`  + ${c.name}`);
  }
  chars.splice(0, chars.length, ...(await sql`SELECT * FROM characters WHERE user_id = ${admin.id} ORDER BY created_at`));
}

const copies = [];
for (let i = 0; i < 2; i++) {
  for (const c of chars) {
    copies.push({
      id: uuidv4(),
      user_id: admin.id,
      name: `${c.name}${i === 0 ? 'II' : 'III'}`,
      server_id: c.server_id,
      game_mode: c.game_mode,
      gender: c.gender,
      race: c.race,
      class: c.class,
      level: c.level,
    });
  }
}

console.log(`\nDodaję ${copies.length} kopii...`);
for (const c of copies) {
  await sql`
    INSERT INTO characters (id, user_id, name, server_id, game_mode, gender, race, class, level)
    VALUES (${c.id}, ${c.user_id}, ${c.name}, ${c.server_id}, ${c.game_mode}, ${c.gender}, ${c.race}, ${c.class}, ${c.level})
  `;
  console.log(`  + ${c.name}`);
}

const after = await sql`SELECT count(*)::int AS n FROM characters WHERE user_id = ${admin.id}`;
console.log(`\nGotowe! Admin ma teraz ${after[0].n} postaci.`);
