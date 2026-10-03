import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPublishedNotes } from '../lib/notes';
export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects');
  const notes = await getPublishedNotes();
  const routes = [
    '/',
    '/projects/',
    '/experience/',
    '/about/',
    '/resume/',
    '/privacy/',
    '/notes/',
    ...projects.map((p) => `/projects/${p.id}/`),
    ...notes.map((note) => `/notes/${note.id}/`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((p) => `<url><loc>${new URL(p, site).href}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
