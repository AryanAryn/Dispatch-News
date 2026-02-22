import { CardMeta } from './CardMeta';

export function HeroSecondary({ article, onOpen }) {
    if (!article) return null;
    return (
        <article
            className="hero-secondary"
            tabIndex="0"
            aria-label={article.title}
            onClick={() => onOpen(article)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(article); } }}
        >
            {article.urlToImage && (
                <img
                    src={article.urlToImage}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            )}
            <CardMeta source={article.source?.name} time={article.publishedAt} />
            <h3 className="card-title">{article.title}</h3>
            {article.description && (
                <div className="card-desc">{article.description}</div>
            )}
        </article>
    );
}
