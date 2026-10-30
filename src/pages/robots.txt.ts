import type { APIContext } from 'astro';

export function GET({ site }: APIContext) {
  // Preview builds must never be indexed (packet section 10 launch checklist).
  const body = import.meta.env.PUBLIC_PREVIEW
    ? ['User-agent: *', 'Disallow: /'].join('\n')
    : ['User-agent: *', 'Allow: /', 'Disallow: /brand', '', `Sitemap: ${new URL('sitemap-index.xml', site)}`].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
