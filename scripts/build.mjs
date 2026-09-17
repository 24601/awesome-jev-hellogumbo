#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const template = readFileSync(resolve(root, "scripts/template.html"), "utf8");

const { categories, projects } = data;
const byCategory = Object.fromEntries(categories.map((c) => [c.id, []]));
for (const p of projects) {
  if (!byCategory[p.category]) throw new Error(`Unknown category "${p.category}" on ${p.name}`);
  byCategory[p.category].push(p);
}
for (const list of Object.values(byCategory)) {
  list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (b.stars || 0) - (a.stars || 0) || a.name.localeCompare(b.name));
}

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (n) => new Intl.NumberFormat("en-US").format(n || 0);
const slug = (id) => id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const primaryUrl = (p) => p.url || (p.repo ? `https://github.com/${p.repo}` : p.site);
const ownerOf = (p) => (p.repo ? p.repo.split("/")[0] : null);
const normalizeDescription = (d = "") => {
  let s = d.trim().replace(/\s+/g, " ");
  if (!s) return "";
  s = s[0].toUpperCase() + s.slice(1);
  if (!/[.!?。]$/.test(s)) s += ".";
  return s;
};

// ---------- README ----------
const readmeSections = categories
  .map((c) => {
    const items = byCategory[c.id]
      .map((p) => {
        const extra = p.site && p.repo ? ` ([site](${p.site}))` : "";
        return `- [${p.name}](${primaryUrl(p)})${extra} - ${normalizeDescription(p.description)}`;
      })
      .join("\n");
    return `## ${c.title}\n\n${c.blurb}\n\n${items}`;
  })
  .join("\n\n");

const contents = categories.map((c) => `- [${c.title}](#${slug(c.title)})`).join("\n");

const readme = `# Awesome Jev [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> Projects, SDKs, demos, and research built on [Jev](https://typesafe.ai), TypeSafe AI's System One model.

Browse it at **[awesomejev.com](https://awesomejev.com)**.

Jev does not generate text. You send it a block of state and a set of typed questions (Choice, Score, Noul), and it answers all of them in parallel with calibrated probabilities in roughly 70 to 500 ms. Early access opened on 15 September 2026, and builders shipped hundreds of projects in the first days. This list tracks them.

This list is community-maintained and not affiliated with TypeSafe AI. Add your project with a pull request or [open an issue](https://github.com/hellogumbo/awesome-jev/issues/new?template=submit-project.yml). See [CONTRIBUTING.md](CONTRIBUTING.md).

${num(projects.length)} entries · last refreshed ${data.updated}

## Contents

${contents}
- [Contributing](#contributing)

${readmeSections}

## Contributing

Pull requests welcome. Edit \`data/projects.json\` (it drives both this README and the site) and run \`npm run build\`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the entry format and inclusion criteria.

## License

[CC0 1.0](LICENSE). Maintained by [Gumbo](https://hellogumbo.com).
`;

writeFileSync(resolve(root, "README.md"), readme);

// ---------- Site ----------
const icons = {
  github:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 15a3.72 3.72 0 0 0-1 2.58V21m5-6a3.72 3.72 0 0 1 1 2.58V21m-6-1.95a5.7 5.7 0 0 1-2.82.36c-1.52-.52-1.12-1.9-1.9-2.47A2.37 2.37 0 0 0 3 16.5m16-6.75c0 3-1.95 5.25-7 5.25s-7-2.25-7-5.25a6.3 6.3 0 0 1 .68-3c-.34-1.47-.21-3.28.52-3.64s2.27.3 3.54 1.15a13 13 0 0 1 2.26-.2 13 13 0 0 1 2.26.18c1.27-.85 2.88-1.48 3.54-1.15s.86 2.17.52 3.64A6.3 6.3 0 0 1 19 9.75Z"/></svg>',
  globe:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.85 12h18.3m-18.3 0A9.15 9.15 0 0 0 12 21.15M2.85 12A9.15 9.15 0 0 1 12 2.85M21.15 12A9.15 9.15 0 0 1 12 21.15M21.15 12A9.15 9.15 0 0 0 12 2.85m0 0A14 14 0 0 1 15.66 12 14 14 0 0 1 12 21.15m0-18.3A14 14 0 0 0 8.34 12 14 14 0 0 0 12 21.15"/></svg>',
  star:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.15 6.247c.841-1.764 1.262-2.646 1.812-2.967a2.06 2.06 0 0 1 2.077 0c.549.32.97 1.203 1.812 2.967.25.523.374.785.553.993.21.244.473.436.77.56.254.105.54.143 1.115.219 1.939.255 2.908.383 3.382.807.554.495.8 1.249.642 1.975-.135.621-.844 1.294-2.262 2.64-.42.4-.63.599-.773.833a2.1 2.1 0 0 0-.294.906c-.022.273.03.558.136 1.128.356 1.922.534 2.884.277 3.465a2.06 2.06 0 0 1-1.68 1.221c-.633.064-1.492-.402-3.21-1.335-.51-.276-.764-.414-1.03-.478a2.06 2.06 0 0 0-.953 0c-.267.064-.522.202-1.03.478-1.72.933-2.578 1.4-3.21 1.335a2.06 2.06 0 0 1-1.681-1.22c-.257-.582-.079-1.544.277-3.466.106-.57.159-.855.136-1.128a2.06 2.06 0 0 0-.294-.906c-.143-.234-.353-.434-.773-.832-1.418-1.347-2.127-2.02-2.262-2.641a2.06 2.06 0 0 1 .642-1.975c.474-.424 1.444-.552 3.382-.807.574-.076.862-.114 1.115-.22.297-.123.56-.315.77-.56.179-.207.304-.469.553-.992Z"/></svg>',
  external:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13.5c0 1.395 0 2.092-.138 2.667a5 5 0 0 1-3.695 3.695C15.592 20 14.894 20 13.5 20H12c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C4 16.2 4 14.8 4 12v-.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 7.088 4.38c.776-.322 1.73-.372 3.413-.38m9.26 5.454c.262-1.633.31-3.285.142-4.914a.5.5 0 0 0-.142-.3m0 0a.5.5 0 0 0-.301-.143 18.8 18.8 0 0 0-4.913.142m5.214 0L10 14"/></svg>',
};

