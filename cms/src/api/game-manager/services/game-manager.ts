import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.NEON_POSTGRES_URL;
    if (!url) throw new Error('NEON_POSTGRES_URL is not configured in cms/.env');
    _sql = neon(url);
  }
  return _sql;
}

export default () => ({
  async getUsers() {
    const sql = getSql();
    return sql`
      SELECT
        u.id,
        u.username,
        u.email,
        u.created_at,
        COUNT(c.id)::int AS character_count
      FROM users u
      LEFT JOIN characters c ON c.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
  },

  async getCharactersByUserId(userId: string) {
    const sql = getSql();
    return sql`
      SELECT id, name, class, level, server_id, game_mode, gender, race, last_online, created_at
      FROM characters
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  },

  async deleteCharacterById(charId: string) {
    const sql = getSql();
    await sql`DELETE FROM characters WHERE id = ${charId}`;
  },
});
