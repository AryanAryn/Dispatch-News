import { useState, useCallback } from 'react';
import {
    HashRouter, Routes, Route,
    Navigate, useNavigate, useLocation, useSearchParams,
} from 'react-router-dom';
import { PersonalizationProvider, usePersonalization } from './context/PersonalizationContext';
import { useNews } from './hooks/useNews';
import { hasApiKey, clearStoredKey } from './api/newsApi';
import { NAV_SECTIONS, SITE_NAME } from './config.js';
import { Masthead } from './components/Masthead';
import { Ticker } from './components/Ticker';
import { ArticleModal } from './components/ArticleModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';

// ─── Auth guard ───────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
    return hasApiKey() ? children : <Navigate to="/auth" replace />;
}

// ─── Inner app — reads route, renders the right page ─────────────────────────
function AppInner({ onClearKey }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { trackRead } = usePersonalization();
    const [openArticle, setOpenArticle] = useState(null);

    const rawSlug = location.pathname.replace(/^\//, '') || 'home';
    const isSearch = rawSlug === 'search';
    const navEntry = NAV_SECTIONS.find(s => s.slug === rawSlug);
    const apiSection = isSearch ? 'search' : (navEntry?.apiKey ?? 'home');
    const activeSlug = isSearch ? 'search' : (navEntry?.slug ?? 'home');
    const searchQuery = isSearch ? (searchParams.get('q') ?? '') : '';

    const { articles, loading, error } = useNews({ section: apiSection, query: searchQuery });

    const handleNavigate = useCallback((slug) => {
        navigate(slug === 'home' ? '/' : `/${slug}`);
        window.scrollTo(0, 0);
    }, [navigate]);

    const handleSearch = useCallback((q) => {
        navigate(`/search?q=${encodeURIComponent(q)}`);
        window.scrollTo(0, 0);
    }, [navigate]);

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
        if (isSearch) return <SearchPage query={searchQuery} articles={articles} onOpen={handleOpen} />;
        if (activeSlug === 'home') return <HomePage articles={articles} onOpen={handleOpen} />;
        return <CategoryPage section={apiSection} articles={articles} onOpen={handleOpen} />;
    }

    return (
        <>
            <Masthead
                activeSlug={activeSlug}
                onNavigate={handleNavigate}
                onSearch={handleSearch}
            />

            {!loading && !error && activeSlug === 'home' && (
                <Ticker articles={articles} />
            )}

            <div className="content-wrapper">{renderPage()}</div>

            <footer>
                <div className="f-logo">{SITE_NAME}</div>
                <p>Powered by NewsAPI · All articles © their respective publishers</p>
                <nav className="footer-nav">
                    <a href="#/about">About</a>
                    <a href="#/contact">Contact</a>
                    <a href="#/privacy">Privacy policy</a>
                    <a href="#/terms">Terms of service</a>
                </nav>
            </footer>

            <ArticleModal article={openArticle} onClose={handleClose} />
        </>
    );
}

// ─── Authenticated shell — provides PersonalizationContext + sub-routes ────────
function AuthedApp({ onClearKey }) {
    return (
        <PersonalizationProvider>
            <Routes>
                <Route path="/account" element={<AccountPage onClearKey={onClearKey} />} />
                <Route path="/*" element={<AppInner onClearKey={onClearKey} />} />
            </Routes>
        </PersonalizationProvider>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
    const [authed, setAuthed] = useState(hasApiKey);

    function handleClearKey() {
        clearStoredKey();
        setAuthed(false);
    }

    return (
        <HashRouter>
            <Routes>
                <Route
                    path="/auth"
                    element={
                        authed
                            ? <Navigate to="/" replace />
                            : <AuthPage onSave={() => setAuthed(true)} />
                    }
                />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route
                    path="/*"
                    element={
                        <RequireAuth>
                            <AuthedApp onClearKey={handleClearKey} />
                        </RequireAuth>
                    }
                />
            </Routes>
        </HashRouter>
    );
}

