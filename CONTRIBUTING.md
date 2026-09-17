# Contributing

Thanks for adding to the list. The whole directory lives in one file, `data/projects.json`. The README and the site at [awesomejev.com](https://awesomejev.com) are generated from it.

## Add a project

1. Fork the repo and add an object to the `projects` array in `data/projects.json`:

   ```json
   {
     "name": "jev-router",
     "repo": "gargpratyush/jev-router",
     "site": null,
     "description": "Route to the cheapest capable model in Claude Code by asking Jev to choose among candidates.",
     "category": "agents",
     "language": "JavaScript",
     "stars": 0,
     "added": "2026-09-17"
   }
   ```

   - `repo` is `owner/name` on GitHub, or `null` for a project that only has a website.
   - `site` is a live URL (demo, docs, product page) or `null`.
   - `url` is only needed when there is neither a repo nor a site, for example an article.
   - `category` is one of the `id` values in the `categories` array at the top of the file.
   - `stars` and `language` are refreshed automatically for GitHub repos. Leave `stars` at `0`.

2. Run the build so the README and site update:

   ```bash
   npm run build
   ```

3. Open a pull request. One project per PR keeps review quick.

If you would rather not edit JSON, [open an issue](https://github.com/hellogumbo/awesome-jev/issues/new?template=submit-project.yml) with the link and a sentence about what it does.

## What gets listed

- The project actually calls Jev or the TypeSafe System One API, or is a faithful open replica, benchmark, or write-up about it.
- It is public. A repo, a live site, or a published article.
- It has a description someone else can understand. One sentence, plain language, what it does and where Jev fits.
- It is not a fork of something already listed unless it adds something new.

Empty repos, placeholder READMEs, and brand-name squats are removed when we find them.

## Maintenance scripts

```bash
npm run refresh    # update stars, language, and homepages from the GitHub API
npm run discover   # print repos mentioning Jev/TypeSafe that are not listed yet
npm run build      # regenerate README.md and site/index.html
```

Set `GITHUB_TOKEN` to avoid rate limits on `refresh` and `discover`.
