import { useNavigate } from 'react-router-dom';
import { SITE_NAME, GITHUB_REPO, GITHUB_PROFILE, CONTACT_EMAIL } from '../config.js';
import { Masthead } from '../components/Masthead';

export function ContactPage() {
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
                    <h1 className="static-page-title">Contact</h1>

                    <section className="static-section">
                        <h2>Email</h2>
                        <p>
                            <a href={`mailto:${CONTACT_EMAIL}`} className="static-contact-link">
                                {CONTACT_EMAIL}
                            </a>
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>GitHub</h2>
                        <p>
                            <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer" className="static-contact-link">
                                {GITHUB_PROFILE}
                            </a>
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>Bug reports &amp; feature requests</h2>
                        <p>
                            Use the{' '}
                            <a href={`${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer">
                                GitHub Issues tracker
                            </a>{' '}
                            so conversations stay public and searchable.
                        </p>
                        <a
                            className="static-link-btn"
                            href={`${GITHUB_REPO}/issues`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open an issue →
                        </a>
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
