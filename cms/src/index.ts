import type { Core } from '@strapi/strapi';

const PUBLIC_CONTENT_TYPES = [
  'api::article.article',
  'api::server.server',
  'api::character-class.character-class',
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const uid of PUBLIC_CONTENT_TYPES) {
      for (const action of ['find', 'findOne']) {
        const actionKey = `${uid}.${action}`;
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action: actionKey, role: publicRole.id } });

        if (!existing) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: { action: actionKey, role: publicRole.id, enabled: true },
          });
        } else if (!existing.enabled) {
          await strapi
            .query('plugin::users-permissions.permission')
            .update({ where: { id: existing.id }, data: { enabled: true } });
        }
      }
    }
  },
};
