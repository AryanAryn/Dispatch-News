import { useMemo } from 'react';
import { usePersonalization } from '../context/PersonalizationContext';
import { rankArticles, topInterests } from '../utils/recommend';
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

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function HomePage({ articles, onOpen }) {
    const { history, interests } = usePersonalization();
    const isPersonalized = history.length > 0;

    // Sports scores ≤1 day old for the home page sidebar band
    const { recent: sportsEvents } = useSports({ maxAgeDays: 1 });

    const ranked = useMemo(() => {
        if (!isPersonalized) return articles;
        const top = rankArticles(articles, history);
        // Keep top-ranked locked for hero slots, shuffle the long tail for variety
        return [...top.slice(0, 16), ...shuffle(top.slice(16))];
    }, [articles, history, isPersonalized]);

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
                            <h3>Your interests</h3>
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
