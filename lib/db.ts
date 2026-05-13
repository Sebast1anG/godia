import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

const sql = neon(process.env.POSTGRES_URL!);

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  banned: boolean;
  selected_character_id: string | null;
  created_at: Date;
}

export interface LoginHistoryEntry {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string | null;
  success: boolean;
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
  last_online: Date | null;
  created_at: Date;
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      selected_character_id VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='selected_character_id') THEN
        ALTER TABLE users ADD COLUMN selected_character_id VARCHAR(255) DEFAULT NULL;
      END IF;
    END $$;
  `;

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
        ALTER TABLE users ADD COLUMN banned BOOLEAN NOT NULL DEFAULT FALSE;
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
      last_online TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='characters' AND column_name='last_online') THEN
        ALTER TABLE characters ADD COLUMN last_online TIMESTAMP DEFAULT NULL;
      END IF;
    END $$;
  `;
}

export const db = {
  findUserByEmail: async (email: string): Promise<User | null> => {
    const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
    return rows[0] as User || null;
  },

  findUserByUsername: async (username: string): Promise<User | null> => {
    const rows = await sql`SELECT * FROM users WHERE username = ${username}`;
    return rows[0] as User || null;
  },

  findUserById: async (id: string): Promise<User | null> => {
    const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
    return rows[0] as User || null;
  },

  createUser: async (user: Omit<User, 'id' | 'created_at' | 'selected_character_id'>): Promise<User> => {
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

  createCharacter: async (character: Omit<Character, 'id' | 'created_at' | 'level' | 'last_online'>): Promise<Character> => {
    const id = uuidv4();
    const rows = await sql`
      INSERT INTO characters (id, user_id, name, server_id, game_mode, gender, race, class)
      VALUES (${id}, ${character.user_id}, ${character.name}, ${character.server_id}, ${character.game_mode}, ${character.gender}, ${character.race}, ${character.class})
      RETURNING *
    `;
    return rows[0] as Character;
  },

  updateCharacter: async (id: string, updates: Partial<Pick<Character, 'name' | 'gender' | 'race'>>): Promise<Character | null> => {
    const setClauses: string[] = [];
    const values: string[] = [];
    
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
    await sql`DELETE FROM characters WHERE id = ${id}`;
    return true;
  },

  updateSelectedCharacter: async (userId: string, characterId: string | null): Promise<boolean> => {
    await sql`UPDATE users SET selected_character_id = ${characterId} WHERE id = ${userId}`;
    return true;
  },

  getSelectedCharacterId: async (userId: string): Promise<string | null> => {
    const rows = await sql`SELECT selected_character_id FROM users WHERE id = ${userId}`;
    return rows[0]?.selected_character_id || null;
  },

  findCharacterByNameAndServer: async (name: string, serverId: number): Promise<Character | null> => {
    const rows = await sql`SELECT * FROM characters WHERE LOWER(name) = LOWER(${name}) AND server_id = ${serverId}`;
    return rows[0] as Character || null;
  },

  updateUserPassword: async (userId: string, hashedPassword: string): Promise<boolean> => {
    const rows = await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId} RETURNING id`;
    return rows.length > 0;
  },

  searchAccounts: async (login?: string, email?: string): Promise<Omit<User, 'password'>[]> => {
    if (login && email) {
      const loginPat = `%${login}%`;
      const emailPat = `%${email}%`;
      const rows = await sql`
        SELECT id, email, username, role, selected_character_id, created_at
        FROM users
        WHERE username ILIKE ${loginPat} AND email ILIKE ${emailPat}
        ORDER BY created_at DESC LIMIT 20
      `;
      return rows as Omit<User, 'password'>[];
    } else if (email) {
      const pat = `%${email}%`;
      const rows = await sql`
        SELECT id, email, username, role, selected_character_id, created_at
        FROM users
        WHERE email ILIKE ${pat}
        ORDER BY created_at DESC LIMIT 20
      `;
      return rows as Omit<User, 'password'>[];
    } else if (login) {
      const pat = `%${login}%`;
      const rows = await sql`
        SELECT id, email, username, role, selected_character_id, created_at
        FROM users
        WHERE username ILIKE ${pat}
        ORDER BY created_at DESC LIMIT 20
      `;
      return rows as Omit<User, 'password'>[];
    }
    return [];
  },

  updateUsername: async (userId: string, username: string): Promise<boolean> => {
    const rows = await sql`UPDATE users SET username = ${username} WHERE id = ${userId} RETURNING id`;
    return rows.length > 0;
  },

  getLoginHistory: async (userId: string): Promise<LoginHistoryEntry[]> => {
    const rows = await sql`
      SELECT id, user_id, ip_address, user_agent, success, created_at
      FROM login_history
      WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 100
    `;
    return rows as LoginHistoryEntry[];
  },

  recordLoginAttempt: async (
    userId: string,
    ipAddress: string,
    userAgent: string | null,
    success: boolean
  ): Promise<void> => {
    const id = uuidv4();
    await sql`
      INSERT INTO login_history (id, user_id, ip_address, user_agent, success)
      VALUES (${id}, ${userId}, ${ipAddress}, ${userAgent}, ${success})
    `;
  },
};