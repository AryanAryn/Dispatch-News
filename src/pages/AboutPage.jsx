import { useNavigate } from 'react-router-dom';
import { SITE_NAME, GITHUB_REPO, GITHUB_PROFILE, CONTACT_EMAIL } from '../config.js';
import { Masthead } from '../components/Masthead';

export function AboutPage() {
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
                    <h1 className="static-page-title">About</h1>

                    <section className="static-section">
                        <h2>What it is</h2>
                        <p>
                            {SITE_NAME} is an open-source news aggregator. It pulls headlines
                            from{' '}
                            <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">NewsAPI</a>{' '}
                            and live sports scores from{' '}
                            <a href="https://www.thesportsdb.com" target="_blank" rel="noopener noreferrer">TheSportsDB</a>,
                            then ranks your feed using an on-device TF-IDF recommendation engine
                            that adapts as you read.
                        </p>
                        <p>
                            No account required. Your API key and reading history are stored only
                            in your browser and never transmitted to any server we control.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>Features</h2>
                        <ul>
                            <li>Personalised feed — on-device TF-IDF + NLP interest profiling</li>
                            <li>Breaking-news ticker, hero layout, editorial band, full feed grid</li>
                            <li>Live sports scores and fixtures</li>
                            <li>Sports-aware search with match results alongside articles</li>
                            <li>In-app article preview with link to original source</li>
                            <li>Fully responsive, mobile-first</li>
                            <li>100% client-side — no backend, no database, no tracking</li>
                        </ul>
                    </section>

                    <section className="static-section">
                        <h2>Open source</h2>
                        <p>
                            Source code is publicly available on GitHub under the MIT License.
                            Contributions and forks are welcome.
                        </p>
                        <a className="static-link-btn" href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                            View on GitHub →
                        </a>
                    </section>

                    <section className="static-section">
                        <h2>Built by</h2>
                        <p>
                            Designed and built by{' '}
                            <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">Aryan</a>.
                            {' '}Questions?{' '}
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
