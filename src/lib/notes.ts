import { getCollection } from 'astro:content';

export async function getPublishedNotes() {
  return (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime() || a.id.localeCompare(b.id),
  );
}

export function noteDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
