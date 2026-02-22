import { useEffect } from 'react';
import { fmtTime } from '../utils/time';

// Safely extract plain text from a NewsAPI content/description field.
// NewsAPI sometimes embeds HTML fragments (<ul><li>…</li></ul>, <p>, etc.).
function stripHtml(raw) {
    if (!raw) return '';
    try {
        const doc = new DOMParser().parseFromString(raw, 'text/html');
        return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
    } catch {
        return raw.replace(/<[^>]*>/g, '').trim();
    }
}

export function ArticleModal({ article, onClose }) {
    const isOpen = Boolean(article);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!article) return null;

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) onClose();
    }

    function handleReadFull(e) {
        e.preventDefault();
        window.open(article.url, '_blank', 'noopener,noreferrer');
    }

    return (
        <div
            className={`modal-overlay${isOpen ? ' open' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="modal-card">
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                <div className="modal-kicker">
                    {article.source?.name}
                    {article.publishedAt && ` · ${fmtTime(article.publishedAt)}`}
                </div>

                <div className="modal-title">{article.title}</div>

                <div className="modal-byline">
                    {article.author ? `By ${article.author}` : 'Staff reporter'}
                </div>

                {article.urlToImage && (
                    <img
                        className="modal-img"
                        src={article.urlToImage}
                        alt=""
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}

                <div className="modal-body">
                    {article.description && <p>{stripHtml(article.description)}</p>}
                    {article.content && (() => {
                        const cleaned = stripHtml(
                            article.content.replace(/\[\+\d+\s*chars\].*$/s, '')
                        );
                        return cleaned ? <p>{cleaned}</p> : null;
                    })()}
                    <p className="modal-excerpt-note">
                        This is an excerpt. Read the full story at the source.
                    </p>
                </div>

                <a
                    className="modal-link"
                    href={article.url}
                    onClick={handleReadFull}
                    rel="noopener noreferrer"
                >
                    Read full story ↗
                </a>
            </div>
        </div>
    );
}
