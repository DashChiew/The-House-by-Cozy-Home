import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../../context/LanguageContext';
import './AdminLogin.css';

export default function AdminLogin({ onLogin }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/login', form);
      const token = res.data.access_token;
      localStorage.setItem('admin_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      onLogin();
      navigate('/admin');
    } catch {
      setError('Invalid username or password. / 用户名或密码错误。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg__circle login-bg__circle--1" />
        <div className="login-bg__circle login-bg__circle--2" />
      </div>
      <div className="login-card animate-fade-in-up" id="admin-login-card">
        <div className="login-card__icon">🔐</div>
        <h1 className="login-card__title">{t.admin_login}</h1>
        <p className="login-card__sub">The House by Cozy Home</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">{t.admin_username}</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t.admin_password}</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <button id="login-submit-btn" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? t.loading : t.admin_signin}
          </button>
        </form>
      </div>
    </div>
  );
}
