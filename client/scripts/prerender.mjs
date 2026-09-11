import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const indexPath = path.join(distDir, 'index.html');
const placeholder = '<div id="root"></div>';

const template = fs.readFileSync(indexPath, 'utf8');
if (!template.includes(placeholder)) {
  throw new Error(`Не найден ${placeholder} в dist/index.html`);
}

const { render, PRERENDER_PATHS, getPrerenderEntry } = await import(
  pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href
);
const manifest = JSON.parse(fs.readFileSync(path.join(distDir, '.vite', 'manifest.json'), 'utf8'));

for (const pathname of PRERENDER_PATHS) {
  const page = render(pathname);
  const html = applyHead(template.replace(placeholder, `<div id="root">${page.html}</div>`), page, pathname);
  const outPath = pathname === '/' ? indexPath : path.join(distDir, pathname.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`Prerendered ${pathname}`);
}

function applyHead(html, page, pathname) {
  const title = escapeAttr(page.title);
  const description = escapeAttr(page.description);
  let next = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  next = setMetaContent(next, 'name', 'description', description);
  next = setMetaContent(next, 'property', 'og:title', title);
  next = setMetaContent(next, 'property', 'og:description', description);
  next = setMetaContent(next, 'name', 'twitter:title', title);
  next = setMetaContent(next, 'name', 'twitter:description', description);

  const extra = [];
  if (page.canonical) {
    extra.push(`    <meta property="og:url" content="${page.canonical}" />`);
    extra.push(`    <link rel="canonical" href="${page.canonical}" />`);
  }
  for (const href of collectCssHrefs(manifest, getPrerenderEntry(pathname))) {
    if (!next.includes(`href="${href}"`)) {
      extra.push(`    <link rel="stylesheet" crossorigin href="${href}">`);
    }
  }
  return extra.length ? next.replace('</head>', `${extra.join('\n')}\n  </head>`) : next;
}

function collectCssHrefs(manifest, entry) {
  const seen = new Set();
  const hrefs = [];

  const visit = (key) => {
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    const chunk = manifest[key];
    if (!chunk) {
      throw new Error(`В manifest нет чанка ${key}`);
    }
    for (const cssFile of chunk.css ?? []) {
      hrefs.push(`/${cssFile}`);
    }
    for (const imported of chunk.imports ?? []) {
      visit(imported);
    }
  };

  visit(entry);
  return hrefs;
}

function setMetaContent(html, attr, key, content) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"[\\s\\S]*?content=")([^"]*)(")`, 'i');
  if (!re.test(html)) {
    throw new Error(`Не найден meta ${attr}="${key}"`);
  }
  return html.replace(re, `$1${content}$3`);
}

function escapeAttr(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}
