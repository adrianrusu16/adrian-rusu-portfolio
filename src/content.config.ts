import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    label: z.string(),
    subtitle: z.string(),
    tags: z.array(z.string()),
    order: z.number(),
    kind: z.enum(['flagship', 'backend', 'contract', 'lab']),
    featured: z.boolean().default(false),
    repository: z.string().url().optional(),
    repositoryVisibility: z.enum(['public', 'private']),
    image: z.string(),
    imageAlt: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string().min(1),
    socialImage: z.string(),
    intro: z.string(),
    related: z.array(z.string()),
  }),
});
export const collections = { projects };
