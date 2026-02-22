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

### 2. Add your API keys

Create a `.env` file in the project root (copy from `.env.example` if present):

```env
VITE_NEWSAPI_KEY=your_newsapi_key_here
VITE_SPORTSDB_KEY=3                          # free public key; upgrade for live scores
VITE_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXXXXXXX # optional
```

Get a free NewsAPI key at [newsapi.org/register](https://newsapi.org/register).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/newsapi` and `/sportsdb` automatically, so you won't hit any CORS issues.

### 4. Production build

```bash
npm run build
npm run preview   # serve the dist/ folder locally
```

---

## Deploying to GitHub Pages

The repo includes a ready-made workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. **Enable Pages** in your repo: Settings → Pages → Source → **GitHub Actions**
2. **Add secrets** in Settings → Secrets and variables → Actions:

   | Secret | Value |
   |---|---|
   | `VITE_NEWSAPI_KEY` | your NewsAPI key |
   | `VITE_SPORTSDB_KEY` | `3` or a paid key |
   | `VITE_ADSENSE_PUB_ID` | your AdSense publisher ID |

3. Push to `main` — the workflow builds and deploys automatically.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

> **NewsAPI CORS note:** The free NewsAPI plan blocks browser requests from non-`localhost` origins. For a fully public deployment you'll need a lightweight serverless proxy (Cloudflare Worker, Vercel function, etc.) in front of the NewsAPI calls. TheSportsDB's public endpoint is CORS-open and works fine without a proxy.

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

1. Uncomment the `<script>` tag in [`index.html`](index.html) and replace the placeholder publisher ID.
2. Set `VITE_ADSENSE_PUB_ID` in `.env` (and as a GitHub secret for deployments).
3. Replace the `slot` prop values on the `<AdUnit>` components in `HomePage.jsx` and `CategoryPage.jsx` with your real ad unit slot IDs.

---

## License

MIT — do whatever you like with it.
