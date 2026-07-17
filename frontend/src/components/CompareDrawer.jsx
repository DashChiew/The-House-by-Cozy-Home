import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCompare } from '../context/CompareContext';
import { useLang } from '../context/LanguageContext';
import './CompareDrawer.css';

export default function CompareDrawer() {
  const { compared, removeRoom, clearCompare, addRoom, isInCompare } = useCompare();
  const { t, lang } = useLang();

  const [minimized, setMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!showSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const excludeIds = compared.map(r => r.id).join(',');
      setSearching(true);
      axios.get(`/api/rooms/search?q=${encodeURIComponent(searchQuery)}&exclude=${excludeIds}`)
        .then(res => { setSearchResults(res.data); setSearching(false); })
        .catch(() => setSearching(false));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, showSearch, compared]);

  // Open search and load all rooms immediately
  const handleOpenSearch = () => {
    setShowSearch(true);
    setSearchQuery('');
  };

  const handleAddRoom = (room) => {
    addRoom(room);
    setSearchResults(prev => prev.filter(r => r.id !== room.id));
  };

  if (compared.length === 0) return null;

  const canAddMore = compared.length < 3;

  return (
    <div className={`compare-drawer animate-fade-in-up${minimized ? ' compare-drawer--minimized' : ''}`} id="compare-drawer">
      <div className="compare-drawer__container">
        <div className="compare-drawer__header">
          <div
            className="compare-drawer__title"
            onClick={() => setMinimized(m => !m)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            ⚖️ {t.compare_rooms_title || 'Compare Rooms'} ({compared.length}/3)
          </div>
          <div className="compare-drawer__header-actions">
            <button
              className="compare-drawer__minimize"
              onClick={() => setMinimized(m => !m)}
              title={minimized ? 'Expand' : 'Minimize'}
              aria-label={minimized ? 'Expand compare panel' : 'Minimize compare panel'}
            >
              {minimized ? '▲' : '▼'}
            </button>
            <button className="compare-drawer__clear" onClick={clearCompare}>
              {t.clear || 'Clear All'}
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            <div className="compare-drawer__list">
              {compared.map(room => (
                <div key={room.id} className="compare-drawer__item">
                  <div className="compare-drawer__item-info">
                    <span className="compare-drawer__item-name">{room.room_name}</span>
                    <span className="compare-drawer__item-prop">
                      {lang === 'zh' ? room.property_name_zh : room.property_name_en}
                    </span>
                  </div>
                  <button className="compare-drawer__item-remove" onClick={() => removeRoom(room.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Room Picker */}
            {canAddMore && (
              <div className="compare-drawer__picker">
                {!showSearch ? (
                  <button
                    className="compare-drawer__add-btn"
                    onClick={handleOpenSearch}
                  >
                    + {t.add_another_room || 'Add Another Room'}
                  </button>
                ) : (
                  <div className="compare-drawer__search-wrap">
                    <div className="compare-drawer__search-bar">
                      <input
                        type="text"
                        className="compare-drawer__search-input"
                        placeholder={t.search_rooms_placeholder || 'Search rooms...'}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="compare-drawer__search-close"
                        onClick={() => { setShowSearch(false); setSearchResults([]); }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="compare-drawer__results">
                      {searching && (
                        <div className="compare-drawer__results-loading">
                          {t.loading || 'Loading...'}
                        </div>
                      )}
                      {!searching && searchResults.length === 0 && searchQuery.length > 0 && (
                        <div className="compare-drawer__results-empty">
                          {t.no_rooms_found || 'No rooms found.'}
                        </div>
                      )}
                      {!searching && searchResults.map(room => (
                        <div key={room.id} className="compare-drawer__result-item">
                          <div className="compare-drawer__result-info">
                            <span className="compare-drawer__result-name">{room.room_name}</span>
                            <span className="compare-drawer__result-sub">
                              {lang === 'zh' ? room.property_name_zh : room.property_name_en}
                              {' · '}
                              {room.unit_name}
                            </span>
                            {room.price_long && (
                              <span className="compare-drawer__result-price">
                                {room.currency} {Number(room.price_long).toLocaleString()}{t.per_month || '/mo'}
                              </span>
                            )}
                          </div>
                          <button
                            className="compare-drawer__result-add"
                            onClick={() => handleAddRoom(room)}
                            disabled={isInCompare(room.id)}
                          >
                            {isInCompare(room.id) ? '✓' : '+'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="compare-drawer__actions">
              <Link to="/compare" className="btn btn-primary btn-sm" id="go-compare-btn">
                {t.compare_now || 'Compare Now'}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
