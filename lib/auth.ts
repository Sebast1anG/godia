import jwt from 'jsonwebtoken';
import { TokenPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'godia-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'godia-refresh-secret-key-change-in-production';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';
// The game runs on another origin and cannot reach the refresh cookie, so this token has to last a whole session.
const GAME_TOKEN_EXPIRES_IN = '12h';

export interface GameTokenPayload {
  userId: string;
  characterId: string;
}

// Separate secret: game services verify this token, and must not be able to mint site sessions.
export const generateGameToken = (payload: GameTokenPayload): string => {
  const secret = process.env.GAME_JWT_SECRET
    || (process.env.NODE_ENV === 'production' ? null : 'godia-game-secret-dev-only');
  if (!secret) throw new Error('GAME_JWT_SECRET is not set');
  return jwt.sign(payload, secret, { expiresIn: GAME_TOKEN_EXPIRES_IN });
};

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};
