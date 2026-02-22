import { SectionHead } from '../components/SectionHead';
import { HeroMain } from '../components/cards/HeroMain';
import { HeroSecondary } from '../components/cards/HeroSecondary';
import { FeedCard } from '../components/cards/FeedCard';
import { ListCard } from '../components/cards/ListCard';
import { ScoresBand } from '../components/sports/ScoresBand';
import { AdUnit } from '../components/AdUnit';
import { useSports } from '../hooks/useSports';

const LABELS = {
    general: 'World',
    business: 'Business',
    technology: 'Technology',
    science: 'Science',
    health: 'Health',
    sports: 'Sports',
    entertainment: 'Culture',
};

export function CategoryPage({ section, articles, onOpen }) {
    const label = LABELS[section] ?? section;
    const isSports = section === 'sports';

    // Fetch sports data: on sports tab allow up to 7 days; otherwise skip
    const { recent: recentEvents, upcoming } = useSports({
        maxAgeDays: isSports ? 7 : 1,
        includeNext: isSports,
    });

    const hero = articles[0];
    const sec = articles[1];
    const rest = articles.slice(2);

    if (isSports) {
        return (
            <>
                <SectionHead label="Sports" />

                {/* Live scores / recent results */}
                {recentEvents.length > 0 && (
                    <ScoresBand
                        events={recentEvents}
                        title="Recent Results"
                        note="Last 7 days"
                    />
                )}

                {/* Upcoming fixtures */}
                {upcoming.length > 0 && (
                    <ScoresBand
                        events={upcoming}
                        title="Upcoming Fixtures"
                        note="Next matches"
                    />
                )}

                <AdUnit slot="9876543210" format="horizontal" />

                {/* Sports news */}
                <div className="sports-layout">
                    <div className="sports-feed">
                        <SectionHead label="Sports news" />
                        {(hero || sec) && (
                            <div className="hero-grid">
                                <HeroMain article={hero} onOpen={onOpen} />
                                {sec && <HeroSecondary article={sec} onOpen={onOpen} />}
                            </div>
                        )}
                        <div className="article-list" style={{ marginTop: 4 }}>
                            {rest.slice(0, 10).map((a) => (
                                <ListCard key={a.url} article={a} onOpen={onOpen} />
                            ))}
                        </div>
                    </div>

                    <aside className="sports-sidebar">
                        <div className="sidebar-section">
                            <div className="sidebar-title">More sports</div>
                            {rest.slice(10).map((a, i) => (
                                <div
                                    key={a.url}
                                    className="sidebar-item"
                                    onClick={() => onOpen(a)}
                                >
                                    <div className="sid-num">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div className="sid-title">{a.title}</div>
                                    <div className="sid-source">{a.source?.name}</div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </>
        );
    }

    return (
        <>
            <SectionHead label={label} />
            {(hero || sec) && (
                <div className="hero-grid">
                    <HeroMain article={hero} onOpen={onOpen} />
                    {sec && <HeroSecondary article={sec} onOpen={onOpen} />}
                </div>
            )}
            {rest.length > 0 && (
                <>
                    <SectionHead label={`More in ${label.toLowerCase()}`} />
                    <AdUnit slot="1122334455" format="auto" />
                    <div className="feed-grid">
                        {rest.map((a) => (
                            <FeedCard key={a.url} article={a} onOpen={onOpen} />
                        ))}
                    </div>
                </>
            )}
        </>
    );
}

