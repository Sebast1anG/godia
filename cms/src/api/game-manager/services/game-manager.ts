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

  async ensureSchema() {
    const sql = getSql();
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
      END $$;
    `;
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='banned') THEN
          ALTER TABLE users ADD COLUMN banned BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `;
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='gm_balance') THEN
          ALTER TABLE users ADD COLUMN gm_balance INTEGER DEFAULT 0;
        END IF;
      END $$;
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS login_history (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        success BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
  },

  async searchAccounts(login?: string, email?: string) {
    const sql = getSql();
    await this.ensureSchema();
    if (login && email) {
      const lp = `%${login}%`;
      const ep = `%${email}%`;
      return sql`
        SELECT id, email, username, COALESCE(role,'user') AS role, COALESCE(banned,false) AS banned, COALESCE(gm_balance,0) AS gm_balance, created_at
        FROM users WHERE username ILIKE ${lp} AND email ILIKE ${ep}
        ORDER BY created_at DESC LIMIT 20
      `;
    } else if (email) {
      const ep = `%${email}%`;
      return sql`
        SELECT id, email, username, COALESCE(role,'user') AS role, COALESCE(banned,false) AS banned, COALESCE(gm_balance,0) AS gm_balance, created_at
        FROM users WHERE email ILIKE ${ep}
        ORDER BY created_at DESC LIMIT 20
      `;
    } else {
      const lp = `%${login}%`;
      return sql`
        SELECT id, email, username, COALESCE(role,'user') AS role, COALESCE(banned,false) AS banned, COALESCE(gm_balance,0) AS gm_balance, created_at
        FROM users WHERE username ILIKE ${lp}
        ORDER BY created_at DESC LIMIT 20
      `;
    }
  },

  async updateUsername(userId: string, username: string) {
    const sql = getSql();
    const existing = (await sql`SELECT id FROM users WHERE username = ${username} AND id != ${userId}`) as any[];
    if (existing.length > 0) throw new Error('USERNAME_TAKEN');
    await sql`UPDATE users SET username = ${username} WHERE id = ${userId}`;
  },

  async setBanned(userId: string, banned: boolean) {
    const sql = getSql();
    await this.ensureSchema();
    await sql`UPDATE users SET banned = ${banned} WHERE id = ${userId}`;
  },

  async addGmCurrency(userId: string, amount: number) {
    const sql = getSql();
    await this.ensureSchema();
    const rows = (await sql`
      UPDATE users
      SET gm_balance = GREATEST(0, COALESCE(gm_balance, 0) + ${amount})
      WHERE id = ${userId}
      RETURNING COALESCE(gm_balance, 0) AS gm_balance
    `) as any[];
    if (rows.length === 0) throw new Error('USER_NOT_FOUND');
    return rows[0].gm_balance as number;
  },

  async getLoginHistory(userId: string) {
    const sql = getSql();
    await this.ensureSchema();
    return sql`
      SELECT id, ip_address, user_agent, success, created_at
      FROM login_history WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 100
    `;
  },
});
