const fs = require("fs");
const path = require("path");

const rootReportsDir = path.join(__dirname, "..", "reports");
const reportsDir = path.join(rootReportsDir, "ebitda_prediction_online");
const outFile = path.join(rootReportsDir, "reports.json");

function humanize(name) {
  // remove extension
  name = name.replace(/\.html?$/i, "");
  // replace underscores/dashes with spaces
  name = name.replace(/[_-]+/g, " ");
  // collapse multiple spaces
  name = name.replace(/\s+/g, " ").trim();
  // keep to stock-name style: remove noisy descriptors and ticker suffixes
  name = name.replace(/\s*\([^)]*\)\s*/g, " ");
  name = name.replace(
    /\s*(master|forward|earnings|intelligence|forecast|dashboard|portal|hub|model|spa|financial|report|analysis|app|html|interactive|institutional|quarter|8-quarter|q1|q2|q3|q4)\b/gi,
    " ",
  );
  name = name.replace(/\s+/g, " ").trim();
  // Title case
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const REPORT_TITLE_OVERRIDES = {
  "aarti_pharmalabs_earnings_intelligence_spa.html": "Aarti Pharmalabs",
  "borosil_renewables_earnings_intelligence_dashboard.html":
    "Borosil Renewables",
  "cgpower_earnings_intelligence_spa.html": "CG Power",
  "eureka_forbes_earnings_intelligence_dashboard.html": "Eureka Forbes",
  "fedbank_financial_services_forecast_app.html": "Fedbank Financial Services",
  "happy_forgings_dashboard.html": "Happy Forgings",
  "jana_sfb_earnings_forecast_intelligence_hub.html": "Jana SFB",
  "northern_arc_earnings_interactive_forecast.html": "Northern Arc",
  "pricol_earnings_intelligence_app.html": "Pricol",
  "tega_industries_earnings_forecast_dashboard_html.html": "Tega Industries",
  "wockhardt_interactive_earnings_intelligence_hub_8Q.html": "Wockhardt",
};

function cleanDisplayTitle(title) {
  if (!title) return null;
  return title
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(
      /\s*(?:[-–—|]\s*)?(?:Earnings|Financial|Forecast|Intelligence|Dashboard|Portal|Hub|Model|SPA|App|Report|Forward|Master|Institutional|Interactive|Quarter|8-Quarter|HTML|Html)\b.*$/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
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
  const m = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?>/i,
  );
  if (m && m[1]) return m[1].trim();
  // try og:description
  const og = html.match(
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']\s*\/?>/i,
  );
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
  const og = html.match(
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']\s*\/?>/i,
  );
  if (og && og[1]) return og[1].trim();
  const link = html.match(
    /<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']\s*\/?>/i,
  );
  if (link && link[1]) return link[1].trim();
  const meta = html.match(
    /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']\s*\/?>/i,
  );
  if (meta && meta[1]) return meta[1].trim();
  return null;
}

function extractTags(html) {
  const kw = html.match(
    /<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']\s*\/?>/i,
  );
  if (kw && kw[1])
    return kw[1]
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  // fallback: look for data-tags attribute on body
  const dataTags = html.match(/<body[^>]+data-tags=["']([^"']+)["'][^>]*>/i);
  if (dataTags && dataTags[1])
    return dataTags[1]
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function build() {
  if (!fs.existsSync(reportsDir)) {
    console.error("reports/ebitda_prediction_online/ directory not found");
    process.exit(1);
  }

  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => /\.html?$/i.test(f))
    .filter((f) => f !== "main_dashboard.html");
  const items = files.map((file) => {
    const full = path.join(reportsDir, file);
    let title = null;
    try {
      const content = fs.readFileSync(full, "utf8");
      title = extractTitle(content);
    } catch (e) {
      // ignore
    }
    title = cleanDisplayTitle(title) || humanize(file);
    const filePath = `reports/ebitda_prediction_online/${file}`;
    const description = (() => {
      try {
        const content = fs.readFileSync(full, "utf8");
        return extractDescription(content);
      } catch (e) {
        return null;
      }
    })();
    const image = (() => {
      try {
        const content = fs.readFileSync(full, "utf8");
        return extractImage(content);
      } catch (e) {
        return null;
      }
    })();
    const tags = (() => {
      try {
        const content = fs.readFileSync(full, "utf8");
        return extractTags(content);
      } catch (e) {
        return [];
      }
    })();

    return {
      file: filePath,
      title: title,
      slug: slugify(title),
      description: description,
      image: image,
      tags: tags,
    };
  });

  // sort by title
  items.sort((a, b) => a.title.localeCompare(b.title));

  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), "utf8");
  console.log("Wrote", outFile, "with", items.length, "entries");
}

build();
