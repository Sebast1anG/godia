import jwt from 'jsonwebtoken';
import { TokenPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'godia-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
