# Upload Finance Intelligence OS to GitHub

This archive is the complete source project for the `Finance-Intelligence-OS` repository. Extract the contents directly into the root of the cloned repository; do not upload this ZIP as a single file.

## Recommended method: GitHub Desktop

1. Install GitHub Desktop from https://desktop.github.com/ and sign in to the GitHub account that owns `whizz444yt-ux/Finance-Intelligence-OS`.
2. In GitHub Desktop, choose **File → Clone repository**. Select `whizz444yt-ux/Finance-Intelligence-OS` and choose a local folder.
3. Extract this ZIP directly into that cloned repository folder. The files `README.md`, `index.html`, `package.json`, `scripts/`, `assets/`, `cloudflare/`, `supabase/`, `ict-futures/`, `docs/`, and `dist/` should be directly inside the repository root. Do not place the entire project inside an extra nested `finance-intelligence-os/` folder.
4. Do not delete the hidden `.git` folder created by GitHub Desktop.
5. Return to GitHub Desktop. Review the changed files. Use the summary `Add Finance Intelligence OS source project`, select **Commit to main**, then **Push origin**.
6. Open https://github.com/whizz444yt-ux/Finance-Intelligence-OS and verify that `README.md`, `index.html`, `scripts/`, `dist/`, `docs/`, and the other project folders appear at the repository root.

## Alternative: Git command line

Clone the empty repository, extract this ZIP directly into the cloned folder without overwriting or deleting `.git`, then run:

```bash
git add .
git status
git commit -m "Add Finance Intelligence OS source project"
git push -u origin main
```

## What is included

- Source website, shared assets, data, scripts, automated tests and GitHub Actions workflows.
- Generated static website in `dist/` (104 HTML pages in the supplied build report).
- ICT Futures terminal, contract-family pages, Academy pages and retained legacy/source-baseline materials.
- Supabase schema/setup and seed SQL files.
- Cloudflare Worker source and Wrangler configuration.
- Vercel configuration, environment-variable example, architecture, implementation, security and build documentation.

## Deployment settings prepared for Vercel

- Framework preset: Other / None.
- Root directory: repository root (`.`).
- Build command: `python3 scripts/build_site.py`.
- Output directory: `dist`.
- Set `SITE_URL` to the final HTTPS production URL in Vercel's Production environment, then redeploy. The build intentionally remains `noindex` until the real production URL is set.

After the repository is pushed, import it in Vercel and connect the GitHub login connection when prompted. Configure and test Supabase Auth redirect URLs using the final production domain before relying on sign-in.

## Security rules

- Never commit `.env`, actual API tokens, passwords, private keys, service-role keys or other secrets.
- `.env.example` contains blank placeholders only. Create real local `.env` files from it only on your own computer; `.gitignore` is configured to ignore `.env` files.
- The browser runtime is designed to use only the Supabase publishable/anonymous key. Keep Supabase service-role credentials server-side only.
- Cloudflare Worker secrets must be configured using Wrangler secrets or the Cloudflare dashboard; do not paste their values into source files.
- Any credential shown in a screenshot or chat must be considered exposed and revoked/rotated before use. In particular, the `btk-` token shown in the supplied screenshot appears to be a Builder.io Personal Access Token; revoke it in Builder.io and do not upload it. Use a newly created, appropriate Builder Content API key only as a server-side Worker secret if that integration is enabled.

## Validation performed on the supplied source archive

- Unit tests: 6/6 passed.
- Structural validation: 33/33 passed.
- Internal HTML links checked: 779; broken links: 0.

These checks validate the supplied local source package. They do not by themselves prove that production APIs, user sign-in, or the hosted website have been fully tested.
