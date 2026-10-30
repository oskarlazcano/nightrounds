/**
 * Rewrites root-relative URLs in dist/ to live under a sub-path, for preview
 * hosts that serve the site from a folder (e.g. GitHub Pages project sites at
 * /nightrounds/). Production on Cloudflare serves from the root and skips this.
 *
 * Usage: node scripts/rebase.mjs /nightrounds
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2]?.replace(/\/$/, '');
if (!base?.startsWith('/')) throw new Error('Pass a base path like /nightrounds');

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const top = readdirSync(dist).map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
// Only paths that start with a real top-level entry in dist/, so external
// and protocol-relative URLs are left alone.
const paths = new RegExp(`(["'(])/(${top.join('|')})(?=[/"'?#)]|$)`, 'g');
const home = /(href=["'])\/(["'#])/g;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (['.html', '.css', '.js', '.xml'].includes(extname(file))) {
      const src = readFileSync(file, 'utf8');
      const out = src.replace(paths, `$1${base}/$2`).replace(home, `$1${base}/$2`);
      if (out !== src) writeFileSync(file, out);
    }
  }
}

walk(dist);
console.log(`Rebased dist/ to ${base}/`);
