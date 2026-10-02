// Check static same-site href/src paths and HTML anchors in the built Pages
// artifact. External destinations and links assembled by browser JS are out of
// scope; this checker makes no network calls.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || 'dist');
const origin = 'https://synchrosocial.com';
const localHosts = new Set(['synchrosocial.com', 'www.synchrosocial.com']);

if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`Missing built site: ${root}. Run npm run build first.`);
  process.exit(1);
}

function filesIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

function routeFor(file) {
  const name = relative(root, file).split(sep).join('/');
  return '/' + (name.endsWith('index.html') ? name.slice(0, -'index.html'.length) : name);
}

function staticMarkup(html) {
  // Script strings and commented-out markup are not links or anchors.
  return html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');
}

function builtTarget(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { return null; }
  const candidate = resolve(root, decoded.replace(/^\/+/, ''));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const index = join(candidate, 'index.html');
  if (existsSync(index) && statSync(index).isFile()) return index;
  return null;
}

const htmlFiles = filesIn(root).filter(file => file.endsWith('.html'));
const idsByFile = new Map();
const broken = [];
let checked = 0;

for (const file of htmlFiles) {
  const source = routeFor(file);
  const staticHtml = staticMarkup(readFileSync(file, 'utf8'));
  const tags = staticHtml.match(/<(?:a|area|link|img|script|iframe|video|audio|source|track|embed)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    for (const attribute of tag.matchAll(/\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      const raw = attribute[1] ?? attribute[2] ?? attribute[3];
      if (!raw || raw.startsWith('data:')) continue;
      let url;
      try { url = new URL(raw.replaceAll('&amp;', '&'), origin + source); }
      catch { broken.push(`${source}: malformed reference`); continue; }
      if (!localHosts.has(url.hostname) || !['http:', 'https:'].includes(url.protocol)) continue;
      checked++;
      const target = builtTarget(url.pathname);
      const reference = url.pathname + url.hash;
      if (!target) {
        broken.push(`${source}: ${reference} is missing from dist`);
        continue;
      }
      if (!url.hash || !target.endsWith('.html')) continue;
      let fragment;
      try { fragment = decodeURIComponent(url.hash.slice(1)); }
      catch { broken.push(`${source}: malformed fragment in ${reference}`); continue; }
      if (!fragment) continue;
      if (!idsByFile.has(target)) {
        const targetHtml = staticMarkup(readFileSync(target, 'utf8'));
        idsByFile.set(target, new Set([...targetHtml.matchAll(/\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)]
          .map(match => match[1] ?? match[2])));
      }
      if (!idsByFile.get(target).has(fragment)) broken.push(`${source}: ${reference} has no matching anchor`);
    }
  }
}

for (const issue of broken) console.error(issue);
console.log(`Checked ${checked} same-site href/src references in ${htmlFiles.length} built HTML files: ${broken.length} broken.`);
if (broken.length) process.exitCode = 1;
