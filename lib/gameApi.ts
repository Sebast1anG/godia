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

// Every game server numbers its characters from 1, while all of them (e.g. the local one and the shared one) write
// to the same `characters` table. So the row id carries the server: "57.128.214.47-5015_7", not just "7".
export const gameServerKey = (): string =>
  new URL(baseUrl(process.env.GAME_API_URL, 'GAME_API_URL')).host.replace(/[^a-zA-Z0-9.-]/g, '-');
export const characterRowId = (gameCharacterId: string | number): string => `${gameServerKey()}_${gameCharacterId}`;

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

/**
 * Removes a character on the game server; the server only removes one that belongs to the user.
 * False when this game server version has no delete endpoint yet (it answers HTTP 404 to the unknown route).
 * A character the server no longer has counts as removed.
 */
export async function deleteGameCharacter(userId: string, characterId: string): Promise<boolean> {
  const response = await request(`${charactersPath(userId)}/${encodeURIComponent(characterId)}`, { method: 'DELETE' });
  if (response.status === 404) return false;
  if (!response.ok) throw new GameApiError(`Game server character delete: HTTP ${response.status}`);

  const body = (await response.json()) as ApiResponse<null>;
  if (body.status !== 'ok' && body.message !== 'character do not exist') {
    throw new GameApiError(`Game server character delete: ${body.message ?? 'unknown error'}`);
  }
  return true;
}

/**
 * Puts the character in the game for this session (a random id of one game tab).
 * 'busy' when another character of the user is in the game. 'unsupported' when this game server
 * version has no presence endpoint yet (it answers HTTP 404 to the unknown route).
 */
export async function claimGamePresence(
  userId: string,
  characterId: number,
  sessionId: string,
): Promise<'ok' | 'busy' | 'unsupported'> {
  const response = await request(`/api/v1/player_presence/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, sessionId }),
  });
  if (response.status === 404) return 'unsupported';
  if (!response.ok) throw new GameApiError(`Game server presence: HTTP ${response.status}`);

  const body = (await response.json()) as ApiResponse<unknown>;
  if (body.status === 'ok') return 'ok';
  if (body.message === 'another character is already in the game') return 'busy';
  throw new GameApiError(`Game server presence: ${body.message ?? 'unknown error'}`);
}

export async function createGameCharacter(userId: string, character: NewGameApiCharacter): Promise<GameApiCharacter> {
  const response = await request(charactersPath(userId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...character }),
  });
  return readBody<GameApiCharacter>(response, 'Game server character creation');
}
