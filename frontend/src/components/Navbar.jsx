import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import logo from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <img src={logo} alt={t.brand} className="navbar__brand-logo" />
        </Link>

        {/* Desktop Nav */}
        <div className="navbar__links">
          <Link to="/" className={`navbar__link${location.pathname === '/' ? ' active' : ''}`}>
            {t.nav_home}
          </Link>
          <button
            id="lang-toggle-btn"
            className="navbar__lang-toggle"
            onClick={toggleLang}
            aria-label="Toggle language"
          >
            <span className={lang === 'en' ? 'active' : ''}>EN</span>
            <span className="navbar__lang-sep">|</span>
            <span className={lang === 'zh' ? 'active' : ''}>中文</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu animate-fade-in">
          <Link to="/" className="navbar__mobile-link">{t.nav_home}</Link>
          <button className="navbar__mobile-lang" onClick={toggleLang}>
            {lang === 'en' ? '切换到中文' : 'Switch to English'}
          </button>
        </div>
      )}
    </nav>
  );
}
