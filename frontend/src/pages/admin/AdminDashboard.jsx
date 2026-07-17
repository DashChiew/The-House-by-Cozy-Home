import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../../context/LanguageContext';
import './AdminDashboard.css';

// ── Tag Input Component ──────────────────────────────────────────────────────
function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const [uniqueId] = useState(() => 'ti-' + Math.random().toString(36).substring(2, 9));
  const safeValue = Array.isArray(value) ? value : [];

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      onChange([...safeValue, input.trim()]);
      setInput('');
    }
  };
  return (
    <div className="tags-container" onClick={() => document.getElementById(uniqueId)?.focus()}>
      {safeValue.map((tag, i) => (
        <span key={i} className="tag-item">
          {tag}
          <button type="button" onClick={() => onChange(safeValue.filter((_, j) => j !== i))}>×</button>
        </span>
      ))}
      <input
        id={uniqueId}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        style={{ border: 'none', outline: 'none', flex: 1, minWidth: 120, fontSize: '0.9rem', background: 'transparent' }}
      />
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

// ── Photo Upload Section ─────────────────────────────────────────────────────
function PhotoUpload({ propertyId, photos, onRefresh, t }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('is_cover', photos.length === 0 ? 'true' : 'false');
    setUploading(true);
    try {
      await axios.post(`/api/admin/photos/upload/property/${propertyId}`, fd);
      onRefresh();
    } finally { setUploading(false); }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm(t.confirm_delete)) return;
    await axios.delete(`/api/admin/photos/property/${photoId}`);
    onRefresh();
  };

  const setCover = async (photoId) => {
    try {
      await axios.put(`/api/admin/photos/property/${photoId}/set-cover`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="photo-upload">
      <label className="photo-upload__btn">
        {uploading ? '⏳ ' + t.loading : '📷 ' + t.admin_upload_photo}
        <input type="file" accept="image/*" onChange={upload} style={{ display: 'none' }} />
      </label>
      <div className="photo-upload__grid">
        {photos.map(p => (
          <div
            key={p.id}
            className={`photo-thumb${p.is_cover ? ' photo-thumb--cover' : ''}`}
            onClick={() => !p.is_cover && setCover(p.id)}
            title={p.is_cover ? 'Current cover image' : 'Click to set as cover'}
            style={{ cursor: p.is_cover ? 'default' : 'pointer' }}
          >
            <img src={p.photo_url} alt="" />
            {p.is_cover ? (
              <span className="photo-thumb__cover">Cover</span>
            ) : (
              <span className="photo-thumb__set-cover">Set Cover</span>
            )}
            <button
              className="photo-thumb__del"
              onClick={(e) => { e.stopPropagation(); deletePhoto(p.id); }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Room Photo Upload Section ──────────────────────────────────────────────────
function RoomPhotoUpload({ roomId, photos, onRefresh, t }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('is_cover', photos.length === 0 ? 'true' : 'false');
    setUploading(true);
    try {
      await axios.post(`/api/admin/photos/upload/room/${roomId}`, fd);
      onRefresh();
    } finally { setUploading(false); }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm(t.confirm_delete || 'Are you sure you want to delete this?')) return;
    await axios.delete(`/api/admin/photos/room/${photoId}`);
    onRefresh();
  };

  const setCover = async (photoId) => {
    try {
      await axios.put(`/api/admin/photos/room/${photoId}/set-cover`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="photo-upload">
      <label className="photo-upload__btn" style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'inline-block' }}>
        {uploading ? '⏳ ' + t.loading : '📷 ' + t.admin_upload_photo}
        <input type="file" accept="image/*" onChange={upload} style={{ display: 'none' }} />
      </label>
      <div className="photo-upload__grid" style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {photos.map(p => (
          <div
            key={p.id}
            className={`photo-thumb${p.is_cover ? ' photo-thumb--cover' : ''}`}
            onClick={() => !p.is_cover && setCover(p.id)}
            title={p.is_cover ? 'Current cover image' : 'Click to set as cover'}
            style={{ width: '72px', height: '60px', position: 'relative', cursor: p.is_cover ? 'default' : 'pointer' }}
          >
            <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {p.is_cover ? (
              <span className="photo-thumb__cover">Cover</span>
            ) : (
              <span className="photo-thumb__set-cover">Set Cover</span>
            )}
            <button
              className="photo-thumb__del"
              onClick={(e) => { e.stopPropagation(); deletePhoto(p.id); }}
              style={{ position: 'absolute', top: 2, right: 2, zIndex: 5 }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Room Video Upload Section ──────────────────────────────────────────────────
function RoomVideoUpload({ roomId, videoUrl, onRefresh, t }) {
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState(videoUrl);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('video', file);
    setUploading(true);
    try {
      const res = await axios.post(`/api/admin/videos/upload/room/${roomId}`, fd);
      setLocalUrl(res.data.video_url);
      onRefresh();
    } catch {
      alert('Failed to upload video. Please try again.');
    } finally { setUploading(false); }
  };

  const deleteVideo = async () => {
    if (!confirm(t.confirm_delete || 'Are you sure you want to delete this video?')) return;
    setUploading(true);
    try {
      await axios.delete(`/api/admin/videos/room/${roomId}`);
      setLocalUrl(null);
      onRefresh();
    } finally { setUploading(false); }
  };

  return (
    <div className="video-upload-zone">
      {localUrl ? (
        <div className="video-upload-zone__preview">
          <video src={localUrl} controls className="video-upload-zone__player" />
          <div className="video-upload-zone__actions">
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              {uploading ? '⏳ Uploading...' : '🔄 Replace Video'}
              <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={upload} style={{ display: 'none' }} disabled={uploading} />
            </label>
            <button type="button" className="btn btn-danger btn-sm" onClick={deleteVideo} disabled={uploading}>
              🗑️ Remove
            </button>
          </div>
        </div>
      ) : (
        <label className={`video-upload-zone__dropzone${uploading ? ' uploading' : ''}`}>
          <div className="video-upload-zone__icon">🎥</div>
          <div className="video-upload-zone__text">
            {uploading ? 'Uploading video...' : 'Click to upload MP4 video'}
          </div>
          <div className="video-upload-zone__hint">Supported: MP4, MOV, AVI, MKV, WEBM · Max 100MB</div>
          <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={upload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      )}
    </div>
  );
}


// ── Property Form ────────────────────────────────────────────────────────────
function PropertyForm({ initial, onSave, onCancel, t }) {
  const [form, setForm] = useState(initial || {
    name_en: '', name_zh: '', address: '', description_en: '', description_zh: '',
    phone: '', whatsapp: '', is_active: true,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.name_en} *</label>
          <input className="form-input" value={form.name_en} onChange={e => set('name_en', e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">{t.name_zh} *</label>
          <input className="form-input" value={form.name_zh} onChange={e => set('name_zh', e.target.value)} required /></div>
      </div>
      <div className="form-group"><label className="form-label">{t.address}</label>
        <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} /></div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.description_en}</label>
          <textarea className="form-textarea" value={form.description_en} onChange={e => set('description_en', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t.description_zh}</label>
          <textarea className="form-textarea" value={form.description_zh} onChange={e => set('description_zh', e.target.value)} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.phone}</label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t.whatsapp_num}</label>
          <input className="form-input" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="60123456789" /></div>
      </div>
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
          {t.is_active}
        </label>
      </div>
      <div className="admin-form__actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t.admin_cancel}</button>
        <button type="submit" className="btn btn-primary">{t.admin_save}</button>
      </div>
    </form>
  );
}

// ── Unit Form ────────────────────────────────────────────────────────────────
function UnitForm({ initial, onSave, onCancel, t }) {
  const [form, setForm] = useState(() => {
    const base = {
      unit_name: '', gender_type: 'mixed', stay_type: 'both', is_available: true,
      available_from: '', description_en: '', description_zh: '',
      equipment_en: [], equipment_zh: [], inclusions_en: [], inclusions_zh: [],
      exclusions_en: [], exclusions_zh: [],
    };
    if (initial) {
      return {
        ...base,
        ...initial,
        available_from: initial.available_from ? initial.available_from.substring(0, 10) : '',
        equipment_en: Array.isArray(initial.equipment_en) ? initial.equipment_en : [],
        equipment_zh: Array.isArray(initial.equipment_zh) ? initial.equipment_zh : [],
        inclusions_en: Array.isArray(initial.inclusions_en) ? initial.inclusions_en : [],
        inclusions_zh: Array.isArray(initial.inclusions_zh) ? initial.inclusions_zh : [],
        exclusions_en: Array.isArray(initial.exclusions_en) ? initial.exclusions_en : [],
        exclusions_zh: Array.isArray(initial.exclusions_zh) ? initial.exclusions_zh : [],
      };
    }
    return base;
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="admin-form">
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.unit_name} *</label>
          <input className="form-input" value={form.unit_name} onChange={e => set('unit_name', e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">{t.available_from_label}</label>
          <input className="form-input" type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.gender_type}</label>
          <select className="form-select" value={form.gender_type} onChange={e => set('gender_type', e.target.value)}>
            <option value="female">♀ Female Only</option>
            <option value="male">♂ Male Only</option>
            <option value="mixed">⚥ Mixed</option>
          </select></div>
        <div className="form-group"><label className="form-label">{t.stay_type}</label>
          <select className="form-select" value={form.stay_type} onChange={e => set('stay_type', e.target.value)}>
            <option value="short">Short Stay</option>
            <option value="long">Long Stay</option>
            <option value="both">Both</option>
          </select></div>
      </div>
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} />
          {t.is_available}
        </label>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.description_en}</label>
          <textarea className="form-textarea" value={form.description_en} onChange={e => set('description_en', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t.description_zh}</label>
          <textarea className="form-textarea" value={form.description_zh} onChange={e => set('description_zh', e.target.value)} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.equipment_en_label}</label>
          <TagInput value={form.equipment_en} onChange={v => set('equipment_en', v)} placeholder={t.add_tag} /></div>
        <div className="form-group"><label className="form-label">{t.equipment_zh_label}</label>
          <TagInput value={form.equipment_zh} onChange={v => set('equipment_zh', v)} placeholder={t.add_tag} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.inclusions_en_label}</label>
          <TagInput value={form.inclusions_en} onChange={v => set('inclusions_en', v)} placeholder={t.add_tag} /></div>
        <div className="form-group"><label className="form-label">{t.inclusions_zh_label}</label>
          <TagInput value={form.inclusions_zh} onChange={v => set('inclusions_zh', v)} placeholder={t.add_tag} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.exclusions_en_label}</label>
          <TagInput value={form.exclusions_en} onChange={v => set('exclusions_en', v)} placeholder={t.add_tag} /></div>
        <div className="form-group"><label className="form-label">{t.exclusions_zh_label}</label>
          <TagInput value={form.exclusions_zh} onChange={v => set('exclusions_zh', v)} placeholder={t.add_tag} /></div>
      </div>
      <div className="admin-form__actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t.admin_cancel}</button>
        <button type="submit" className="btn btn-primary">{t.admin_save}</button>
      </div>
    </form>
  );
}

// ── Room Form ────────────────────────────────────────────────────────────────
function RoomForm({ initial, onSave, onCancel, onVideoUploaded, t }) {
  const [form, setForm] = useState(() => {
    const base = {
      room_name: '', room_type: 'single', is_available: true, available_from: '',
      price_short: '', price_long: '', currency: 'MYR',
      equipment_en: [], equipment_zh: [], inclusions_en: [], inclusions_zh: [],
      exclusions_en: [], exclusions_zh: [],
    };
    if (initial) {
      return {
        ...base,
        ...initial,
        available_from: initial.available_from ? initial.available_from.substring(0, 10) : '',
        equipment_en: Array.isArray(initial.equipment_en) ? initial.equipment_en : [],
        equipment_zh: Array.isArray(initial.equipment_zh) ? initial.equipment_zh : [],
        inclusions_en: Array.isArray(initial.inclusions_en) ? initial.inclusions_en : [],
        inclusions_zh: Array.isArray(initial.inclusions_zh) ? initial.inclusions_zh : [],
        exclusions_en: Array.isArray(initial.exclusions_en) ? initial.exclusions_en : [],
        exclusions_zh: Array.isArray(initial.exclusions_zh) ? initial.exclusions_zh : [],
      };
    }
    return base;
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="admin-form">
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.room_name} *</label>
          <input className="form-input" value={form.room_name} onChange={e => set('room_name', e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">{t.room_type}</label>
          <select className="form-select" value={form.room_type} onChange={e => set('room_type', e.target.value)}>
            <option value="single">Single Room</option>
            <option value="twin">Twin Room</option>
            <option value="master">Master Room</option>
            <option value="suite">Suite</option>
            <option value="other">Other</option>
          </select></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.price_long_label} (MYR)</label>
          <input className="form-input" type="number" value={form.price_long} onChange={e => set('price_long', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t.price_short_label} (MYR)</label>
          <input className="form-input" type="number" value={form.price_short} onChange={e => set('price_short', e.target.value)} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.available_from_label}</label>
          <input className="form-input" type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)} /></div>
        <div className="form-group">
          <label className="form-label">🎥 Video Tour (MP4)</label>
          {initial?.id ? (
            <RoomVideoUpload
              roomId={initial.id}
              videoUrl={initial.video_url}
              onRefresh={onVideoUploaded || (() => {})}
              t={t}
            />
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', paddingTop: '6px' }}>
              💡 Save the room first, then upload a video.
            </span>
          )}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} />
          {t.is_available}
        </label>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.equipment_en_label}</label>
          <TagInput value={form.equipment_en} onChange={v => set('equipment_en', v)} placeholder={t.add_tag} /></div>
        <div className="form-group"><label className="form-label">{t.equipment_zh_label}</label>
          <TagInput value={form.equipment_zh} onChange={v => set('equipment_zh', v)} placeholder={t.add_tag} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.inclusions_en_label}</label>
          <TagInput value={form.inclusions_en} onChange={v => set('inclusions_en', v)} placeholder={t.add_tag} /></div>
        <div className="form-group"><label className="form-label">{t.inclusions_zh_label}</label>
          <TagInput value={form.inclusions_zh} onChange={v => set('inclusions_zh', v)} placeholder={t.add_tag} /></div>
      </div>
      <div className="admin-form__row">
        <div className="form-group"><label className="form-label">{t.exclusions_en_label}</label>
          <TagInput value={form.exclusions_en} onChange={v => set('exclusions_en', v)} placeholder={t.add_tag} /></div>
        <div className="form-group"><label className="form-label">{t.exclusions_zh_label}</label>
          <TagInput value={form.exclusions_zh} onChange={v => set('exclusions_zh', v)} placeholder={t.add_tag} /></div>
      </div>
      <div className="admin-form__actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t.admin_cancel}</button>
        <button type="submit" className="btn btn-primary">{t.admin_save}</button>
      </div>
    </form>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('properties'); // properties | units | rooms
  const [selectedProp, setSelectedProp] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [modal, setModal] = useState(null); // { type: 'property'|'unit'|'room', data: null|{} }

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/admin/properties');
      setProperties(r.data);
    } catch { showToast(t.error_load, 'error'); }
    setLoading(false);
  }, [t]);

  const loadUnits = useCallback(async (propId) => {
    const r = await axios.get(`/api/admin/properties/${propId}/units`);
    setUnits(r.data);
  }, []);

  const loadRooms = useCallback(async (unitId) => {
    const r = await axios.get(`/api/admin/units/${unitId}/rooms`);
    setRooms(r.data);
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    delete axios.defaults.headers.common['Authorization'];
    onLogout();
    navigate('/admin/login');
  };

  // Save Property
  const saveProperty = async (form) => {
    try {
      if (modal.data?.id) {
        await axios.put(`/api/admin/properties/${modal.data.id}`, form);
        showToast('Property updated!');
      } else {
        await axios.post('/api/admin/properties', form);
        showToast('Property created!');
      }
      setModal(null);
      loadProperties();
    } catch { showToast('Error saving property.', 'error'); }
  };

  // Delete Property
  const deleteProperty = async (id) => {
    if (!confirm(t.confirm_delete)) return;
    await axios.delete(`/api/admin/properties/${id}`);
    showToast('Property deleted!');
    loadProperties();
  };

  // Save Unit
  const saveUnit = async (form) => {
    try {
      if (modal.data?.id) {
        await axios.put(`/api/admin/units/${modal.data.id}`, form);
        showToast('Unit updated!');
      } else {
        await axios.post(`/api/admin/properties/${selectedProp.id}/units`, form);
        showToast('Unit created!');
      }
      setModal(null);
      loadUnits(selectedProp.id);
    } catch { showToast('Error saving unit.', 'error'); }
  };

  const deleteUnit = async (id) => {
    if (!confirm(t.confirm_delete)) return;
    await axios.delete(`/api/admin/units/${id}`);
    showToast('Unit deleted!');
    loadUnits(selectedProp.id);
  };

  // Save Room
  const saveRoom = async (form) => {
    try {
      // Strip video_url from the payload — video is managed by the upload endpoint only
      const { video_url: _v, ...payload } = form;
      if (modal.data?.id) {
        await axios.put(`/api/admin/rooms/${modal.data.id}`, payload);
        showToast('Room updated!');
      } else {
        await axios.post(`/api/admin/units/${selectedUnit.id}/rooms`, payload);
        showToast('Room created!');
      }
      setModal(null);
      loadRooms(selectedUnit.id);
    } catch { showToast('Error saving room.', 'error'); }
  };

  const deleteRoom = async (id) => {
    if (!confirm(t.confirm_delete)) return;
    await axios.delete(`/api/admin/rooms/${id}`);
    showToast('Room deleted!');
    loadRooms(selectedUnit.id);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" id="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>🏠</span>
          <div>
            <div className="admin-sidebar__brand-name">Admin Panel</div>
            <div className="admin-sidebar__brand-sub">The House by Cozy Home</div>
          </div>
        </div>
        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav-item${view === 'properties' ? ' active' : ''}`}
            id="nav-properties-btn"
            onClick={() => { setView('properties'); setSelectedProp(null); setSelectedUnit(null); }}
          >
            🏢 {t.admin_properties}
          </button>
          {selectedProp && (
            <button
              className={`admin-nav-item admin-nav-item--sub${view === 'units' ? ' active' : ''}`}
              id="nav-units-btn"
              onClick={() => { setView('units'); setSelectedUnit(null); }}
            >
              🚪 Units — {selectedProp.name_en}
            </button>
          )}
          {selectedUnit && (
            <button
              className={`admin-nav-item admin-nav-item--sub admin-nav-item--sub2${view === 'rooms' ? ' active' : ''}`}
              id="nav-rooms-btn"
              onClick={() => setView('rooms')}
            >
              🛏 Rooms — {selectedUnit.unit_name}
            </button>
          )}
        </nav>
        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar__view-site">↗ View Site</Link>
          <button className="admin-sidebar__logout" onClick={handleLogout} id="admin-logout-btn">
            🚪 {t.admin_logout}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main" id="admin-main">
        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {/* ── PROPERTIES ── */}
        {!loading && view === 'properties' && (
          <div className="admin-section animate-fade-in">
            <div className="admin-section__header">
              <h1 className="admin-section__title">{t.admin_properties}</h1>
              <button
                className="btn btn-primary"
                id="add-property-btn"
                onClick={() => setModal({ type: 'property', data: null })}
              >+ {t.admin_add_property}</button>
            </div>
            <div className="admin-cards-grid">
              {properties.map(prop => (
                <div key={prop.id} className="admin-prop-card" id={`admin-prop-${prop.id}`}>
                  <div className="admin-prop-card__top">
                    {prop.cover_photo
                      ? <img src={prop.cover_photo} alt={prop.name_en} className="admin-prop-card__img" />
                      : <div className="admin-prop-card__img-placeholder">🏠</div>
                    }
                    <div className="admin-prop-card__badge">
                      <span className={`badge ${prop.is_active ? 'badge-available' : 'badge-unavailable'}`}>
                        {prop.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="admin-prop-card__body">
                    <div className="admin-prop-card__name">{prop.name_en}</div>
                    <div className="admin-prop-card__sub">{prop.name_zh}</div>
                    <div className="admin-prop-card__addr">{prop.address}</div>
                    <div className="admin-prop-card__actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        id={`manage-units-btn-${prop.id}`}
                        onClick={() => { setSelectedProp(prop); setView('units'); loadUnits(prop.id); }}
                      >🚪 Units</button>
                      <button
                        className="btn btn-secondary btn-sm"
                        id={`edit-prop-btn-${prop.id}`}
                        onClick={() => setModal({ type: 'property', data: prop })}
                      >{t.admin_edit}</button>
                      <button
                        className="btn btn-danger btn-sm"
                        id={`delete-prop-btn-${prop.id}`}
                        onClick={() => deleteProperty(prop.id)}
                      >{t.admin_delete}</button>
                    </div>
                    {/* Photo Management */}
                    <details className="admin-photo-section">
                      <summary>📷 Photos ({(prop.photos || []).length})</summary>
                      <PhotoUpload
                        propertyId={prop.id}
                        photos={prop.photos || []}
                        onRefresh={loadProperties}
                        t={t}
                      />
                    </details>
                  </div>
                </div>
              ))}
              {properties.length === 0 && <p className="no-data-msg">{t.no_data}</p>}
            </div>
          </div>
        )}

        {/* ── UNITS ── */}
        {!loading && view === 'units' && selectedProp && (
          <div className="admin-section animate-fade-in">
            <div className="admin-section__header">
              <div>
                <button className="admin-back-btn" onClick={() => setView('properties')}>← {t.admin_back}</button>
                <h1 className="admin-section__title">Units — {selectedProp.name_en}</h1>
              </div>
              <button className="btn btn-primary" id="add-unit-btn"
                onClick={() => setModal({ type: 'unit', data: null })}
              >+ {t.admin_add_unit}</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Unit Name</th><th>Gender</th><th>Stay</th><th>Available</th><th>From</th><th>Rooms</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {units.map(u => (
                    <tr key={u.id} id={`admin-unit-row-${u.id}`}>
                      <td><strong>{u.unit_name}</strong></td>
                      <td><span className={`badge badge-${u.gender_type}`}>{u.gender_type}</span></td>
                      <td><span className={`badge badge-${u.stay_type}`}>{u.stay_type}</span></td>
                      <td><span className={`badge ${u.is_available ? 'badge-available' : 'badge-unavailable'}`}>
                        {u.is_available ? 'Yes' : 'No'}</span></td>
                      <td>{u.available_from ? new Date(u.available_from).toLocaleDateString() : '—'}</td>
                      <td>{u.available_rooms_count}/{u.total_rooms_count}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" id={`manage-rooms-btn-${u.id}`}
                            onClick={() => { setSelectedUnit(u); setView('rooms'); loadRooms(u.id); }}>🛏 Rooms</button>
                          <button className="btn btn-secondary btn-sm" id={`edit-unit-btn-${u.id}`}
                            onClick={() => setModal({ type: 'unit', data: u })}>{t.admin_edit}</button>
                          <button className="btn btn-danger btn-sm" id={`delete-unit-btn-${u.id}`}
                            onClick={() => deleteUnit(u.id)}>{t.admin_delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {units.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t.no_data}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ROOMS ── */}
        {!loading && view === 'rooms' && selectedUnit && (
          <div className="admin-section animate-fade-in">
            <div className="admin-section__header">
              <div>
                <button className="admin-back-btn" onClick={() => setView('units')}>← {t.admin_back}</button>
                <h1 className="admin-section__title">Rooms — {selectedUnit.unit_name}</h1>
              </div>
              <button className="btn btn-primary" id="add-room-btn"
                onClick={() => setModal({ type: 'room', data: null })}
              >+ {t.admin_add_room}</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Room</th><th>Type</th><th>Available</th><th>Long Stay (MYR)</th><th>Short Stay (MYR)</th><th>Available From</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {rooms.map(r => (
                    <tr key={r.id} id={`admin-room-row-${r.id}`}>
                      <td>
                        <strong>{r.room_name}</strong>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                          <details className="admin-photo-section">
                            <summary style={{ fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
                              📷 Photos ({(r.photos || []).length})
                            </summary>
                            <div style={{ marginTop: '4px', background: '#fafafa', padding: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                              <RoomPhotoUpload
                                roomId={r.id}
                                photos={r.photos || []}
                                onRefresh={() => loadRooms(selectedUnit.id)}
                                t={t}
                              />
                            </div>
                          </details>
                          <details className="admin-photo-section">
                            <summary style={{ fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
                              🎥 Video Tour
                            </summary>
                            <div style={{ marginTop: '4px', background: '#fafafa', padding: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                              <RoomVideoUpload
                                roomId={r.id}
                                videoUrl={r.video_url}
                                onRefresh={() => loadRooms(selectedUnit.id)}
                                t={t}
                              />
                            </div>
                          </details>
                        </div>
                      </td>
                      <td>{r.room_type}</td>
                      <td><span className={`badge ${r.is_available ? 'badge-available' : 'badge-unavailable'}`}>
                        {r.is_available ? 'Yes' : 'No'}</span></td>
                      <td>{r.price_long ? `RM ${Number(r.price_long).toLocaleString()}` : '—'}</td>
                      <td>{r.price_short ? `RM ${Number(r.price_short).toLocaleString()}` : '—'}</td>
                      <td>{r.available_from ? new Date(r.available_from).toLocaleDateString() : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" id={`edit-room-btn-${r.id}`}
                            onClick={() => setModal({ type: 'room', data: r })}>{t.admin_edit}</button>
                          <button className="btn btn-danger btn-sm" id={`delete-room-btn-${r.id}`}
                            onClick={() => deleteRoom(r.id)}>{t.admin_delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rooms.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t.no_data}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {modal && (
        <div className="modal-overlay" id="admin-modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {modal.type === 'property' && (modal.data ? t.admin_edit + ' Property' : t.admin_add_property)}
                {modal.type === 'unit' && (modal.data ? t.admin_edit + ' Unit' : t.admin_add_unit)}
                {modal.type === 'room' && (modal.data ? t.admin_edit + ' Room' : t.admin_add_room)}
              </div>
              <button onClick={() => setModal(null)} style={{ fontSize: '1.4rem', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            {modal.type === 'property' && <PropertyForm initial={modal.data} onSave={saveProperty} onCancel={() => setModal(null)} t={t} />}
            {modal.type === 'unit' && <UnitForm initial={modal.data} onSave={saveUnit} onCancel={() => setModal(null)} t={t} />}
            {modal.type === 'room' && <RoomForm
              initial={modal.data}
              onSave={saveRoom}
              onCancel={() => setModal(null)}
              onVideoUploaded={() => loadRooms(selectedUnit.id)}
              t={t}
            />}
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
