import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../context/LanguageContext';
import PhotoGallery from '../components/PhotoGallery';
import ContactBar from '../components/ContactBar';
import './PropertyDetail.css';

function GenderBadge({ type, t }) {
  const map = { female: ['badge-female', t.gender_female], male: ['badge-male', t.gender_male], mixed: ['badge-mixed', t.gender_mixed] };
  const [cls, label] = map[type] || map.mixed;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function StayBadge({ type, t }) {
  const map = { short: ['badge-short', t.stay_short], long: ['badge-long', t.stay_long], both: ['badge-both', t.stay_both] };
  const [cls, label] = map[type] || map.both;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function UnitCard({ unit, t, lang }) {
  const availCount = unit.available_rooms_count ?? 0;

  return (
    <Link to={`/unit/${unit.id}`} className="unit-card" id={`unit-card-${unit.id}`}>
      <div className="unit-card__header">
        <div className="unit-card__name">{unit.unit_name}</div>
        <span className={`badge ${unit.is_available ? 'badge-available' : 'badge-unavailable'}`}>
          {unit.is_available ? '✓ ' + t.units_available.replace('{n}', '') : t.not_available}
        </span>
      </div>
      <div className="unit-card__badges">
        <GenderBadge type={unit.gender_type} t={t} />
        <StayBadge type={unit.stay_type} t={t} />
      </div>
      {unit.available_from && (
        <div className="unit-card__avail-date">
          📅 {t.available_from}: {new Date(unit.available_from).toLocaleDateString()}
        </div>
      )}
      <div className="unit-card__rooms">
        <span className="unit-card__rooms-count">
          <strong>{availCount}</strong> {t.available_rooms}
        </span>
      </div>
      <div className="unit-card__desc">
        {lang === 'zh' ? unit.description_zh : unit.description_en}
      </div>
      <div className="unit-card__cta">
        <span className="btn btn-primary btn-sm">{t.view_unit} →</span>
      </div>
    </Link>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/properties/${id}`)
      .then(r => { setProperty(r.data); setLoading(false); })
      .catch(() => { setError(t.error_load); setLoading(false); });
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /><p>{t.loading}</p></div>;
  if (error || !property) return <div className="loading-center"><p className="error-msg">{error}</p></div>;

  const name = lang === 'zh' ? property.name_zh : property.name_en;
  const desc = lang === 'zh' ? property.description_zh : property.description_en;

  return (
    <div className="property-detail animate-fade-in">
      <div className="container">
        {/* Back */}
        <Link to="/" className="back-link" id="back-to-home-btn">← {t.back_home}</Link>

        {/* Gallery + Info */}
        <div className="property-detail__grid">
          <div className="property-detail__gallery">
            <PhotoGallery photos={property.photos || []} />
          </div>
          <div className="property-detail__info">
            <div className="property-detail__meta">
              <span className="section-label">{t.nav_properties}</span>
            </div>
            <h1 className="property-detail__name">{name}</h1>
            <p className="property-detail__address">📍 {property.address}</p>
            <p className="property-detail__desc">{desc}</p>

            <div className="property-detail__stats">
              <div className="stat-card">
                <span className="stat-card__value">{property.available_units_count}</span>
                <span className="stat-card__label">{t.units_available}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__value">{property.total_units_count}</span>
                <span className="stat-card__label">{t.total_units}</span>
              </div>
            </div>

            <ContactBar phone={property.phone} whatsapp={property.whatsapp} />
          </div>
        </div>

        <div className="divider" />

        {/* Units */}
        <section id="units-section">
          <h2 className="section-title units-title">{t.units_in_property}</h2>
          {(!property.units || property.units.length === 0) ? (
            <p className="no-data-msg">{t.no_units}</p>
          ) : (
            <div className="units-grid" id="units-grid">
              {property.units.map((unit, i) => (
                <div key={unit.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <UnitCard unit={unit} t={t} lang={lang} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
