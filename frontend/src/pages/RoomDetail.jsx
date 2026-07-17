import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../context/LanguageContext';
import { useCompare } from '../context/CompareContext';
import PhotoGallery from '../components/PhotoGallery';
import VideoPlayer from '../components/VideoPlayer';
import ContactBar from '../components/ContactBar';
import './RoomDetail.css';

export default function RoomDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { addRoom, removeRoom, isInCompare, compared } = useCompare();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/rooms/${id}`)
      .then(res => {
        setRoom(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(t.error_load || 'Failed to load room details.');
        setLoading(false);
      });
  }, [id, t.error_load]);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /><p>{t.loading}</p></div>;
  }

  if (error || !room) {
    return <div className="loading-center"><p className="error-msg">{error}</p></div>;
  }

  const roomTypeLabel = t[`room_${room.room_type}`] || t.room_other;
  const isCompared = isInCompare(room.id);

  const handleCompareClick = () => {
    if (isCompared) {
      removeRoom(room.id);
    } else {
      if (compared.length >= 3) {
        alert(t.compare_max_alert || 'You can only compare up to 3 rooms.');
        return;
      }
      addRoom(room);
    }
  };

  const equipment = lang === 'zh' ? room.equipment_zh : room.equipment_en;
  const inclusions = lang === 'zh' ? room.inclusions_zh : room.inclusions_en;
  const exclusions = lang === 'zh' ? room.exclusions_zh : room.exclusions_en;

  return (
    <div className="room-detail animate-fade-in">
      <div className="container">
        {/* Breadcrumb */}
        <div className="room-breadcrumb">
          <Link to={`/property/${room.property_id}`} className="breadcrumb-link">
            {lang === 'zh' ? room.property_name_zh : room.property_name_en}
          </Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/unit/${room.unit_id}`} className="breadcrumb-link">
            {room.unit_name}
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-curr">{room.room_name}</span>
        </div>

        <div className="room-title-area">
          <div>
            <h1 className="room-title">{room.room_name}</h1>
            <div className="room-sub">
              <span className="room-type">{roomTypeLabel}</span>
              <span className={`badge ${room.is_available ? 'badge-available' : 'badge-unavailable'}`}>
                {room.is_available ? t.available_now : t.not_available}
              </span>
            </div>
          </div>

          <button
            onClick={handleCompareClick}
            className={`btn btn-sm ${isCompared ? 'btn-danger' : 'btn-secondary'}`}
            id={`compare-room-btn-${room.id}`}
          >
            ⚖️ {isCompared ? (t.remove_compare || 'Remove Compare') : (t.add_compare || 'Add to Compare')}
          </button>
        </div>

        {/* Gallery / Photos */}
        {(room.photos && room.photos.length > 0) || room.video_url ? (
          <div className="room-gallery-wrap">
            <PhotoGallery photos={room.photos || []} videoUrl={room.video_url} />
          </div>
        ) : (
          <div className="room-gallery-placeholder">
            <span>🛏️</span>
            <p>{t.no_photos_yet || 'No photos uploaded for this room yet.'}</p>
          </div>
        )}

        <div className="room-info-grid">
          {/* Left Panel */}
          <div className="room-info-left">
            {/* Prices Card */}
            <div className="info-card info-card--prices">
              <h3 className="info-card__title">💰 {t.rental_rates || 'Rental Rates'}</h3>
              <div className="room-rates-wrap">
                {room.price_long && (
                  <div className="rate-box">
                    <span className="rate-box__label">🏠 {t.price_long}</span>
                    <span className="rate-box__value">
                      {room.currency} {Number(room.price_long).toLocaleString()}
                      <span className="rate-box__per">{t.per_month}</span>
                    </span>
                  </div>
                )}
                {room.price_short && (
                  <div className="rate-box">
                    <span className="rate-box__label">⏱️ {t.price_short}</span>
                    <span className="rate-box__value">
                      {room.currency} {Number(room.price_short).toLocaleString()}
                      <span className="rate-box__per">{t.per_month}</span>
                    </span>
                  </div>
                )}
              </div>
              {room.available_from && (
                <div className="room-avail-date">
                  📅 {t.available_from}: <strong>{new Date(room.available_from).toLocaleDateString()}</strong>
                </div>
              )}
            </div>

            {/* Equipment */}
            <div className="info-card">
              <h3 className="info-card__title">🔌 {t.equipment_room}</h3>
              {equipment && equipment.length > 0 ? (
                <div className="equip-tags-grid">
                  {equipment.map((e, i) => (
                    <span key={i} className="equip-tag equip-tag--lg">{e}</span>
                  ))}
                </div>
              ) : (
                <p className="no-data-msg">{t.no_data}</p>
              )}
            </div>

            {/* Inclusions / Exclusions */}
            <div className="info-card">
              <h3 className="info-card__title">📋 {t.rental_inclusions || 'Rental Details'}</h3>
              <div className="room-inc-table">
                <div className="inc-col">
                  <div className="inc-col__header inc-col__header--yes">✓ {t.inclusions}</div>
                  {inclusions && inclusions.length > 0 ? (
                    <ul>{inclusions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  ) : <p className="inc-empty">—</p>}
                </div>
                <div className="inc-col">
                  <div className="inc-col__header inc-col__header--no">✕ {t.exclusions}</div>
                  {exclusions && exclusions.length > 0 ? (
                    <ul>{exclusions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  ) : <p className="inc-empty">—</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="room-info-right">
            <div className="info-card info-card--agent">
              <h3 className="info-card__title">📞 {t.contact_agent}</h3>
              <p>{t.agent_contact_msg || 'Have questions or want to view this room? Contact our agent directly via Call or WhatsApp.'}</p>
              <div className="agent-buttons">
                {room.property_phone && (
                  <a href={`tel:${room.property_phone}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    📞 {t.call_now}
                  </a>
                )}
                {room.property_whatsapp && (
                  <a href={`https://wa.me/${room.property_whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    💬 {t.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactBar phone={room.property_phone} whatsapp={room.property_whatsapp} />
    </div>
  );
}
