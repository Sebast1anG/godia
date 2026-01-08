import fs from "fs";
import path from "path";
import { User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "users.json");

class Database {
  private ensureDbExists(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([]), "utf8");
    }
  }

  private readUsers(): User[] {
    this.ensureDbExists();
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  }

  private writeUsers(users: User[]): void {
    this.ensureDbExists();
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf8");
  }

  findUserByEmail(email: string): User | undefined {
    const users = this.readUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    const users = this.readUsers();
    return users.find((u) => u.id === id);
  }

  createUser(user: User): User {
    const users = this.readUsers();
    users.push(user);
    this.writeUsers(users);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.readUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    users[index] = { ...users[index], ...updates };
    this.writeUsers(users);
    return users[index];
  }
}

export const db = new Database();
