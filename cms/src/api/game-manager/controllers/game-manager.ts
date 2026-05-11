import { createHmac, timingSafeEqual } from 'crypto';
import type { Core } from '@strapi/strapi';

function verifyHS256Jwt(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const signingInput = `${parts[0]}.${parts[1]}`;

    // Normalize base64url → base64
    const normalize = (s: string) =>
      s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + ((4 - (s.length % 4)) % 4), '=');

    const provided = Buffer.from(normalize(parts[2]), 'base64');
    const expected = createHmac('sha256', secret).update(signingInput).digest();

    if (provided.length !== expected.length) return false;
    if (!timingSafeEqual(provided, expected)) return false;

    const payload = JSON.parse(Buffer.from(normalize(parts[1]), 'base64').toString('utf8'));
    if (typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) return false;

    return true;
  } catch {
    return false;
  }
}

function isAdmin(ctx: any, strapi: Core.Strapi): boolean {
  const header = ctx.request.headers.authorization as string | undefined;
  if (!header?.startsWith('Bearer ')) return false;
  const token = header.slice(7);
  const secret = strapi.config.get('admin.auth.secret') as string | undefined;
  if (!secret) return false;
  return verifyHS256Jwt(token, secret);
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async listUsers(ctx: any) {
    if (!isAdmin(ctx, strapi)) return ctx.unauthorized();
    try {
      const users = await (strapi.service('api::game-manager.game-manager') as any).getUsers();
      ctx.send(users);
    } catch (err: any) {
      strapi.log.error(err);
      ctx.internalServerError('Błąd bazy danych');
    }
  },

  async listCharacters(ctx: any) {
    if (!isAdmin(ctx, strapi)) return ctx.unauthorized();
    const { userId } = ctx.params as { userId: string };
    try {
      const chars = await (strapi.service('api::game-manager.game-manager') as any).getCharactersByUserId(userId);
      ctx.send(chars);
    } catch (err: any) {
      strapi.log.error(err);
      ctx.internalServerError('Błąd bazy danych');
    }
  },

  async deleteCharacter(ctx: any) {
    if (!isAdmin(ctx, strapi)) return ctx.unauthorized();
    const { charId } = ctx.params as { charId: string };
    try {
      await (strapi.service('api::game-manager.game-manager') as any).deleteCharacterById(charId);
      ctx.send({ success: true });
    } catch (err: any) {
      strapi.log.error(err);
      ctx.internalServerError('Błąd bazy danych');
    }
  },
});
