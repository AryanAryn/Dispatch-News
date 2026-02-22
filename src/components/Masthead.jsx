import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { todayLabel } from '../utils/time';
import { NAV_SECTIONS } from '../config.js';

export function Masthead({ activeSlug, onNavigate, onSearch }) {
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    function handleSearch(e) {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setMenuOpen(false);
        }
    }

    function handleNavigate(slug) {
        onNavigate(slug);
        setMenuOpen(false);
    }

    return (
        <header id="masthead">
            <div className="top-bar">
                {/* Hamburger – visible only on mobile */}
                <button
                    className="hamburger-btn"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>

                <div className="date-edition">
                    <span>{todayLabel()}</span>
                    <span className="edition-badge">Digital edition</span>
                </div>

                <div className="top-bar-right">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search stories…"
                            aria-label="Search"
                        />
                        <button type="submit" aria-label="Submit search">⌕</button>
                    </form>

                    {/* User / account icon */}
                    <button
                        className="user-icon-btn"
                        aria-label="Account"
                        title="Account"
                        onClick={() => navigate('/account')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="logo-block">
                <div className="logo-title">The Dispatch</div>
            </div>

            <nav aria-label="Main navigation" className={menuOpen ? 'open' : undefined}>
                {NAV_SECTIONS.map((s) => (
                    <button
                        key={s.slug}
                        className={activeSlug === s.slug ? 'active' : undefined}
                        aria-current={activeSlug === s.slug ? 'page' : undefined}
                        onClick={() => handleNavigate(s.slug)}
                    >
                        {s.label}
                    </button>
                ))}
            </nav>
        </header>
    );
}

