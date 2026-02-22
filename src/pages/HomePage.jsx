import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersonalization } from '../context/PersonalizationContext';
import { rankArticlesSemantic } from '../utils/recommend';
import { fetchEmbeddings } from '../api/newsApi';
import { useSports } from '../hooks/useSports';
import { SectionHead } from '../components/SectionHead';
import { ScoresBand } from '../components/sports/ScoresBand';
import { AdUnit } from '../components/AdUnit';
import { HeroMain } from '../components/cards/HeroMain';
import { HeroSecondary } from '../components/cards/HeroSecondary';
import { ColCard } from '../components/cards/ColCard';
import { ListCard } from '../components/cards/ListCard';
import { FeedCard } from '../components/cards/FeedCard';
import { EditorialCard } from '../components/cards/EditorialCard';

const SHOWN_KEY = 'dispatch_shown_feed';
const SHOWN_TTL = 6 * 60 * 60 * 1000; // 6 hours

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function HomePage({ articles, onOpen }) {
    const { history, interests, suppressedTerms } = usePersonalization();
    const navigate = useNavigate();
    const isPersonalized = history.length > 0;

    // Sports scores ≤1 day old for the home page sidebar band
    const { recent: sportsEvents } = useSports({ maxAgeDays: 1 });

    // ── Semantic vector cache (populated in background after articles load) ───────
    const [vectorCache, setVectorCache] = useState({});

    useEffect(() => {
        if (!articles.length || !isPersonalized) return;
        let cancelled = false;
        fetchEmbeddings(articles)
            .then(cache => { if (!cancelled) setVectorCache(cache); })
            .catch(() => { /* degrade silently to TF-IDF */ });
        return () => { cancelled = true; };
    }, [articles, isPersonalized]);

    // Read which article URLs were already featured on a previous visit (stable, read once)
    const [shownSet] = useState(() => {
        try {
            const cutoff = Date.now() - SHOWN_TTL;
            const raw = JSON.parse(localStorage.getItem(SHOWN_KEY) ?? '[]');
            return new Set(raw.filter(e => e.ts > cutoff).map(e => e.url));
        } catch { return new Set(); }
    });

    const ranked = useMemo(() => {
        if (!isPersonalized) return articles;
        const top = rankArticlesSemantic(articles, history, vectorCache, suppressedTerms);
        // Demote articles already shown in a recent visit so fresh ones surface
        const fresh = top.filter(a => !shownSet.has(a.url));
        const stale = top.filter(a => shownSet.has(a.url));
        const merged = [...fresh, ...stale];
        // Keep top-ranked locked for hero slots, shuffle the long tail for variety
        return [...merged.slice(0, 16), ...shuffle(merged.slice(16))];
    }, [articles, history, vectorCache, suppressedTerms, isPersonalized, shownSet]);

    // After rendering, persist the currently featured URLs so next visit shows new ones
    useEffect(() => {
        if (!ranked.length) return;
        try {
            const cutoff = Date.now() - SHOWN_TTL;
            const prev = JSON.parse(localStorage.getItem(SHOWN_KEY) ?? '[]')
                .filter(e => e.ts > cutoff);
            const newUrls = ranked.slice(0, 24).map(a => a.url);
            const merged = [
                ...prev.filter(e => !newUrls.includes(e.url)),
                ...newUrls.map(url => ({ url, ts: Date.now() })),
            ];
            localStorage.setItem(SHOWN_KEY, JSON.stringify(merged));
        } catch { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally run once on mount

    const withImg = ranked.filter((a) => a.urlToImage);
    const withoutImg = ranked.filter((a) => !a.urlToImage);
    const pool = [...withImg, ...withoutImg];

    const hero = pool[0];
    const sec = [pool[1], pool[2]].filter(Boolean);
    const cols = [pool[3], pool[4], pool[5]].filter(Boolean);
    const listItems = pool.slice(6, 14);
    const editorials = [pool[14], pool[15]].filter(Boolean);
    const sidebar = pool.slice(16, 22);
    const more = pool.slice(22, 34);

    return (
        <>
            <SectionHead
                label={isPersonalized ? 'Your feed' : 'Top stories'}
                note={isPersonalized ? 'Based on reading history' : undefined}
            />

            {/* Hero */}
            <div className="hero-grid">
                <HeroMain article={hero} onOpen={onOpen} />
                {sec.map((a) => (
                    <HeroSecondary key={a.url} article={a} onOpen={onOpen} />
                ))}
            </div>

            {/* Three-col */}
            {cols.length > 0 && (
                <div className="three-col">
                    {cols.map((a) => (
                        <ColCard key={a.url} article={a} onOpen={onOpen} />
                    ))}
                </div>
            )}

            {/* Sports scores – only events from the last 24 hours */}
            {sportsEvents.length > 0 && (
                <ScoresBand
                    events={sportsEvents}
                    title="Scores & Results"
                    note="Last 24 hours"
                />
            )}

            <SectionHead label="In depth" />

            {/* Main + sidebar */}
            <div className="main-sidebar">
                <div className="article-list">
                    {listItems.map((a) => (
                        <ListCard key={a.url} article={a} onOpen={onOpen} />
                    ))}
                </div>

                <aside className="sidebar">
                    {interests.length > 0 && (
                        <div className="pref-box">
                            <div className="pref-box-header">
                                <h3>Your interests</h3>
                                <button
                                    className="pref-manage-btn"
                                    onClick={() => navigate('/account')}
                                    aria-label="Manage your interests"
                                >
                                    Manage
                                </button>
                            </div>
                            <div className="pref-tags">
                                {interests.map((t) => (
                                    <span key={t} className="pref-tag">
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <div className="pref-note">Updated as you read</div>
                        </div>
                    )}

                    <div className="sidebar-section">
                        <div className="sidebar-title">Most read right now</div>
                        {sidebar.map((a, i) => (
                            <div
                                key={a.url}
                                className="sidebar-item"
                                onClick={() => onOpen(a)}
                            >
                                <div className="sid-num">0{i + 1}</div>
                                <div className="sid-title">{a.title}</div>
                                <div className="sid-source">{a.source?.name}</div>
                            </div>
                        ))}
                    </div>

                    {history.length > 0 && (
                        <div className="sidebar-section">
                            <div className="sidebar-title">Recently read</div>
                            {history.slice(0, 5).map((h, i) => (
                                <div key={i} className="sidebar-item history-item">
                                    <div className="sid-title">{h.title}</div>
                                    <div className="sid-source">{h.source}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </div>

            {/* Editorials */}
            {editorials.length > 0 && (
                <>
                    <SectionHead label="Analysis & opinion" />
                    <div className="editorial-band">
                        {editorials.map((a) => (
                            <EditorialCard key={a.url} article={a} onOpen={onOpen} />
                        ))}
                    </div>
                </>
            )}

            {/* More stories */}
            {more.length > 0 && (
                <>
                    <SectionHead label="More stories" />
                    {/* Ad placement – leaderboard between sections */}
                    <AdUnit slot="1234567890" format="horizontal" />
                    <div className="feed-grid">
                        {more.map((a) => (
                            <FeedCard key={a.url} article={a} onOpen={onOpen} />
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
