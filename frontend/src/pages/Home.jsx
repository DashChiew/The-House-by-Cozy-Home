import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../context/LanguageContext';
import './Home.css';

function PropertyCard({ prop, t, lang }) {
  const name = lang === 'zh' ? prop.name_zh : prop.name_en;
  const availCount = prop.available_units_count ?? 0;
  const totalCount = prop.total_units_count ?? 0;

  return (
    <Link to={`/property/${prop.id}`} className="prop-card" id={`property-card-${prop.id}`}>
      <div className="prop-card__img-wrap">
        {prop.cover_photo ? (
          <img src={prop.cover_photo} alt={name} className="prop-card__img" />
        ) : (
          <div className="prop-card__img-placeholder">
            <span>🏠</span>
          </div>
        )}
        <div className="prop-card__availability-badge">
          <span className={availCount > 0 ? 'badge badge-available' : 'badge badge-unavailable'}>
            {availCount > 0 ? `${availCount} ${t.units_available}` : t.not_available}
          </span>
        </div>
      </div>
      <div className="prop-card__body">
        <h3 className="prop-card__name">{name}</h3>
        <p className="prop-card__address">📍 {prop.address}</p>
        <div className="prop-card__stats">
          <span className="prop-card__stat">
            <strong>{availCount}</strong> / {totalCount} {t.total_units}
          </span>
        </div>
        <div className="prop-card__cta">
          <span className="btn btn-primary btn-sm">{t.view_details} →</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { t, lang } = useLang();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/properties')
      .then(r => { setProperties(r.data); setLoading(false); })
      .catch(() => { setError(t.error_load); setLoading(false); });
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero" id="hero-section">
        <div className="hero__bg-circles">
          <div className="hero__circle hero__circle--1" />
          <div className="hero__circle hero__circle--2" />
          <div className="hero__circle hero__circle--3" />
        </div>
        <div className="container hero__content">
          <span className="section-label hero__tag animate-fade-in-up">{t.hero_tag}</span>
          <h1 className="hero__title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t.hero_title} <span className="hero__title-accent">{t.hero_title_2}</span>
          </h1>
          <p className="hero__subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t.hero_subtitle}
          </p>
          <div className="hero__actions animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <a href="#properties" className="btn btn-primary btn-lg" id="hero-explore-btn">
              {t.hero_cta}
            </a>
          </div>
        </div>
        <div className="hero__scroll-indicator">
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* Properties Grid */}
      <section className="properties-section" id="properties">
        <div className="container">
          <div className="properties-header">
            <span className="section-label">{t.browse_title}</span>
            <h2 className="section-title properties-title">{t.browse_title}</h2>
            <p className="section-subtitle">{t.browse_subtitle}</p>
          </div>

          {loading && (
            <div className="loading-center">
              <div className="spinner" />
              <p>{t.loading}</p>
            </div>
          )}
          {error && <p className="error-msg">{error}</p>}
          {!loading && !error && properties.length === 0 && (
            <p className="no-data-msg">{t.no_properties}</p>
          )}
          {!loading && !error && properties.length > 0 && (
            <div className="properties-grid" id="properties-grid">
              {properties.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 0.1}s` }} className="animate-fade-in-up">
                  <PropertyCard prop={p} t={t} lang={lang} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <span className="footer__icon">🏠</span>
            <div>
              <div className="footer__name">{t.brand}</div>
              <div className="footer__sub">{t.brand_sub}</div>
            </div>
          </div>
          <div className="footer__copy">© {new Date().getFullYear()} {t.brand}. {t.footer_rights}</div>
        </div>
      </footer>
    </div>
  );
}
