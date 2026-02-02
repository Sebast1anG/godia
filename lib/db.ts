import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

const sql = neon(process.env.POSTGRES_URL!);

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  server_id: number;
  game_mode: 'pve' | 'pvp';
  gender: 'male' | 'female';
  race: 'human' | 'elf';
  class: string;
  level: number;
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

  await sql`
    CREATE TABLE IF NOT EXISTS characters (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      server_id INTEGER NOT NULL DEFAULT 0,
      game_mode VARCHAR(10) NOT NULL DEFAULT 'pve',
      gender VARCHAR(10) NOT NULL DEFAULT 'male',
      race VARCHAR(20) NOT NULL DEFAULT 'human',
      class VARCHAR(50) NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
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
  },

  findCharactersByUserId: async (userId: string): Promise<Character[]> => {
    const rows = await sql`SELECT * FROM characters WHERE user_id = ${userId} ORDER BY created_at DESC`;
    return rows as Character[];
  },

  findCharacterById: async (id: string): Promise<Character | null> => {
    const rows = await sql`SELECT * FROM characters WHERE id = ${id}`;
    return rows[0] as Character || null;
  },

  createCharacter: async (character: Omit<Character, 'id' | 'created_at' | 'level'>): Promise<Character> => {
    const id = uuidv4();
    const rows = await sql`
      INSERT INTO characters (id, user_id, name, server_id, game_mode, gender, race, class)
      VALUES (${id}, ${character.user_id}, ${character.name}, ${character.server_id}, ${character.game_mode}, ${character.gender}, ${character.race}, ${character.class})
      RETURNING *
    `;
    return rows[0] as Character;
  },

  updateCharacter: async (id: string, updates: Partial<Pick<Character, 'name' | 'gender' | 'race'>>): Promise<Character | null> => {
    const setClauses = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      setClauses.push(`name = $${values.length + 1}`);
      values.push(updates.name);
    }
    if (updates.gender !== undefined) {
      setClauses.push(`gender = $${values.length + 1}`);
      values.push(updates.gender);
    }
    if (updates.race !== undefined) {
      setClauses.push(`race = $${values.length + 1}`);
      values.push(updates.race);
    }

    if (setClauses.length === 0) return null;

    if (updates.name && !updates.gender && !updates.race) {
      const rows = await sql`UPDATE characters SET name = ${updates.name} WHERE id = ${id} RETURNING *`;
      return rows[0] as Character || null;
    }
    if (updates.gender && !updates.name && !updates.race) {
      const rows = await sql`UPDATE characters SET gender = ${updates.gender} WHERE id = ${id} RETURNING *`;
      return rows[0] as Character || null;
    }
    if (updates.race && !updates.name && !updates.gender) {
      const rows = await sql`UPDATE characters SET race = ${updates.race} WHERE id = ${id} RETURNING *`;
      return rows[0] as Character || null;
    }
    
    if (updates.name && updates.gender && !updates.race) {
      const rows = await sql`UPDATE characters SET name = ${updates.name}, gender = ${updates.gender} WHERE id = ${id} RETURNING *`;
      return rows[0] as Character || null;
    }
    if (updates.name && updates.race && !updates.gender) {
      const rows = await sql`UPDATE characters SET name = ${updates.name}, race = ${updates.race} WHERE id = ${id} RETURNING *`;
      return rows[0] as Character || null;
    }
    if (updates.gender && updates.race && !updates.name) {
      const rows = await sql`UPDATE characters SET gender = ${updates.gender}, race = ${updates.race} WHERE id = ${id} RETURNING *`;
      return rows[0] as Character || null;
    }
    if (updates.name && updates.gender && updates.race) {
      const rows = await sql`UPDATE characters SET name = ${updates.name}, gender = ${updates.gender}, race = ${updates.race} WHERE id = ${id} RETURNING *`;
      return rows[0] as Character || null;
    }

    return null;
  },

  deleteCharacter: async (id: string): Promise<boolean> => {
    const result = await sql`DELETE FROM characters WHERE id = ${id}`;
    return true;
  }
};