# The Dispatch

> A fast, personalised, NYT-style news aggregator — fully client-side, no backend required.
> 100% AI vibe coded — built entirely with Claude Sonnet 4.6.

**Live site:** [news.aryanaryn.me](https://news.aryanaryn.me)
**Repository:** [github.com/AryanAryn/Dispatch-News](https://github.com/AryanAryn/Dispatch-News)

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Built with Claude](https://img.shields.io/badge/built%20with-Claude%20Sonnet%204.6-blueviolet?logo=anthropic&logoColor=white)

---

## Features

- **NYT-style layout** — hero grid, three-column band, main + sidebar, editorial strip, and full feed grid
- **Personalised feed** — two-tier recommendation engine: fast TF-IDF + NLP ranking on first load, then silently upgraded to semantic cosine similarity via Cloudflare Workers AI embeddings (`bge-small-en-v1.5`); blended 70% semantic / 30% TF-IDF with exponential recency decay and source-diversity penalty
- **Interest management** — view your top interest tags on the home sidebar; remove individual topics or reset everything from the Account page
- **Sports scores** — live results and upcoming fixtures via TheSportsDB, shown as a horizontally-scrollable scores band
- **Sports-aware search** — detects sports queries and surfaces match scores alongside articles
- **Breaking-news ticker** — animated headline strip on the home page
- **Article modal** — in-app preview with HTML stripping; opens the full story at its original publication; full keyboard support and focus trap
- **Click history** — stored in `localStorage`; powers the interest profile and "Recently read" sidebar
- **Per-page titles** — `document.title` updates dynamically on every route change
- **Type system** — Minor Third (×1.200) scale with 11 CSS tokens (`--text-xs` to `--text-6xl`)
- **Responsive** — mobile-first with a hamburger nav
- **SEO-ready** — meta description, Open Graph, Twitter Card, canonical URL, `robots.txt`, `sitemap.xml`, semantic HTML landmarks (`<main>`, `<article>`, `<nav aria-label>`)
- **Accessible** — `role="dialog"` + focus trap on modal, `aria-current="page"` on active nav, keyboard-navigable article cards, global `:focus-visible` ring
- **Google AdSense ready** — `<AdUnit>` component pre-wired; add your publisher ID and slots
- **Footer pages** — About, Privacy Policy, Terms of Service, and Contact pages included
- **CI/CD** — GitHub Actions builds and deploys to GitHub Pages on every push to `main`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 (hash-based for GitHub Pages) |
| Styling | Plain CSS with design tokens |
| Fonts | Playfair Display · Merriweather · Roboto Condensed · IBM Plex Serif |
| NLP | [compromise](https://github.com/spencermountain/compromise) v14 |
| Embeddings | Cloudflare Workers AI · `@cf/baai/bge-small-en-v1.5` (384-dim, free tier) |
| News data | [NewsAPI](https://newsapi.org) |
| Sports data | [TheSportsDB](https://www.thesportsdb.com) v1 |
| Ads | Google AdSense |
| CORS proxy | Cloudflare Worker (source in `worker/`) |
| Hosting | GitHub Pages (via GitHub Actions) |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/AryanAryn/Dispatch-News.git
cd Dispatch-News
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SPORTSDB_KEY=3          # free public key; upgrade for higher rate limits
VITE_PROXY_URL=              # your Cloudflare Worker URL (see below)
```

> **No `VITE_NEWSAPI_KEY` needed.** Users enter their own key on first visit. It is stored in `localStorage` only and never sent to any server you control.

### 3. Site identity (for forks)

Open `src/config.js` and update the identity block at the top:

```js
export const SITE_NAME      = 'The Dispatch';
export const SITE_OWNER     = 'Your Name';
export const GITHUB_REPO    = 'https://github.com/you/your-fork';
export const GITHUB_PROFILE = 'https://github.com/you';
export const CONTACT_EMAIL  = 'you@example.com';
```

These values are used throughout the About, Privacy Policy, Terms, and Contact pages.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). On first visit you will be prompted for your NewsAPI key. Vite proxies requests locally — no CORS issues.

### 5. Production build

```bash
npm run build
npm run preview
```

---

## Deploying to GitHub Pages

A ready-made workflow lives at `.github/workflows/deploy.yml`.

1. **Enable Pages**: Settings → Pages → Source → **GitHub Actions**
2. **Add secret** (Settings → Secrets and variables → Actions → Secrets):

   | Secret | Value |
   |---|---|
   | `VITE_SPORTSDB_KEY` | `3` or a paid key |

3. **Add variable** (Settings → Secrets and variables → Actions → Variables):

   | Variable | Value |
   |---|---|
   | `VITE_PROXY_URL` | your Cloudflare Worker URL |

4. Push to `main` — the workflow builds and deploys automatically.

---

## Recommendation Engine

Feed ranking runs in two transparent phases so the page is never blocked:

| Phase | When | Method |
|---|---|---|
| **1 — TF-IDF** | Immediate (synchronous) | Named-entity extraction via `compromise`; term frequency weighted by recency decay; 22% source-diversity penalty |
| **2 — Semantic** | ~1 s after articles load | Vectors fetched from `POST /embed` (CF Workers AI); user profile built by averaging the last 30 read articles; blended 70% cosine similarity + 30% TF-IDF |

Articles that haven't been vectorised yet are ranked at a 30% TF-IDF discount so they're still surfaced rather than buried.

Vectors are cached in `localStorage` under `dispatch_embed_vec` (capped at 300 entries ≈ 450 KB). No article text leaves the browser except to your own Cloudflare Worker.

---

## Cloudflare Worker (CORS Proxy + AI Embeddings)

The worker in `worker/` does two things:

1. **CORS proxy** — forwards NewsAPI requests so the browser isn't blocked by CORS on the free plan. The user's key travels as `X-Api-Key`; nothing is stored server-side.
2. **Embeddings endpoint** — `POST /embed` accepts up to 25 article texts and returns 384-dimensional vectors from `@cf/baai/bge-small-en-v1.5` via the [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) binding. Used to power semantic feed ranking. Free tier covers ~10,000 requests/day.

```bash
npm install -g wrangler
wrangler login
cd worker && npm install && npm run deploy
```

Copy the printed worker URL into `.env` (`VITE_PROXY_URL=...`) and the GitHub repo variable of the same name.

> **CF AI binding** is declared in `worker/wrangler.toml` under `[ai]` and requires no extra secrets or paid plan.

> **CI/CD**: pushing any file under `worker/` triggers `.github/workflows/deploy-worker.yml`. Requires a `CF_API_TOKEN` secret with *Workers Scripts: Edit* permission.

---

## Project Structure

```
src/
├── api/
│   ├── newsApi.js          # NewsAPI wrapper · 5-min cache · fetchEmbeddings()
│   └── sportsApi.js        # TheSportsDB wrapper
├── components/
│   ├── cards/              # HeroMain · HeroSecondary · ColCard · ListCard · FeedCard · EditorialCard
│   ├── sports/             # ScoreCard · ScoresBand
│   ├── AdUnit.jsx
│   ├── ArticleModal.jsx
│   ├── Masthead.jsx
│   ├── SectionHead.jsx
│   └── Ticker.jsx
├── context/
│   └── PersonalizationContext.jsx  # history · interest suppression · full reset
├── hooks/
│   ├── useNews.js
│   └── useSports.js
├── pages/
│   ├── AboutPage.jsx
│   ├── AccountPage.jsx
│   ├── AuthPage.jsx
│   ├── CategoryPage.jsx
│   ├── ContactPage.jsx
│   ├── HomePage.jsx
│   ├── PrivacyPolicyPage.jsx
│   ├── SearchPage.jsx
│   └── TermsPage.jsx
├── utils/
│   ├── recommend.js        # TF-IDF + NLP · cosine similarity · semantic blended ranking
│   └── time.js
├── config.js               # Site identity, API config, nav sections, localStorage keys
└── index.css               # Design tokens + full stylesheet
public/
├── robots.txt              # Allows all crawlers; points to sitemap
└── sitemap.xml             # Canonical root URL declaration
worker/
├── wrangler.toml           # [ai] binding for Workers AI
└── src/index.js            # CORS proxy (/v2/*) + embedding endpoint (POST /embed)
```

---

## Google AdSense

The publisher ID is set in `index.html` and `src/config.js`. To use your own:

1. Replace `ADSENSE_PUB_ID` in `src/config.js`
2. Replace the `<script>` tag in `index.html`
3. Update the `slot` prop on each `<AdUnit>` in `HomePage.jsx` and `CategoryPage.jsx`

Ads appear only after your site is reviewed and approved by Google AdSense (typically 2–4 weeks).

---

## Built with AI

This project is **100% AI vibe coded** — every line of code, design decision, and documentation was generated in collaboration with **[Claude Sonnet 4.6](https://www.anthropic.com/claude)** (Anthropic). No manual coding; purely prompt-driven development.

---

## License

MIT — fork freely.
