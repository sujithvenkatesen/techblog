# Blockwise Tech Blog (MERN)

Editorial tech blog with a Midnight Black / Electric Cobalt / Acid Lime UI, an interactive 3D-block logo hero,
a "Wireframe-to-Live" scroll reveal, and a JWT-protected CMS.

> The 3D logo is an original four-cube mark for a fictional brand ("Blockwise"), not a third-party logo.
> Swap the name, letters and colours in `client/src/components/Brand.jsx` and `Logo3D.jsx`.

## Quick start

Requires Node 18+ and a MongoDB instance (local or Atlas).

```bash
# 1) API
cd server
cp .env.example .env        # set MONGO_URI, JWT_SECRET, ADMIN_* 
npm install
npm run dev                 # http://localhost:5000

# 2) Web (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```


On first start the server seeds: 7 categories, 4 authors, 10 tags, 7 sample articles, and an admin user.
Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` before the first startup. No default admin credentials are provided. Admin lives at `/admin`.


## How the pieces fit

| Requirement | Where |
| --- | --- |
| Proxy / devtunnel support | `client/vite.config.js` proxies `/api`, `/uploads`, `/sitemap.xml`, `/robots.txt` to `localhost:5000`; Axios uses relative `/api` (`client/src/services/api.js`). `host: true` and `allowedHosts: true` allow `*.devtunnels.ms`. |
| Never-empty homepage | `client/src/data/fallback.js` + `api.js`: any API failure, or 0 posts with no filters, returns 6 hardcoded posts. `HomePage` also starts with them as initial state. |
| Auto-seed | `server/seed/` runs on startup when collections are empty (`npm run seed` to run manually). |
| Wireframe-to-Live | `client/src/components/WireframeReveal.jsx` + `.wf-reveal` rules in `index.css`. In-viewport elements go live immediately; a 500ms fallback, scroll/resize re-checks and a ResizeObserver guarantee nothing stays at `opacity: 0`. |
| Scheduled publishing | `server/utils/scheduler.js` (node-cron, every minute). |
| Uploads | Multer to `server/uploads/`; set `CLOUDINARY_*` to use Cloudinary instead. |
| SEO | Dynamic `/sitemap.xml` and `/robots.txt` (server), per-page meta + Open Graph + canonical + `BlogPosting` JSON-LD (`client/src/hooks.js`). |
| Analytics | Set `VITE_GA_ID=G-XXXX` in `client/.env`; add a Search Console tag in `client/index.html`. |
| Permissions | Roles `admin`/`editor`; editors get per-area permissions (`posts`, `media`, `taxonomy`, `authors`, `users`). |

## Deploying

Set `SITE_URL` (used in the sitemap) to your public domain. Serve `client/dist` from a host that forwards
`/api`, `/uploads`, `/sitemap.xml` and `/robots.txt` to the Express server, and rewrites other routes to `index.html`.
Set a strong `JWT_SECRET`.

## Contact & social links

Edit `client/src/data/site.js` to change the email and social profiles shown in the footer, the About page and the homepage JSON-LD (`sameAs`).

## Notes

- Article HTML is sanitised with DOMPurify before render; iframes are allowed for video embeds.
- The editor is a lightweight `contentEditable` toolbar with an HTML source mode. For heavier editing needs, swap in TipTap or Lexical in `RichEditor.jsx`.
