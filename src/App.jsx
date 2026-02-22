import { useState, useCallback } from 'react';
import { PersonalizationProvider, usePersonalization } from './context/PersonalizationContext';
import { useNews } from './hooks/useNews';
import { hasApiKey, setStoredKey, clearStoredKey } from './api/newsApi';
import { NEWS_BASE } from './config.js';
import { Masthead } from './components/Masthead';
import { Ticker } from './components/Ticker';
import { ArticleModal } from './components/ArticleModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';

// ─── Inner app (needs PersonalizationContext) ─────────────────────────────────
function AppInner({ onClearKey }) {
    const [section, setSection] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [openArticle, setOpenArticle] = useState(null);
    const { trackRead } = usePersonalization();

    const { articles, loading, error } = useNews({
        section,
        query: searchQuery,
    });

    const handleNavigate = useCallback((key) => {
        setSection(key);
        setSearchQuery('');
        window.scrollTo(0, 0);
    }, []);

    const handleSearch = useCallback((q) => {
        setSection('search');
        setSearchQuery(q);
        window.scrollTo(0, 0);
    }, []);

    const handleOpen = useCallback((article) => {
        trackRead(article);
        setOpenArticle(article);
    }, [trackRead]);

    const handleClose = useCallback(() => setOpenArticle(null), []);

    function renderPage() {
        if (loading) return <div className="spinner">Fetching stories…</div>;
        if (error) return (
            <div className="error-box">
                <strong>Error:</strong> {error} — check your API key and try again.
            </div>
        );
        if (section === 'search') {
            return (
                <SearchPage query={searchQuery} articles={articles} onOpen={handleOpen} />
            );
        }
        if (section === 'home') {
            return <HomePage articles={articles} onOpen={handleOpen} />;
        }
        return (
            <CategoryPage section={section} articles={articles} onOpen={handleOpen} />
        );
    }

    return (
        <>
            <Masthead
                activeSection={section}
                onNavigate={handleNavigate}
                onSearch={handleSearch}
            />

            {!loading && !error && section === 'home' && (
                <Ticker articles={articles} />
            )}

            <div className="content-wrapper">{renderPage()}</div>

            <footer>
                <div className="f-logo">The Dispatch</div>
                <p>
                    Powered by NewsAPI · All articles © their respective publishers ·
                    Personalised based on your reading history
                </p>
                <p style={{ marginTop: 8 }}>
                    <button
                        onClick={onClearKey}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--mid)',
                            textDecoration: 'underline', padding: 0,
                        }}
                    >
                        Change API key
                    </button>
                </p>
            </footer>

            <ArticleModal article={openArticle} onClose={handleClose} />
        </>
    );
}

// ─── API key entry screen ──────────────────────────────────────────────────────
function ApiKeyScreen({ onSave }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [testing, setTesting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = key.trim();
        if (!trimmed) { setError('Please enter your API key.'); return; }
        // NewsAPI keys are 32 hex characters
        if (!/^[0-9a-f]{32}$/i.test(trimmed)) {
            setError('That doesn\'t look like a valid NewsAPI key (32-character hex string).');
            return;
        }

        // In dev (Vite proxy available) or prod with worker configured: do a live ping
        const canValidateLive = import.meta.env.DEV || Boolean(import.meta.env.VITE_PROXY_URL);
        if (canValidateLive) {
            setTesting(true);
            setError('');
            try {
                const res = await fetch(
                    `${NEWS_BASE}/top-headlines?language=en&pageSize=1`,
                    { headers: { 'X-Api-Key': trimmed } }
                );
                let data;
                try { data = await res.json(); } catch {
                    throw new Error('Unexpected response — proxy may not be reachable.');
                }
                if (data.status !== 'ok') throw new Error(data.message ?? 'Invalid key');
            } catch (err) {
                setError(err.message ?? 'Could not validate key — check it and try again.');
                setTesting(false);
                return;
            } finally {
                setTesting(false);
            }
        }

        setStoredKey(trimmed);
        onSave();
    }

    return (
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', fontFamily: 'var(--ui)' }}>
            <div style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 7vw, 64px)', fontWeight: 900, marginBottom: 32 }}>
                The Dispatch
            </div>

            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: 24 }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, color: 'var(--mid)' }}>
                    Enter your free{' '}
                    <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--red)', fontWeight: 700 }}>
                        NewsAPI key
                    </a>{' '}
                    to get started. Your key is stored only in your browser — it never leaves your device.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: 0, border: '1px solid var(--ink)', marginBottom: 12 }}>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Paste your NewsAPI key…"
                            style={{
                                flex: 1, border: 'none', padding: '10px 14px',
                                fontFamily: 'var(--ui)', fontSize: 13, outline: 'none',
                                color: 'var(--ink)', minWidth: 0,
                            }}
                            autoFocus
                            spellCheck={false}
                        />
                        <button
                            type="submit"
                            disabled={testing}
                            style={{
                                background: 'var(--ink)', color: 'var(--paper)', border: 'none',
                                padding: '10px 18px', cursor: testing ? 'wait' : 'pointer',
                                fontFamily: 'var(--ui)', fontSize: 12, fontWeight: 700,
                                letterSpacing: '0.06em', textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {testing ? 'Checking…' : 'Save key'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ border: '1px solid var(--red)', padding: '10px 14px', color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>
                            {error}
                        </div>
                    )}
                </form>

                <p style={{ fontSize: 11, color: 'var(--mid)', lineHeight: 1.6 }}>
                    Don't have a key?{' '}
                    <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--ink)' }}>
                        Register free at newsapi.org
                    </a>{' '}
                    — takes 30 seconds.
                </p>
            </div>
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
    const [ready, setReady] = useState(hasApiKey);

    function handleClearKey() {
        clearStoredKey();
        setReady(false);
    }

    if (!ready) return <ApiKeyScreen onSave={() => setReady(true)} />;
    return (
        <PersonalizationProvider>
            <AppInner onClearKey={handleClearKey} />
        </PersonalizationProvider>
    );
}
