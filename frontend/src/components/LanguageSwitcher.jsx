import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="lang-switch">
      <button className={i18n.language === 'am' ? 'active' : ''} onClick={() => i18n.changeLanguage('am')}>
        🇪🇹 አማርኛ
      </button>
      <button className={i18n.language === 'en' ? 'active' : ''} onClick={() => i18n.changeLanguage('en')}>
        🇬🇧 English
      </button>
    </div>
  );
}
