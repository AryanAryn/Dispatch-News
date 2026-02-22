import { useState } from 'react';
import { todayLabel } from '../utils/time';

const SECTIONS = [
    { key: 'home', label: 'Home' },
    { key: 'general', label: 'World' },
    { key: 'business', label: 'Business' },
    { key: 'technology', label: 'Technology' },
    { key: 'science', label: 'Science' },
    { key: 'health', label: 'Health' },
    { key: 'sports', label: 'Sports' },
    { key: 'entertainment', label: 'Culture' },
];

export function Masthead({ activeSection, onNavigate, onSearch }) {
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    function handleSearch(e) {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setMenuOpen(false);
        }
    }

    function handleNavigate(key) {
        onNavigate(key);
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
            </div>

            <div className="logo-block">
                <div className="logo-title">The Dispatch</div>
            </div>

            <nav className={menuOpen ? 'open' : undefined}>
                {SECTIONS.map((s) => (
                    <button
                        key={s.key}
                        className={activeSection === s.key ? 'active' : undefined}
                        onClick={() => handleNavigate(s.key)}
                    >
                        {s.label}
                    </button>
                ))}
            </nav>
        </header>
    );
}

