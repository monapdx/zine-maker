# Zine Maker

Browser-based zine editor (React, TypeScript, Vite).

## Local development

```bash
npm install
npm run dev
```

## GitHub Pages

This repo includes a workflow that builds with Vite and publishes the `dist` folder to GitHub Pages.

<img src="https://raw.githubusercontent.com/monapdx/zine-maker/refs/heads/main/zine-maker-05-11-2026_09_01_AM.png">

1. Create an empty repository on GitHub (any name). The live app URL will be `https://<your-username>.github.io/<repo>/` (for example `https://yourname.github.io/zine-maker/`). The build sets the correct asset base path from the repository name automatically in Actions.
2. On GitHub: **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”). Do this before you rely on the first deploy; it provisions Pages for the Actions-based workflow.
3. Push the `main` branch:

   ```bash
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```

4. Open the **Actions** tab and confirm the “Deploy to GitHub Pages” workflow completed. The site URL appears in the workflow summary and under **Settings → Pages**.

To rebuild manually, use **Actions → Deploy to GitHub Pages → Run workflow**.

### Site looks blank (white page)

1. **Project site URL** — For a normal repo named `zine-maker`, the app lives at `https://<user>.github.io/zine-maker/` (with the repo slug in the path). Opening only `https://<user>.github.io/` will not load this app.
2. **User/org Pages repo** — If the repo is named `<user>.github.io` or `<org>.github.io`, the site is served from the domain root (`/`). The build sets Vite `base` to `/` automatically in that case.
3. In the browser, open DevTools → **Network**, reload, and check whether `*.js` / `*.css` return **404**. Wrong `base` usually shows every asset as 404.

### Custom base path (optional)

Override the asset prefix when building:

```bash
VITE_BASE_PATH=/my-path/ npm run build
```
