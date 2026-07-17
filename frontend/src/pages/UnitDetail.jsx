import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../context/LanguageContext';
import './UnitDetail.css';

function EquipmentList({ items = [], title }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="equip-block">
      <h4 className="equip-block__title">{title}</h4>
      <ul className="equip-list">
        {items.map((item, i) => (
          <li key={i} className="equip-item">
            <span className="equip-item__dot" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InclusionTable({ inclusions = [], exclusions = [], t, lang }) {
  return (
    <div className="inclusion-table">
      <div className="inclusion-col">
        <div className="inclusion-col__header inclusion-col__header--yes">✓ {t.inclusions}</div>
        {inclusions.length === 0 ? <p className="inclusion-empty">—</p> : (
          <ul>{inclusions.map((item, i) => <li key={i}>{item}</li>)}</ul>
        )}
      </div>
      <div className="inclusion-col">
        <div className="inclusion-col__header inclusion-col__header--no">✕ {t.exclusions}</div>
        {exclusions.length === 0 ? <p className="inclusion-empty">—</p> : (
          <ul>{exclusions.map((item, i) => <li key={i}>{item}</li>)}</ul>
        )}
      </div>
    </div>
  );
}

import { useCompare } from '../context/CompareContext';

function RoomCard({ room, t, lang }) {
  const roomTypeLabel = t[`room_${room.room_type}`] || t.room_other;
  const { addRoom, removeRoom, isInCompare, compared } = useCompare();
  const isCompared = isInCompare(room.id);

  const handleCompareClick = (e) => {
    e.preventDefault(); // Prevent navigating to room details
    e.stopPropagation();
    if (isCompared) {
      removeRoom(room.id);
    } else {
      if (compared.length >= 3) {
        alert(t.compare_max_alert || 'You can only compare up to 3 rooms.');
        return;
      }
      // We need to pass enough info for the comparison drawer
      // But we must fetch parent property name. We can resolve it from page state or add details.
      addRoom(room);
    }
  };

  return (
    <Link to={`/room/${room.id}`} className="room-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={`room-card${!room.is_available ? ' room-card--unavailable' : ''}`} id={`room-card-${room.id}`}>
        <div className="room-card__header">
          <div>
            <div className="room-card__name">{room.room_name}</div>
            <div className="room-card__type">{roomTypeLabel}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className={`btn btn-xs ${isCompared ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleCompareClick}
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              ⚖️ {isCompared ? (t.remove_compare || 'Remove') : (t.add_compare || 'Compare')}
            </button>
            <span className={`badge ${room.is_available ? 'badge-available' : 'badge-unavailable'}`}>
              {room.is_available ? t.available_now : t.not_available}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="room-card__prices">
          {room.price_long && (
            <div className="price-block price-block--long">
              <span className="price-block__label">{t.price_long}</span>
              <span className="price-block__value">
                {room.currency} {Number(room.price_long).toLocaleString()}
                <span className="price-block__per">{t.per_month}</span>
              </span>
            </div>
          )}
          {room.price_short && (
            <div className="price-block price-block--short">
              <span className="price-block__label">{t.price_short}</span>
              <span className="price-block__value">
                {room.currency} {Number(room.price_short).toLocaleString()}
                <span className="price-block__per">{t.per_month}</span>
              </span>
            </div>
          )}
        </div>

        {room.available_from && (
          <div className="room-card__avail">
            📅 {t.available_from}: <strong>{new Date(room.available_from).toLocaleDateString()}</strong>
          </div>
        )}

        {/* Room Equipment */}
        {((lang === 'zh' ? room.equipment_zh : room.equipment_en) || []).length > 0 && (
          <div className="room-card__equip">
            <div className="room-card__equip-label">{t.equipment_room}</div>
            <div className="room-card__equip-tags">
              {(lang === 'zh' ? room.equipment_zh : room.equipment_en).map((e, i) => (
                <span key={i} className="equip-tag">{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* Room Inclusions */}
        {(lang === 'zh' ? room.inclusions_zh : room.inclusions_en || []).length > 0 && (
          <div className="room-card__inclusions">
            <InclusionTable
              inclusions={lang === 'zh' ? room.inclusions_zh : room.inclusions_en}
              exclusions={lang === 'zh' ? room.exclusions_zh : room.exclusions_en}
              t={t} lang={lang}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

export default function UnitDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/units/${id}`)
      .then(r => { setUnit(r.data); setLoading(false); })
      .catch(() => { setError(t.error_load); setLoading(false); });
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /><p>{t.loading}</p></div>;
  if (error || !unit) return <div className="loading-center"><p className="error-msg">{error}</p></div>;

  const desc = lang === 'zh' ? unit.description_zh : unit.description_en;
  const equipment = lang === 'zh' ? unit.equipment_zh : unit.equipment_en;
  const inclusions = lang === 'zh' ? unit.inclusions_zh : unit.inclusions_en;
  const exclusions = lang === 'zh' ? unit.exclusions_zh : unit.exclusions_en;

  const genderMap = { female: ['badge-female', t.gender_female], male: ['badge-male', t.gender_male], mixed: ['badge-mixed', t.gender_mixed] };
  const stayMap = { short: ['badge-short', t.stay_short], long: ['badge-long', t.stay_long], both: ['badge-both', t.stay_both] };

  return (
    <div className="unit-detail animate-fade-in">
      <div className="container">
        {/* Back */}
        <Link to={`/property/${unit.property_id}`} className="back-link" id="back-to-property-btn">
          ← {t.back_property}
        </Link>

        {/* Unit Header */}
        <div className="unit-header">
          <div>
            <span className="section-label">{t.nav_properties}</span>
            <h1 className="unit-header__name">{unit.unit_name}</h1>
            <div className="unit-header__badges">
              {(() => { const [cls, lbl] = genderMap[unit.gender_type] || genderMap.mixed; return <span className={`badge ${cls}`}>{lbl}</span>; })()}
              {(() => { const [cls, lbl] = stayMap[unit.stay_type] || stayMap.both; return <span className={`badge ${cls}`}>{lbl}</span>; })()}
              <span className={`badge ${unit.is_available ? 'badge-available' : 'badge-unavailable'}`}>
                {unit.is_available ? t.available_now : t.not_available}
              </span>
            </div>
            {unit.available_from && (
              <p className="unit-header__avail">
                📅 {t.available_from}: <strong>{new Date(unit.available_from).toLocaleDateString()}</strong>
              </p>
            )}
            {desc && <p className="unit-header__desc">{desc}</p>}
          </div>
        </div>

        <div className="unit-detail__layout">
          {/* Left: Equipment + Inclusions */}
          <aside className="unit-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-card__title">{t.equipment_unit}</h3>
              {equipment && equipment.length > 0 ? (
                <div className="equip-tags-grid">
                  {equipment.map((e, i) => <span key={i} className="equip-tag equip-tag--lg">{e}</span>)}
                </div>
              ) : <p className="no-data-msg" style={{ padding: '12px 0', fontSize: '0.9rem' }}>{t.no_data}</p>}
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-card__title">{t.inclusions} / {t.exclusions}</h3>
              <InclusionTable inclusions={inclusions} exclusions={exclusions} t={t} lang={lang} />
            </div>
          </aside>

          {/* Right: Rooms */}
          <main className="unit-rooms">
            <h2 className="unit-rooms__title">{t.rooms_in_unit}</h2>
            {(!unit.rooms || unit.rooms.length === 0) ? (
              <p className="no-data-msg">{t.no_rooms}</p>
            ) : (
              <div className="rooms-list">
                {unit.rooms.map((room, i) => (
                  <div key={room.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                    <RoomCard room={room} t={t} lang={lang} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
