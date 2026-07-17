import { createContext, useContext, useState } from 'react';
import en from '../i18n/en';
import zh from '../i18n/zh';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = lang === 'zh' ? zh : en;
  const toggleLang = () => setLang(l => l === 'en' ? 'zh' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
