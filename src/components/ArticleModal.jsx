import { useEffect, useRef } from 'react';
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
    const cardRef = useRef(null);

    // Focus modal card on open; close on Escape
    useEffect(() => {
        if (!isOpen) return;
        cardRef.current?.focus();
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

    // Keep Tab/Shift+Tab inside the modal
    function handleModalKeyDown(e) {
        if (e.key !== 'Tab') return;
        const focusable = cardRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    }

    function handleReadFull(e) {
        e.preventDefault();
        window.open(article.url, '_blank', 'noopener,noreferrer');
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`modal-overlay${isOpen ? ' open' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="modal-card" ref={cardRef} tabIndex="-1" onKeyDown={handleModalKeyDown}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                <div className="modal-kicker">
                    {article.source?.name}
                    {article.publishedAt && ` · ${fmtTime(article.publishedAt)}`}
                </div>

                <h2 className="modal-title" id="modal-title">{article.title}</h2>

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
