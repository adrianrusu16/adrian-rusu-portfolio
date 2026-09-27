import type { CollectionEntry } from 'astro:content';
import { identity } from '../data/identity';

export type SchemaEntity = Record<string, unknown>;
export type PageType = 'WebPage' | 'ProfilePage' | 'CollectionPage';

export function pageSchema({
  site,
  canonical,
  title,
  description,
  pageType,
  mainEntity,
}: {
  site: URL;
  canonical: string;
  title: string;
  description: string;
  pageType: PageType;
  mainEntity?: string;
}): SchemaEntity[] {
  const personId = new URL('/#person', site).href;
  const websiteId = new URL('/#website', site).href;
  return [
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Adrian Rusu',
      jobTitle: 'Senior Android / AAOS Engineer',
      url: site.href,
      image: new URL('/images/adrian-portrait-800.webp', site).href,
      email: `mailto:${identity.email}`,
      sameAs: [identity.linkedIn, identity.github],
      knowsAbout: ['Android Automotive', 'Android Media', 'Performance Engineering', 'Rust', 'C++'],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: site.href,
      name: 'Adrian Rusu',
      description: 'Android Automotive, media and systems engineering portfolio.',
      inLanguage: 'en',
      publisher: { '@id': personId },
    },
    {
      '@type': pageType,
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      ...(mainEntity ? { mainEntity: { '@id': mainEntity } } : {}),
    },
  ];
}

export function projectSchema(project: CollectionEntry<'projects'>, site: URL): SchemaEntity[] {
  const { data, id } = project;
  const url = new URL(`/projects/${id}/`, site).href;
  const author = { '@id': new URL('/#person', site).href };
  return [
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      url,
      headline: data.seoTitle,
      description: data.seoDescription,
      image: new URL(data.socialImage, site).href,
      author,
      inLanguage: 'en',
      mainEntityOfPage: { '@id': `${url}#webpage` },
      about: { '@id': `${url}#source` },
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${url}#source`,
      name: data.title,
      description: data.intro,
      url,
      author,
      keywords: data.tags,
      ...(data.repositoryVisibility === 'public' && data.repository
        ? { codeRepository: data.repository }
        : {}),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Projects',
          item: new URL('/projects/', site).href,
        },
        { '@type': 'ListItem', position: 2, name: data.title, item: url },
      ],
    },
  ];
}

// Escape HTML delimiters so content cannot terminate a JSON-LD script element.
export function serializeSchema(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
