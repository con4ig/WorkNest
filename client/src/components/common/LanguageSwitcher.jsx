import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const isPL = i18n.language?.startsWith('pl');
    const isEN = i18n.language?.startsWith('en');

    return (
        <div className="flex gap-1.5 rounded-xl border border-border bg-card p-1 shadow-sm transition-colors duration-300">
            <button
                type="button"
                onClick={() => changeLanguage('pl')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isPL
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
                PL
            </button>
            <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isEN
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
