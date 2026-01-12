export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}
export interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  serverName: string;
  gameMode: string;
  createdAt: string;
  lastPlayed?: string;
}

export type CharacterClass = "Wojownik" | "Mag" | "Łucznik" | "Łotr";

export interface CharacterResponse {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  serverName: string;
  gameMode: string;
}
