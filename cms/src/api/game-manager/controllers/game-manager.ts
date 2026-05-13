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

  async searchAccounts(ctx: any) {
    if (!isAdmin(ctx, strapi)) return ctx.unauthorized();
    const { login, email } = ctx.query as { login?: string; email?: string };
    if (!login?.trim() && !email?.trim()) return ctx.badRequest('Podaj login lub email');
    try {
      const svc = strapi.service('api::game-manager.game-manager') as any;
      const results = await svc.searchAccounts(login?.trim(), email?.trim());
      ctx.send(results);
    } catch (err: any) {
      strapi.log.error(err);
      ctx.internalServerError('Błąd wyszukiwania');
    }
  },

  async updateAccount(ctx: any) {
    if (!isAdmin(ctx, strapi)) return ctx.unauthorized();
    const { userId } = ctx.params as { userId: string };
    const body = ctx.request.body as { username?: string; banned?: boolean; gmAmount?: number };
    const svc = strapi.service('api::game-manager.game-manager') as any;
    try {
      if (typeof body.banned === 'boolean') {
        await svc.setBanned(userId, body.banned);
        return ctx.send({ success: true, banned: body.banned });
      }
      if (body.username !== undefined) {
        if (body.username.trim().length < 2) return ctx.badRequest('Nieprawidłowa nazwa gracza');
        await svc.updateUsername(userId, body.username.trim());
        return ctx.send({ success: true });
      }
      if (body.gmAmount !== undefined) {
        if (!Number.isInteger(body.gmAmount) || body.gmAmount === 0) return ctx.badRequest('Kwota musi być niezerową liczbą całkowitą');
        const newBalance = await svc.addGmCurrency(userId, body.gmAmount);
        return ctx.send({ success: true, gm_balance: newBalance });
      }
      return ctx.badRequest('Brak pól do aktualizacji');
    } catch (err: any) {
      if (err.message === 'USERNAME_TAKEN') return ctx.conflict('Ta nazwa jest już zajęta');
      strapi.log.error(err);
      ctx.internalServerError('Błąd aktualizacji');
    }
  },

  async getLoginHistory(ctx: any) {
    if (!isAdmin(ctx, strapi)) return ctx.unauthorized();
    const { userId } = ctx.params as { userId: string };
    try {
      const svc = strapi.service('api::game-manager.game-manager') as any;
      const history = await svc.getLoginHistory(userId);
      ctx.send(history);
    } catch (err: any) {
      strapi.log.error(err);
      ctx.internalServerError('Błąd historii logowań');
    }
  },

});
