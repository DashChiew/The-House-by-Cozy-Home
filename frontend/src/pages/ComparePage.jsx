import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCompare } from '../context/CompareContext';
import { useLang } from '../context/LanguageContext';
import ContactBar from '../components/ContactBar';
import './ComparePage.css';

export default function ComparePage() {
  const { compared, removeRoom } = useCompare();
  const { t, lang } = useLang();
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (compared.length === 0) {
      setRoomsData([]);
      return;
    }
    const ids = compared.map(r => r.id).join(',');
    setLoading(true);
    setError(null);
    axios.get(`/api/rooms/compare?ids=${ids}`)
      .then(res => {
        setRoomsData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(t.error_load || 'Failed to load comparison data.');
        setLoading(false);
      });
  }, [compared, t.error_load]);

  if (compared.length === 0) {
    return (
      <div className="compare-page compare-page--empty animate-fade-in">
        <div className="container">
          <div className="empty-compare-card">
            <h2>⚖️ {t.compare_title || 'Room Comparison'}</h2>
            <p>{t.compare_empty_msg || 'No rooms selected for comparison. Go back to units to add rooms.'}</p>
            <Link to="/" className="btn btn-primary">{t.back_home || 'Back to Home'}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-center"><div className="spinner" /><p>{t.loading}</p></div>;
  }

  if (error) {
    return <div className="loading-center"><p className="error-msg">{error}</p></div>;
  }

  // Get all unique equipment across all rooms for comparison rows
  const allEquip = Array.from(new Set(
    roomsData.flatMap(r => lang === 'zh' ? r.equipment_zh : r.equipment_en)
  )).filter(Boolean);

  const getContactInfo = () => {
    // Return first available contact info from compared properties
    if (roomsData.length > 0) {
      return {
        phone: roomsData[0].property_phone || '',
        whatsapp: roomsData[0].property_whatsapp || ''
      };
    }
    return { phone: '', whatsapp: '' };
  };

  const contact = getContactInfo();

  return (
    <div className="compare-page animate-fade-in">
      <div className="container">
        <div className="compare-header">
          <Link to="/" className="back-link">← {t.back_home}</Link>
          <h1 className="compare-title">⚖️ {t.compare_title || 'Compare Rooms'}</h1>
        </div>

        <div className="compare-grid" style={{ gridTemplateColumns: `180px repeat(${roomsData.length}, 1fr)` }}>
          {/* Row 1: Header / Photos */}
          <div className="compare-cell compare-cell--label compare-cell--sticky-col"></div>
          {roomsData.map(room => (
            <div key={room.id} className="compare-cell compare-cell--header">
              <button className="compare-cell__remove" onClick={() => removeRoom(room.id)}>×</button>
              <div className="compare-cell__image">
                {room.cover_photo ? (
                  <img src={room.cover_photo} alt={room.room_name} />
                ) : (
                  <div className="compare-cell__image-placeholder">🛏️</div>
                )}
              </div>
              <div className="compare-cell__room-name">{room.room_name}</div>
              <div className="compare-cell__prop-name">
                {lang === 'zh' ? room.property_name_zh : room.property_name_en}
              </div>
              <Link to={`/room/${room.id}`} className="btn btn-secondary btn-xs" style={{ marginTop: '8px' }}>
                {t.view_room_btn || 'View Room'}
              </Link>
            </div>
          ))}

          {/* Row 2: Price Long */}
          <div className="compare-cell compare-cell--label compare-cell--sticky-col">{t.price_long}</div>
          {roomsData.map(room => (
            <div key={room.id} className="compare-cell compare-cell--price">
              {room.price_long ? (
                <>
                  <span className="price-val">{room.currency} {Number(room.price_long).toLocaleString()}</span>
                  <span className="price-per">{t.per_month}</span>
                </>
              ) : '—'}
            </div>
          ))}

          {/* Row 3: Price Short */}
          <div className="compare-cell compare-cell--label compare-cell--sticky-col">{t.price_short}</div>
          {roomsData.map(room => (
            <div key={room.id} className="compare-cell compare-cell--price">
              {room.price_short ? (
                <>
                  <span className="price-val">{room.currency} {Number(room.price_short).toLocaleString()}</span>
                  <span className="price-per">{t.per_month}</span>
                </>
              ) : '—'}
            </div>
          ))}

          {/* Row 4: Room Type */}
          <div className="compare-cell compare-cell--label compare-cell--sticky-col">{t.room_type || 'Room Type'}</div>
          {roomsData.map(room => (
            <div key={room.id} className="compare-cell">
              {t[`room_${room.room_type}`] || room.room_type}
            </div>
          ))}

          {/* Row 5: Availability */}
          <div className="compare-cell compare-cell--label compare-cell--sticky-col">{t.is_available || 'Availability'}</div>
          {roomsData.map(room => (
            <div key={room.id} className="compare-cell">
              <span className={`badge ${room.is_available ? 'badge-available' : 'badge-unavailable'}`}>
                {room.is_available ? t.available_now : t.not_available}
              </span>
              {room.available_from && !room.is_available && (
                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                  {new Date(room.available_from).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}

          {/* Row 6: Parent Unit */}
          <div className="compare-cell compare-cell--label compare-cell--sticky-col">{t.unit_name || 'Unit'}</div>
          {roomsData.map(room => (
            <div key={room.id} className="compare-cell">
              <Link to={`/unit/${room.unit_id}`} className="compare-link">
                {room.unit_name}
              </Link>
            </div>
          ))}

          {/* Rows: Equipment Comparison */}
          {allEquip.length > 0 && (
            <>
              <div className="compare-cell compare-cell--section-header compare-cell--sticky-col" style={{ gridColumn: `1 / span ${roomsData.length + 1}` }}>
                📋 {t.equipment_room || 'Room Equipment'}
              </div>
              {allEquip.map(equip => (
                <span key={equip} style={{ display: 'contents' }}>
                  <div className="compare-cell compare-cell--label compare-cell--sticky-col">{equip}</div>
                  {roomsData.map(room => {
                    const hasEquip = (lang === 'zh' ? room.equipment_zh : room.equipment_en).includes(equip);
                    return (
                      <div key={room.id} className="compare-cell compare-cell--check">
                        {hasEquip ? <span className="check-yes">✓</span> : <span className="check-no">✕</span>}
                      </div>
                    );
                  })}
                </span>
              ))}
            </>
          )}

          {/* Inclusions */}
          <div className="compare-cell compare-cell--section-header compare-cell--sticky-col" style={{ gridColumn: `1 / span ${roomsData.length + 1}` }}>
            ✓ {t.inclusions || 'Included in Rent'}
          </div>
          <div className="compare-cell compare-cell--label compare-cell--sticky-col">{t.inclusions || 'Inclusions'}</div>
          {roomsData.map(room => {
            const list = lang === 'zh' ? room.inclusions_zh : room.inclusions_en;
            return (
              <div key={room.id} className="compare-cell compare-cell--list">
                {list && list.length > 0 ? (
                  <ul>{list.map((item, i) => <li key={i}>{item}</li>)}</ul>
                ) : '—'}
              </div>
            );
          })}

          {/* Exclusions */}
          <div className="compare-cell compare-cell--section-header compare-cell--sticky-col" style={{ gridColumn: `1 / span ${roomsData.length + 1}` }}>
            ✕ {t.exclusions || 'Not Included'}
          </div>
          <div className="compare-cell compare-cell--label compare-cell--sticky-col">{t.exclusions || 'Exclusions'}</div>
          {roomsData.map(room => {
            const list = lang === 'zh' ? room.exclusions_zh : room.exclusions_en;
            return (
              <div key={room.id} className="compare-cell compare-cell--list">
                {list && list.length > 0 ? (
                  <ul>{list.map((item, i) => <li key={i}>{item}</li>)}</ul>
                ) : '—'}
              </div>
            );
          })}
        </div>
      </div>
      <ContactBar phone={contact.phone} whatsapp={contact.whatsapp} />
    </div>
  );
}
