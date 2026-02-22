import { useState, useCallback } from 'react';
import { PersonalizationProvider, usePersonalization } from './context/PersonalizationContext';
import { useNews } from './hooks/useNews';
import { hasApiKey } from './api/newsApi';
import { Masthead } from './components/Masthead';
import { Ticker } from './components/Ticker';
import { ArticleModal } from './components/ArticleModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';

// ─── Inner app (needs PersonalizationContext) ─────────────────────────────────
function AppInner() {
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
            </footer>

            <ArticleModal article={openArticle} onClose={handleClose} />
        </>
    );
}

// ─── No API key screen ─────────────────────────────────────────────────────────
function NoKeyScreen() {
    return (
        <div
            style={{
                maxWidth: 480,
                margin: '80px auto',
                padding: '0 24px',
                textAlign: 'center',
                fontFamily: 'var(--ui)',
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 'clamp(36px, 7vw, 64px)',
                    fontWeight: 900,
                    marginBottom: 32,
                }}
            >
                The Dispatch
            </div>
            <div
                style={{
                    border: '1px solid var(--red)',
                    padding: '20px 24px',
                    color: 'var(--red)',
                    fontSize: 13,
                    marginBottom: 20,
                    textAlign: 'left',
                }}
            >
                <strong>API key not configured.</strong>
                <br />
                Add your{' '}
                <a
                    href="https://newsapi.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--red)' }}
                >
                    NewsAPI
                </a>{' '}
                key to the <code>.env</code> file:
                <pre
                    style={{
                        marginTop: 12,
                        background: '#f5f3ee',
                        padding: '10px 14px',
                        fontSize: 12,
                        overflowX: 'auto',
                    }}
                >
                    VITE_NEWSAPI_KEY=your_key_here
                </pre>
                Then restart the dev server with <code>npm run dev</code>.
            </div>
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
    if (!hasApiKey()) return <NoKeyScreen />;
    return (
        <PersonalizationProvider>
            <AppInner />
        </PersonalizationProvider>
    );
}
