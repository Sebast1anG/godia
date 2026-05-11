const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';

interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

async function strapiGet<T>(path: string): Promise<StrapiListResponse<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Strapi ${res.status}: ${path}`);
  return res.json();
}

export interface CmsArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  category: 'news' | 'update' | 'event' | 'maintenance';
  excerpt: string | null;
  publishedAt: string;
}

export interface CmsServer {
  id: number;
  documentId: string;
  name: string;
  serverId: number;
  isActive: boolean;
  description: string | null;
}

export interface CmsCharacterClass {
  id: number;
  documentId: string;
  key: string;
  displayName: string;
  description: string | null;
  role: string | null;
  isActive: boolean;
}

export async function getArticles(): Promise<CmsArticle[]> {
  try {
    const res = await strapiGet<CmsArticle>(
      '/articles?sort=publishedAt:desc&pagination[pageSize]=20'
    );
    return res.data;
  } catch {
    return [];
  }
}

export async function getServers(): Promise<CmsServer[]> {
  try {
    const res = await strapiGet<CmsServer>(
      '/servers?filters[isActive][$eq]=true&sort=serverId:asc'
    );
    return res.data;
  } catch {
    return [];
  }
}

export async function getCharacterClasses(): Promise<CmsCharacterClass[]> {
  try {
    const res = await strapiGet<CmsCharacterClass>(
      '/character-classes?filters[isActive][$eq]=true'
    );
    return res.data;
  } catch {
    return [];
  }
}
