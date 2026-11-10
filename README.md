# CNLY — cnly.app
Static, no build step. Files: `index.html`, `style.css`, `main.js`, `favicon.png`, `CNAME`,
`assets/` (both official logos + self-hosted fonts), `.github/workflows/pages.yml`.

## Run locally
`python3 -m http.server 8000` then open http://localhost:8000

## Deploy (GitHub Pages)
1. Push this folder to the root of a repo's `main` branch.
2. Repo Settings → Pages → Source: **GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` publishes on every push.

## Custom domain cnly.app
- `CNAME` already contains `cnly.app`. Set the same in Settings → Pages → Custom domain.
- DNS at your registrar: four `A` records on `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
  (optional `AAAA` and `CNAME www → <user>.github.io`). Check GitHub's docs for current IPs.
- Enable "Enforce HTTPS" once the certificate is issued.
