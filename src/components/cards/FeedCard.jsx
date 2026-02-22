import { CardMeta } from './CardMeta';

export function FeedCard({ article, onOpen }) {
    if (!article) return null;
    const letter = (article.source?.name ?? 'N')[0].toUpperCase();
    return (
        <div className="feed-card" onClick={() => onOpen(article)}>
            {article.urlToImage ? (
                <img
                    src={article.urlToImage}
                    alt=""
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
            <div className="card-title">{article.title}</div>
            {article.description && (
                <div className="card-desc">{article.description}</div>
            )}
        </div>
    );
}
