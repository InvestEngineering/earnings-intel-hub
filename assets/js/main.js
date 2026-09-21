let reports = [];

async function loadReports() {
  try {
    const res = await fetch("reports/reports.json");
    reports = await res.json();
    applyFilters();
  } catch (e) {
    console.error(
      "Failed to load reports.json, falling back to inline list",
      e,
    );
    // fallback inline list
    reports = [
      {
        file: "reports/aarti_pharmalabs_earnings_intelligence_spa.html",
        title: "Aarti Pharmalabs",
      },
      {
        file: "reports/borosil_renewables_earnings_intelligence_dashboard.html",
        title: "Borosil Renewables",
      },
      {
        file: "reports/cgpower_earnings_intelligence_spa.html",
        title: "CG Power",
      },
      {
        file: "reports/eureka_forbes_earnings_intelligence_dashboard.html",
        title: "Eureka Forbes",
      },
      {
        file: "reports/fedbank_financial_services_forecast_app.html",
        title: "Fedbank Financial Services",
      },
      {
        file: "reports/happy_forgings_dashboard.html",
        title: "Happy Forgings",
      },
      {
        file: "reports/jana_sfb_earnings_forecast_intelligence_hub.html",
        title: "Jana SFB",
      },
      {
        file: "reports/northern_arc_earnings_interactive_forecast.html",
        title: "Northern Arc",
      },
      {
        file: "reports/pricol_earnings_intelligence_app.html",
        title: "Pricol",
      },
      {
        file: "reports/tega_industries_earnings_forecast_dashboard_html.html",
        title: "Tega Industries",
      },
      {
        file: "reports/wockhardt_interactive_earnings_intelligence_hub_8Q.html",
        title: "Wockhardt (earnings hub)",
      },
      {
        file: "reports/wockhardt_interactive_financial_dashboard.html",
        title: "Wockhardt (financial dashboard)",
      },
    ];
    applyFilters();
  }
}

let cardsEl;
let searchEl;
let sortEl;

// initialize after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  cardsEl = document.getElementById("cards");
  searchEl = document.getElementById("search");
  sortEl = document.getElementById("sort");

  // wire search/sort listeners
  if (searchEl) searchEl.addEventListener("input", applyFilters);
  if (sortEl) sortEl.addEventListener("change", applyFilters);

  // initial render
  loadReports();
});

function getCompactTitle(title) {
  if (!title) return "Report";
  return title
    .split(/\s*[\-|–|│]\s*/)[0]
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFileLabel(file) {
  return file
    .replace(/^reports\//, "")
    .replace(/\.html?$/i, "")
    .replace(/_/g, " ");
}

function render(list) {
  cardsEl.innerHTML = "";
  list.forEach((r) => {
    const div = document.createElement("article");
    div.className = "card";
    const fileBase = r.file.split("/").pop();
    const baseName = fileBase.replace(/\.html?$/i, "");
    const promptPath = `prompts/${baseName}.md`;
    const promptPathAlt = `prompts/${baseName}.html.md`;
    const title = getCompactTitle(r.title);
    const company = r.description || title;
    const img = r.image
      ? `<img class="thumb" src="${r.image}" alt="${title}" loading="lazy" />`
      : "";
    const tags =
      r.tags && r.tags.length
        ? `<div class="tags">${r.tags
            .slice(0, 3)
            .map((t) => `<span class="tag">${t}</span>`)
            .join("")}</div>`
        : "";

    div.innerHTML = `
      <div class="card-header">${img}<h3>${title}</h3></div>
      <div class="card-body">
        <p class="company">${company}</p>
        ${tags}
      </div>
      <div class="actions">
        <a class="btn secondary" href="${promptPath}" data-alt="${promptPathAlt}">Prompts</a>
        <a class="btn" href="${r.file}" target="_blank" rel="noopener">Open</a>
      </div>
    `;
    div.tabIndex = 0;
    div.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        const openLink = div.querySelector("a.btn");
        if (openLink) openLink.click();
      }
    });
    cardsEl.appendChild(div);
  });
}

function applyFilters() {
  const q = searchEl.value.trim().toLowerCase();
  let filtered = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(q) || r.file.toLowerCase().includes(q),
  );
  if (sortEl.value === "alpha")
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sortEl.value === "nameDesc")
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  render(filtered);
}

// Note: initialization and event binding happen on DOMContentLoaded
