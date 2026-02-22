export function Ticker({ articles }) {
    if (!articles.length) return null;

    const items = articles.slice(0, 10);

    // Doubled for a seamless loop
    const renderItems = (keySuffix) =>
        items.map((a, i) => (
            <span key={`${keySuffix}-${i}`} className="ticker-item">
                <span className="ticker-sep" aria-hidden="true">◆</span>
                {a.title}
            </span>
        ));

    return (
        <div className="ticker-bar">
            <div className="ticker-label">Breaking</div>
            <div className="ticker-track">
                <div className="ticker-inner">
                    {renderItems('a')}
                    {renderItems('b')}
                </div>
            </div>
        </div>
    );
}
