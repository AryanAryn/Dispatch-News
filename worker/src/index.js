/**
 * Dispatch News – Cloudflare Worker CORS proxy for NewsAPI
 *
 * Users supply their own NewsAPI key via the app's key-entry screen.
 * The browser stores it in localStorage and sends it as an X-Api-Key header.
 * This Worker injects it as the `apiKey` query parameter on the upstream call
 * and attaches the CORS headers the browser requires.
 *
 * No secrets are stored on the Worker — none are needed.
 *
 * Receives:  GET https://<worker-url>/v2/<endpoint>?<params>
 * Forwards:  GET https://newsapi.org/v2/<endpoint>?<params>&apiKey=<user-key>
 *
 * Environment variables (set in wrangler.toml [vars]):
 *   ALLOWED_ORIGIN  –  restrict CORS to your frontend domain
 *                      e.g. https://news.aryanaryn.me
 *                      Use * to allow any origin (not recommended in production)
 */

const UPSTREAM = 'https://newsapi.org';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // ── CORS preflight ────────────────────────────────────────────────────
        if (request.method === 'OPTIONS') {
            return preflight(env);
        }

        // Health-check endpoint so you can confirm the worker is live
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok', worker: 'dispatch-proxy' }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
            });
        }

        // Only proxy /v2/* — reject everything else
        if (!url.pathname.startsWith('/v2/')) {
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
            });
        }

        // ── Read the user's NewsAPI key from the request header ───────────────
        const apiKey = request.headers.get('X-Api-Key') ?? '';
        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    status: 'error',
                    code: 'apiKeyMissing',
                    message: 'X-Api-Key header is required.',
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
                }
            );
        }

        // ── Build upstream URL ────────────────────────────────────────────────
        const upstream = new URL(UPSTREAM + url.pathname + url.search);
        upstream.searchParams.set('apiKey', apiKey);

        let upstreamRes;
        try {
            upstreamRes = await fetch(upstream.toString(), {
                headers: {
                    'User-Agent': 'DispatchNews-Proxy/1.0',
                    Accept: 'application/json',
                },
            });
        } catch (err) {
            return new Response(
                JSON.stringify({ error: 'Upstream fetch failed', detail: String(err) }),
                {
                    status: 502,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
                }
            );
        }

        // ── Forward response with CORS headers ────────────────────────────────
        const headers = new Headers(upstreamRes.headers);
        Object.entries(corsHeaders(env)).forEach(([k, v]) => headers.set(k, v));
        headers.set('Content-Type', 'application/json;charset=UTF-8');
        headers.delete('Set-Cookie');

        return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            headers,
        });
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function corsHeaders(env) {
    return {
        'Access-Control-Allow-Origin':  env.ALLOWED_ORIGIN ?? '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
        'Access-Control-Max-Age':       '86400',
    };
}

function preflight(env) {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(env),
    });
}
