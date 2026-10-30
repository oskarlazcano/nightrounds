import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name} Resources`,
    description: 'Practical IT, security, and HIPAA notes for long-term care and healthcare administrators.',
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
      categories: p.data.tags,
    })),
  });
}
