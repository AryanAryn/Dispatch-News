import { CardMeta } from './CardMeta';

export function ListCard({ article, onOpen }) {
    if (!article) return null;
    return (
        <article
            className="list-card"
            style={!article.urlToImage ? { gridTemplateColumns: '1fr' } : undefined}
            tabIndex="0"
            aria-label={article.title}
            onClick={() => onOpen(article)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(article); } }}
        >
            <div>
                <CardMeta source={article.source?.name} time={article.publishedAt} />
                <h3 className="card-title">{article.title}</h3>
                {article.description && (
                    <div className="card-desc">{article.description}</div>
                )}
            </div>
            {article.urlToImage && (
                <img
                    src={article.urlToImage}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                        e.target.parentElement.style.gridTemplateColumns = '1fr';
                        e.target.style.display = 'none';
                    }}
                />
            )}
        </article>
    );
}
