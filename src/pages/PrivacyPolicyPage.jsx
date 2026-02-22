import { useNavigate } from 'react-router-dom';
import { SITE_NAME, CONTACT_EMAIL } from '../config.js';
import { Masthead } from '../components/Masthead';

export function PrivacyPolicyPage() {
    const navigate = useNavigate();
    return (
        <>
            <Masthead
                activeSlug=""
                onNavigate={(slug) => navigate(slug === 'home' ? '/' : `/${slug}`)}
                onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
            />

            <div className="content-wrapper">
                <div className="static-page">
                    <h1 className="static-page-title">Privacy Policy</h1>
                    <p className="static-page-meta">Effective February 22, 2026</p>

                    <section className="static-section">
                        <h2>§ 1 — Overview</h2>
                        <p>
                            {SITE_NAME} (“we”, “the app”) is a fully client-side web application.
                            We operate no servers that receive, process, or store your personal data.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 2 — Data stored in your browser</h2>
                        <p>The following data is saved exclusively in your browser’s <code>localStorage</code> and never transmitted to any server we control:</p>
                        <ul>
                            <li><strong>NewsAPI key</strong> — sent directly from your browser to NewsAPI; does not pass through any server we control.</li>
                            <li><strong>Reading history</strong> — article titles and timestamps used on-device to personalise your feed.</li>
                            <li><strong>Shown-feed log</strong> — recently displayed article URLs used to surface fresh content.</li>
                        </ul>
                        <p>
                            You may delete all stored data from the <strong>Account</strong> page
                            or by clearing your browser’s site data.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 3 — Third-party services</h2>
                        <ul>
                            <li><strong>NewsAPI</strong> — queries are routed through a Cloudflare Worker CORS proxy that forwards requests transparently and does not log API keys. See <a href="https://newsapi.org/privacy" target="_blank" rel="noopener noreferrer">NewsAPI’s Privacy Policy</a>.</li>
                            <li><strong>TheSportsDB</strong> — sports data fetched directly; no personal data is transmitted.</li>
                            <li><strong>Google AdSense</strong> — may set advertising cookies per <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s Privacy Policy</a>.</li>
                            <li><strong>Google Fonts</strong> — served from Google CDN; Google may log IP addresses per standard CDN operation.</li>
                        </ul>
                    </section>

                    <section className="static-section">
                        <h2>§ 4 — Cookies</h2>
                        <p>
                            We set no cookies. Google AdSense may set advertising cookies
                            in accordance with its own policies.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 5 — Children’s privacy</h2>
                        <p>
                            This service is not directed at children under 13.
                            We do not knowingly collect data from children.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 6 — Changes</h2>
                        <p>
                            We may update this policy at any time.
                            The effective date above will reflect any revision.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 7 — Contact</h2>
                        <p>
                            Questions regarding this policy:{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        </p>
                    </section>
                </div>
            </div>

            <footer>
                <div className="f-logo">{SITE_NAME}</div>
                <p>Powered by NewsAPI · All articles © their respective publishers</p>
                <nav className="footer-nav">
                    <a href="#/about">About</a>
                    <a href="#/contact">Contact</a>
                    <a href="#/privacy">Privacy policy</a>
                    <a href="#/terms">Terms of service</a>
                </nav>
            </footer>
        </>
    );
}
