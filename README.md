# The Dispatch

> **Built entirely with Claude Sonnet 4.6** — a NYT-style news aggregator demonstrating what a single AI coding session can produce from scratch.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **NYT-style layout** — hero grid, three-column band, main + sidebar, editorial strip, and a full feed grid
- **Personalised feed** — TF-IDF recommendation engine with NLP entity extraction (`compromise`) and exponential recency decay; adapts as you read
- **Sports scores** — live results and upcoming fixtures via TheSportsDB API, shown as a horizontally-scrollable scores band
- **Sports-aware search** — detects sports queries and surfaces match scores alongside news results
- **Breaking-news ticker** — animated headline strip on the home page
- **Article modal** — in-app preview with HTML stripping; opens the full story in its original publication
- **Click history** — reading history stored in `localStorage`; powers the interest profile and "Recently read" sidebar
- **Responsive** — mobile-first with a hamburger nav that collapses to a full-screen drawer on small screens
- **Google AdSense ready** — `<AdUnit>` component pre-wired; just add your publisher ID
- **CI/CD** — GitHub Actions workflow builds and deploys to GitHub Pages on every push to `main`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Plain CSS with design tokens (`--serif`, `--body`, `--ui`) |
| Fonts | Playfair Display · Merriweather · Barlow Condensed |
| NLP | [compromise](https://github.com/spencermountain/compromise) v14 |
| News data | [NewsAPI](https://newsapi.org) |
| Sports data | [TheSportsDB](https://www.thesportsdb.com) v1 |
| Ads | Google AdSense |
| Hosting | GitHub Pages (via GitHub Actions) |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/<you>/dispatch-news.git
cd dispatch-news
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SPORTSDB_KEY=3                # free public key; upgrade for live scores
VITE_PROXY_URL=                    # your Cloudflare Worker URL (see below)
```

> **No `VITE_NEWSAPI_KEY` needed.** Users enter their own key directly in the app on first visit. It is stored in their browser's `localStorage` only and never sent anywhere except NewsAPI.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). On first visit you'll be prompted to enter your NewsAPI key. The Vite dev server proxies `/newsapi` and `/sportsdb` automatically, so you won't hit CORS issues locally.

### 4. Production build

```bash
npm run build
npm run preview   # serve the dist/ folder locally
```

---

## Deploying to GitHub Pages

The repo includes a ready-made workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. **Enable Pages** in your repo: Settings → Pages → Source → **GitHub Actions**
2. **Add secret** in Settings → Secrets and variables → Actions → **Secrets**:

   | Secret | Value |
   |---|---|
   | `VITE_SPORTSDB_KEY` | `3` or a paid key |

3. **Add variable** in Settings → Secrets and variables → Actions → **Variables**:

   | Variable | Value |
   |---|---|
   | `VITE_PROXY_URL` | your Cloudflare Worker URL (see below) |

4. Push to `main` — the workflow builds and deploys automatically.
5. Your site will be live at `https://news.aryanaryn.me`.

---

## Cloudflare Worker (CORS Proxy)

NewsAPI blocks direct browser requests from non-`localhost` origins on the free plan. The worker source lives in [`worker/`](worker/) inside this repo. It acts as a transparent CORS proxy — no API key is stored server-side; users supply their own key from the browser, forwarded as the `X-Api-Key` header.

### First-time setup

```bash
# Install Wrangler globally (once)
npm install -g wrangler

# Log in to Cloudflare
wrangler login

# Deploy
cd worker
npm install
npm run deploy
```

Wrangler will print your worker URL, e.g. `https://dispatch-proxy.YOUR_ACCOUNT.workers.dev`.
Copy that URL into:

- `.env` → `VITE_PROXY_URL=https://dispatch-proxy.YOUR_ACCOUNT.workers.dev`
- GitHub repo variable `VITE_PROXY_URL` (Settings → Secrets and variables → Variables)

No secrets need to be set on the worker — it reads the user's key from the `X-Api-Key` request header at runtime.

> **CI/CD**: pushing any file under `worker/` triggers [`.github/workflows/deploy-worker.yml`](.github/workflows/deploy-worker.yml), which redeploys the worker automatically. Add a `CF_API_TOKEN` secret (Cloudflare API token with *Workers Scripts: Edit* permission) in Settings → Secrets and variables → Actions → Secrets.

---

## Project Structure

```
src/
├── api/
│   ├── newsApi.js          # NewsAPI wrapper with 5-min cache
│   └── sportsApi.js        # TheSportsDB wrapper
├── components/
│   ├── cards/              # HeroMain, HeroSecondary, ColCard, ListCard, FeedCard, EditorialCard
│   ├── sports/             # ScoreCard, ScoresBand
│   ├── AdUnit.jsx          # Google AdSense wrapper
│   ├── ArticleModal.jsx
│   ├── Masthead.jsx        # Header + hamburger nav
│   ├── SectionHead.jsx
│   └── Ticker.jsx
├── context/
│   └── PersonalizationContext.jsx
├── hooks/
│   ├── useNews.js
│   └── useSports.js
├── pages/
│   ├── CategoryPage.jsx    # Sports tab gets a special rich layout
│   ├── HomePage.jsx
│   └── SearchPage.jsx      # Sports-aware: shows scores for sports queries
└── utils/
    ├── recommend.js        # TF-IDF + NLP personalisation engine
    └── time.js
```

---

## Enabling Google AdSense

The AdSense publisher ID (`ca-pub-4943024009014829`) is set directly in [`index.html`](index.html) and in `AdUnit.jsx` — no environment variable needed.

1. Replace the `slot` prop values on the `<AdUnit>` components in `HomePage.jsx` and `CategoryPage.jsx` with your real ad unit slot IDs from the AdSense dashboard.

---

## License

MIT — do whatever you like with it.
