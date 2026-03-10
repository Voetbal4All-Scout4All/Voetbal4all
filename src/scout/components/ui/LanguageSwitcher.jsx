import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_META } from '../../i18n/index';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = SUPPORTED_LANGUAGES.includes(i18n.language)
    ? i18n.language
    : 'nl';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.flag}>{LANGUAGE_META[currentLang].flag}</span>
        <span className={styles.code}>{currentLang.toUpperCase()}</span>
        <span className={styles.chevron}>▾</span>
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {SUPPORTED_LANGUAGES.map((code) => {
            const meta = LANGUAGE_META[code];
            const isActive = code === currentLang;
            return (
              <li
                key={code}
                role="option"
                aria-selected={isActive}
                className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                onClick={() => handleSelect(code)}
              >
                <span className={styles.flag}>{meta.flag}</span>
                <span className={styles.label}>{meta.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
