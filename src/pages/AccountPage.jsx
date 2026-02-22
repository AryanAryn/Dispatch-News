import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredKey, clearStoredKey } from '../api/newsApi';
import { usePersonalization } from '../context/PersonalizationContext';
import { topInterests } from '../utils/recommend';
import { Masthead } from '../components/Masthead';

export function AccountPage({ onClearKey }) {
    const navigate = useNavigate();
    const [revealed, setRevealed] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const storedKey = getStoredKey();
    const { history, suppressedTerms, suppressTerm, clearAllRecommendations } = usePersonalization();
    const activeInterests = useMemo(
        () => topInterests(history, suppressedTerms, 20),
        [history, suppressedTerms]
    );

    useEffect(() => { document.title = `Account — The Dispatch`; }, []);

    const maskedKey = storedKey
        ? storedKey.slice(0, 6) + '••••••••••••••••••••' + storedKey.slice(-4)
        : '';

    const handleNavigate = useCallback((slug) => {
        navigate(slug === 'home' ? '/' : `/${slug}`);
    }, [navigate]);

    const handleSearch = useCallback((q) => {
        navigate(`/search?q=${encodeURIComponent(q)}`);
    }, [navigate]);

    function handleChangeKey() {
        clearStoredKey();
        onClearKey();
        navigate('/auth', { replace: true });
    }

    return (
        <>
            <Masthead
                activeSlug="account"
                onNavigate={handleNavigate}
                onSearch={handleSearch}
            />

            <main className="content-wrapper">
                <div className="account-page">
                    <div className="account-header">
                        <div className="account-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="account-title">Your Account</h1>
                            <p className="account-subtitle">API key stored locally in your browser</p>
                        </div>
                    </div>

                    <section className="account-section">
                        <h2 className="account-section-title">NewsAPI key</h2>

                        <div className="account-key-row">
                            <code className="account-key-value">
                                {revealed ? storedKey : maskedKey}
                            </code>
                            <button
                                className="account-btn-ghost"
                                onClick={() => setRevealed(v => !v)}
                                title={revealed ? 'Hide key' : 'Reveal key'}
                            >
                                {revealed ? (
                                    // eye-off icon
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    // eye icon
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <p className="account-key-note">
                            Your key is never sent to our servers — it goes directly to the NewsAPI proxy in your browser.
                        </p>
                    </section>

                    <section className="account-section">
                        <h2 className="account-section-title">My interests</h2>

                        {activeInterests.length > 0 ? (
                            <>
                                <p className="account-key-note">
                                    {history.length} {history.length === 1 ? 'article' : 'articles'} read
                                    {' — tap × to remove a topic from your feed.'}
                                </p>
                                <ul className="interest-tags" aria-label="Your interest topics">
                                    {activeInterests.map((term) => (
                                        <li key={term} className="interest-tag">
                                            <span>{term}</span>
                                            <button
                                                className="interest-tag-remove"
                                                aria-label={`Remove ${term}`}
                                                onClick={() => suppressTerm(term)}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p className="account-key-note">
                                {history.length > 0
                                    ? 'All topics cleared — keep reading to rebuild your profile.'
                                    : 'No interests yet — start reading articles to personalise your feed.'}
                            </p>
                        )}

                        {(history.length > 0 || suppressedTerms.size > 0) && (
                            !showResetConfirm ? (
                                <button
                                    className="account-btn-danger"
                                    style={{ marginTop: '16px' }}
                                    onClick={() => setShowResetConfirm(true)}
                                >
                                    Reset all recommendations
                                </button>
                            ) : (
                                <div className="account-confirm" style={{ marginTop: '16px' }}>
                                    <p>This clears your reading history and all topic customisations. Your API key is not affected.</p>
                                    <div className="account-confirm-btns">
                                        <button
                                            className="account-btn-danger"
                                            onClick={() => { clearAllRecommendations(); setShowResetConfirm(false); }}
                                        >
                                            Yes, reset all
                                        </button>
                                        <button
                                            className="account-btn-ghost"
                                            onClick={() => setShowResetConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </section>

                    <section className="account-section">
                        <h2 className="account-section-title">Actions</h2>

                        {!showConfirm ? (
                            <button
                                className="account-btn-danger"
                                onClick={() => setShowConfirm(true)}
                            >
                                Change API key
                            </button>
                        ) : (
                            <div className="account-confirm">
                                <p>This will clear your saved key and take you to the key entry screen. Continue?</p>
                                <div className="account-confirm-btns">
                                    <button className="account-btn-danger" onClick={handleChangeKey}>
                                        Yes, clear key
                                    </button>
                                    <button className="account-btn-ghost" onClick={() => setShowConfirm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <button className="account-back" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>
            </main>
        </>
    );
}
