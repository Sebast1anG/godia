import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

const sql = neon(process.env.DATABASE_URL!);

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export const db = {
  findUserByEmail: async (email: string): Promise<User | null> => {
    const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
    return rows[0] as User || null;
  },

  findUserById: async (id: string): Promise<User | null> => {
    const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
    return rows[0] as User || null;
  },

  createUser: async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    const id = uuidv4();
    const rows = await sql`
      INSERT INTO users (id, email, username, password)
      VALUES (${id}, ${user.email}, ${user.username}, ${user.password})
      RETURNING *
    `;
    return rows[0] as User;
  }
};