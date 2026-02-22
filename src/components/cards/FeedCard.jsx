import { CardMeta } from './CardMeta';

export function FeedCard({ article, onOpen }) {
    if (!article) return null;
    const letter = (article.source?.name ?? 'N')[0].toUpperCase();
    return (
        <article
            className="feed-card"
            tabIndex="0"
            aria-label={article.title}
            onClick={() => onOpen(article)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(article); } }}
        >
            {article.urlToImage ? (
                <img
                    src={article.urlToImage}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                        e.target.replaceWith(
                            Object.assign(document.createElement('div'), {
                                className: 'no-img-placeholder',
                                innerHTML: `<span>${letter}</span>`,
                            })
                        );
                    }}
                />
            ) : (
                <div className="no-img-placeholder">
                    <span>{letter}</span>
                </div>
            )}
            <CardMeta source={article.source?.name} time={article.publishedAt} />
            <h3 className="card-title">{article.title}</h3>
            {article.description && (
                <div className="card-desc">{article.description}</div>
            )}
        </article>
    );
}
