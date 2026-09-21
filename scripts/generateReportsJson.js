const fs = require("fs");
const path = require("path");

const reportsDir = path.join(__dirname, "..", "reports");
const outFile = path.join(reportsDir, "reports.json");

function humanize(name) {
  // remove extension
  name = name.replace(/\.html?$/i, "");
  // replace underscores/dashes with spaces
  name = name.replace(/[_-]+/g, " ");
  // collapse multiple spaces
  name = name.replace(/\s+/g, " ").trim();
  // Title case
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  if (m && m[1]) return m[1].trim();
  return null;
}

function extractDescription(html) {
  // try meta description
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?>/i);
  if (m && m[1]) return m[1].trim();
  // try og:description
  const og = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']\s*\/?>/i);
  if (og && og[1]) return og[1].trim();
  // try first H1
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1 && h1[1]) return h1[1].trim();
  // try first paragraph
  const p = html.match(/<p[^>]*>([^<]{20,160})<\/p>/i);
  if (p && p[1]) return p[1].trim();
  return null;
}

function extractImage(html) {
  const og = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']\s*\/?>/i);
  if (og && og[1]) return og[1].trim();
  const link = html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']\s*\/?>/i);
  if (link && link[1]) return link[1].trim();
  const meta = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']\s*\/?>/i);
  if (meta && meta[1]) return meta[1].trim();
  return null;
}

function extractTags(html) {
  const kw = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']\s*\/?>/i);
  if (kw && kw[1]) return kw[1].split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  // fallback: look for data-tags attribute on body
  const dataTags = html.match(/<body[^>]+data-tags=["']([^"']+)["'][^>]*>/i);
  if (dataTags && dataTags[1]) return dataTags[1].split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  return [];
}

function build() {
  if (!fs.existsSync(reportsDir)) {
    console.error("reports/ directory not found");
    process.exit(1);
  }

  const files = fs.readdirSync(reportsDir).filter((f) => /\.html?$/i.test(f));
  const items = files.map((file) => {
    const full = path.join(reportsDir, file);
    let title = null;
    try {
      const content = fs.readFileSync(full, "utf8");
      title = extractTitle(content);
    } catch (e) {
      // ignore
    }
    if (!title) title = humanize(file);
    const filePath = `reports/${file}`;
    const description = (() => {
      try {
        const content = fs.readFileSync(full, 'utf8');
        return extractDescription(content);
      } catch (e) {
        return null;
      }
    })();
    const image = (() => {
      try {
        const content = fs.readFileSync(full, 'utf8');
        return extractImage(content);
      } catch (e) {
        return null;
      }
    })();
    const tags = (() => {
      try {
        const content = fs.readFileSync(full, 'utf8');
        return extractTags(content);
      } catch (e) {
        return [];
      }
    })();

    return { file: filePath, title: title, slug: slugify(title), description: description, image: image, tags: tags };
  });

  // sort by title
  items.sort((a, b) => a.title.localeCompare(b.title));

  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), "utf8");
  console.log("Wrote", outFile, "with", items.length, "entries");
}

build();
