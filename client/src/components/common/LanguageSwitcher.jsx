import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => changeLanguage('pl')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    i18n.language === 'pl'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
                PL
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    i18n.language === 'en'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
