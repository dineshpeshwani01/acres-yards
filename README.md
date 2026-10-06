# Acres & Yards — Homepage draft

Static website (no build step). Open `index.html` locally or host on GitHub Pages.

## Structure
- `index.html` — the page (styles inline)
- `assets/site.js` — tabs, scroll animations, WhatsApp enquiry form
- `assets/motion.min.js` — Motion v14 (animation engine, the vanilla build of Framer Motion)
- `assets/lenis.min.js` — Lenis v1.3 (smooth scrolling)
- `assets/*` — logo, images, hero video

## Deploy to GitHub Pages
1. Create a new **public** repository on GitHub, e.g. `acres-yards`.
2. Upload everything in this folder (including the hidden `.nojekyll` file) to the root of the repo — or push with git:
   ```
   git init && git add -A && git commit -m "Acres & Yards homepage draft"
   git branch -M main
   git remote add origin https://github.com/<your-username>/acres-yards.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. After ~1 minute the site is live at `https://<your-username>.github.io/acres-yards/`.

Image credits: hero video and interior photos from Pexels (free licence). Interior images are for illustration only.
