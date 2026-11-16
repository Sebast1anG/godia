// Server-side client for the game server (the "deployment" stack): characters live in storage_service.
//
// GAME_API_URL        storage_service address, e.g. http://localhost:5015; unset = the website keeps characters in its own database
// GAME_AUTH_URL       auth_service address, e.g. http://localhost:5005
// GAME_API_LOGIN      administrator account storage_service accepts; leave both unset when
// GAME_API_PASSWORD   storage_service runs with token checking switched off (development=true)

type ApiResponse<T> = { status: 'ok'; data: T } | { status: 'error'; message?: string };

/** A character as storage_service returns it. */
export interface GameApiCharacter {
  id: number;
  userId: string;
  name: string;
  class: string;
  race: string;
  gender: string;
  gameMode: string;
}

export interface NewGameApiCharacter {
  name: string;
  class: string;
  race: string;
  gender: string;
  gameMode: string;
}

export class GameApiError extends Error {}

export const gameApiEnabled = (): boolean => Boolean(process.env.GAME_API_URL);

// The website calls the mage "mag"; the game server calls it "mage".
const CLASS_TO_API: Record<string, string> = { mag: 'mage' };
const CLASS_FROM_API: Record<string, string> = { mage: 'mag' };
export const toApiClass = (characterClass: string): string => CLASS_TO_API[characterClass] ?? characterClass;
export const fromApiClass = (characterClass: string): string => CLASS_FROM_API[characterClass] ?? characterClass;

const baseUrl = (value: string | undefined, name: string): string => {
  if (!value) throw new GameApiError(`${name} is not set`);
  return value.replace(/\/$/, '');
};

async function readBody<T>(response: Response, what: string): Promise<T> {
  if (!response.ok) throw new GameApiError(`${what}: HTTP ${response.status}`);
  // A failed call still answers HTTP 200, with the error in the body.
  const body = (await response.json()) as ApiResponse<T>;
  if (body.status !== 'ok') throw new GameApiError(`${what}: ${body.message ?? 'unknown error'}`);
  return body.data;
}

let cachedToken: string | null = null;

async function logIn(): Promise<string | null> {
  const login = process.env.GAME_API_LOGIN;
  const password = process.env.GAME_API_PASSWORD;
  if (!login || !password) return null;

  const response = await fetch(`${baseUrl(process.env.GAME_AUTH_URL, 'GAME_AUTH_URL')}/api/v1/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  const data = await readBody<{ access_token: string }>(response, 'Game server login');
  return data.access_token;
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${baseUrl(process.env.GAME_API_URL, 'GAME_API_URL')}${path}`;
  const send = async () => {
    cachedToken ??= await logIn();
    return fetch(url, {
      ...init,
      headers: { ...init.headers, ...(cachedToken ? { Authorization: `Bearer ${cachedToken}` } : {}) },
    });
  };

  const response = await send();
  if (response.status !== 401 || !cachedToken) return response;

  // The game server forgets tokens when it restarts; log in again once.
  cachedToken = null;
  return send();
}

const charactersPath = (userId: string) => `/api/v1/player_character/${encodeURIComponent(userId)}`;

export async function listGameCharacters(userId: string): Promise<GameApiCharacter[]> {
  const response = await request(charactersPath(userId));
  return readBody<GameApiCharacter[]>(response, 'Game server character list');
}

export async function createGameCharacter(userId: string, character: NewGameApiCharacter): Promise<GameApiCharacter> {
  const response = await request(charactersPath(userId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...character }),
  });
  return readBody<GameApiCharacter>(response, 'Game server character creation');
}