const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.entries(icons)
  .map(([id, svg]) => svg.replace(/^<svg[^>]*>/, `<symbol id="i-${id}" viewBox="0 0 24 24" fill="none">`).replace("</svg>", "</symbol>"))
  .join("")}</defs></svg>`;
const use = (id) => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;

const linkIcons = (p) => {
  const out = [];
  if (p.repo) out.push(`<a class="ico" href="https://github.com/${esc(p.repo)}" title="GitHub" aria-label="GitHub repository">${use("github")}</a>`);
  if (p.site) out.push(`<a class="ico" href="${esc(p.site)}" title="Website" aria-label="Website">${use("globe")}</a>`);
  if (!p.repo && !p.site && p.url) out.push(`<a class="ico" href="${esc(p.url)}" title="Link" aria-label="Link">${use("external")}</a>`);
  return out.join("");
};

const row = (p) => {
  const text = [p.name, p.description, p.language, ownerOf(p), p.category].filter(Boolean).join(" ").toLowerCase();
  const owner = ownerOf(p);
  return `<tr data-name="${esc(p.name.toLowerCase())}" data-stars="${p.stars || 0}" data-added="${esc(p.added || "")}" data-text="${esc(text)}">
  <td class="c-name"><a href="${esc(primaryUrl(p))}">${esc(p.name)}</a>${owner ? `<span class="owner">${esc(owner)}</span>` : ""}</td>
  <td class="c-desc">${esc(normalizeDescription(p.description))}</td>
  <td class="c-lang">${p.language ? esc(p.language) : '<span class="dim">—</span>'}</td>
  <td class="c-stars">${p.repo ? `<span class="stars">${use("star")}${num(p.stars)}</span>` : '<span class="dim">—</span>'}</td>
  <td class="c-links">${linkIcons(p)}</td>
</tr>`;
};

const sections = categories
  .map((c) => {
    const items = byCategory[c.id];
    return `<section class="cat" id="${esc(slug(c.title))}" data-cat="${esc(c.id)}">
  <div class="split">
    <h2>${esc(c.title)}</h2>
    <p class="lede">${esc(c.blurb)} <span class="count" data-count>${items.length}</span></p>
  </div>
  <table class="dir">
    <thead><tr><th>Project</th><th>What it does</th><th>Language</th><th>Stars</th><th>Links</th></tr></thead>
    <tbody>
${items.map(row).join("\n")}
    </tbody>
  </table>
  <p class="empty" hidden>No matches in this section.</p>
</section>`;
  })
  .join("\n\n");

const chips = [`<button class="chip is-active" data-filter="all" type="button">All</button>`]
  .concat(categories.map((c) => `<button class="chip" data-filter="${esc(c.id)}" type="button">${esc(c.title)}</button>`))
  .join("\n");

const featuredPool = projects
  .filter((p) => p.repo && !["official", "integrations", "lists", "articles"].includes(p.category))
  .sort((a, b) => (b.stars || 0) - (a.stars || 0))
  .slice(0, 4);
const featured = featuredPool
  .map(
    (p) => `<div class="feat">
  <a class="feat-card" href="${esc(primaryUrl(p))}">
    <span class="feat-stars">${num(p.stars)}</span>
    <span class="feat-label">stars</span>
    <span class="feat-name">${esc(p.name)}</span>
  </a>
  <p class="feat-desc">${esc(normalizeDescription(p.description))}</p>
</div>`
  )
  .join("\n");

const repoCount = projects.filter((p) => p.repo).length;
const siteCount = projects.filter((p) => p.site).length;
const starsTotal = projects.reduce((n, p) => n + (p.repo ? p.stars || 0 : 0), 0);

const html = template
  .replaceAll("{{PROJECT_COUNT}}", num(projects.length))
  .replaceAll("{{REPO_COUNT}}", num(repoCount))
  .replaceAll("{{SITE_COUNT}}", num(siteCount))
  .replaceAll("{{STARS_TOTAL}}", num(starsTotal))
  .replaceAll("{{UPDATED}}", esc(data.updated))
  .replace("{{SPRITE}}", sprite)
  .replace("{{FEATURED}}", featured)
  .replace("{{CHIPS}}", chips)
  .replace("{{SECTIONS}}", sections);

writeFileSync(resolve(root, "site/index.html"), html);
console.log(`Built README.md and site/index.html: ${projects.length} entries, ${repoCount} repos, ${siteCount} sites, ${num(starsTotal)} stars.`);
