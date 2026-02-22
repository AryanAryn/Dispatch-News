# dispatch-proxy

Cloudflare Worker that acts as a CORS proxy for [NewsAPI](https://newsapi.org), used by the [Dispatch News](https://news.aryanaryn.me) app.

## Why this exists

NewsAPI blocks direct browser requests from non-`localhost` origins on the free plan. This Worker sits between the browser and NewsAPI, adding the required CORS headers. No API key is stored on the server — users supply their own key from the browser, and it is forwarded in the `apiKey` query parameter to NewsAPI.

---

## How it works

```
Browser  ──X-Api-Key header──▶  Worker  ──?apiKey=<key>──▶  newsapi.org
         ◀────────────────────────────────────────────────
                   (with CORS headers added)
```

- `GET /v2/<endpoint>?<params>` — proxied to `https://newsapi.org/v2/<endpoint>?<params>&apiKey=<key>`
- `GET /health` — returns `{"status":"ok"}` so you can confirm the worker is live
- Any other path → `404`

---

## Setup

### 1. Clone this repo

```bash
git clone https://github.com/<you>/dispatch-proxy.git
cd dispatch-proxy
npm install
```

### 2. Update `wrangler.toml`

Set `ALLOWED_ORIGIN` to your frontend domain:

```toml
[vars]
ALLOWED_ORIGIN = "https://your-frontend-domain.com"
```

Use `"*"` during development if needed, but lock it before going to production.

### 3. Deploy manually (first time)

```bash
# Install Wrangler globally if you haven't already
npm install -g wrangler

# Log in to your Cloudflare account
wrangler login

# Deploy
npm run deploy
```

Wrangler will print your worker URL:
```
https://dispatch-proxy.<YOUR_ACCOUNT>.workers.dev
```

Copy this URL — you need it in the Dispatch News app's `.env` as `VITE_PROXY_URL`.

### 4. Test it

```bash
curl https://dispatch-proxy.<YOUR_ACCOUNT>.workers.dev/health
# {"status":"ok","worker":"dispatch-proxy"}

curl -H "X-Api-Key: YOUR_NEWSAPI_KEY" \
  "https://dispatch-proxy.<YOUR_ACCOUNT>.workers.dev/v2/top-headlines?language=en&pageSize=1"
```

---

## GitHub Actions auto-deploy

Every push to `main` automatically deploys the worker via GitHub Actions.

### Add the required secret

1. Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**
2. Add:

   | Secret | Value |
   |---|---|
   | `CF_API_TOKEN` | A Cloudflare API token with **Workers Scripts: Edit** permission |

### Create the API token in Cloudflare

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **My Profile → API Tokens → Create Token**
2. Use the **Edit Cloudflare Workers** template
3. Copy the token and paste it as the `CF_API_TOKEN` secret above

Once set, push any change to `main` and the workflow deploys automatically.

---

## Local development

```bash
npm run dev
```

Starts a local worker at `http://localhost:8787`. Update the Dispatch News app's Vite proxy to point at this for local testing (or use the existing `/newsapi` proxy which bypasses this worker entirely in dev mode).

---

## Environment variables

Configured in `wrangler.toml` — not secrets, so safe to commit:

| Variable | Description |
|---|---|
| `ALLOWED_ORIGIN` | CORS origin whitelist. Set to your frontend URL in production. |

No worker secrets are needed.
