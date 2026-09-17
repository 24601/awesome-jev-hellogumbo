#!/usr/bin/env node
// Prints GitHub repos that mention Jev/TypeSafe and are not in data/projects.json yet.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const known = new Set(data.projects.filter((p) => p.repo).map((p) => p.repo.toLowerCase()));
const since = process.argv[2] || new Date(Date.now() - 7 * 86400e3).toISOString().slice(0, 10);
const token = process.env.GITHUB_TOKEN;
const headers = { Accept: "application/vnd.github+json", "User-Agent": "awesome-jev-discover" };
if (token) headers.Authorization = `Bearer ${token}`;

const queries = [`jev typesafe created:>=${since}`, `typesafe.ai created:>=${since}`, `"system one" jev created:>=${since}`, `jev in:name,description typesafe created:>=${since}`];
const relevant = /\b(jev|typesafe\.ai|typesafe ai|typesafe-ai|system one)\b/i;
const found = new Map();
for (const q of queries) {
  for (let page = 1; page <= 3; page++) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=updated&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`${q} p${page}: ${res.status}`);
      break;
    }
    const body = await res.json();
    for (const r of body.items || []) {
      const text = `${r.full_name} ${r.description || ""} ${(r.topics || []).join(" ")}`;
      if (r.fork || r.archived || !relevant.test(text) || known.has(r.full_name.toLowerCase())) continue;
      found.set(r.full_name, r);
    }
    if ((body.items || []).length < 100) break;
  }
}

const rows = [...found.values()].sort((a, b) => b.stargazers_count - a.stargazers_count);
console.log(`${rows.length} candidates since ${since} not yet listed:\n`);
for (const r of rows) {
  console.log(`${String(r.stargazers_count).padStart(5)}  ${r.full_name.padEnd(45)} ${r.language || "-"}\n       ${r.description || ""}${r.homepage ? `\n       ${r.homepage}` : ""}`);
}
