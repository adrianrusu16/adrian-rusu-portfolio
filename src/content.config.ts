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
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z
    .object({
      title: z.string().min(1),
      summary: z.string().min(1),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).min(1),
      seoTitle: z.string().min(1),
      seoDescription: z.string().min(1),
      socialImage: z.string().startsWith('/images/'),
      relatedProjects: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    })
    .refine((note) => !note.updated || note.updated >= note.published, {
      message: 'An update cannot precede publication.',
      path: ['updated'],
    }),
});
export const collections = { projects, notes };
