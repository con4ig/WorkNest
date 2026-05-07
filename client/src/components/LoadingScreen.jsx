import React, { useMemo } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoadingScreen = ({
    message,
    quote,
}) => {
    const { t } = useTranslation();
    const quotes = useMemo(() => [
        t('common.loadingQuotes.0'),
        t('common.loadingQuotes.1'),
        t('common.loadingQuotes.2'),
        t('common.loadingQuotes.3'),
    ], [t]);
    
    const randomQuote =
        quote || quotes[Math.floor(Math.random() * quotes.length)];

    const displayMessage = message || t('common.loadingApp');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 text-center transition-colors duration-300">
            <div className="relative mb-6">
                <div className="absolute -inset-2 animate-ping rounded-full bg-emerald-400 dark:bg-emerald-500 opacity-30 dark:opacity-20"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 shadow-lg">
                    <LayoutDashboard className="h-10 w-10 text-white" />
                </div>
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-2xl font-bold text-transparent">
                {displayMessage}
            </h2>
            <p className="max-w-sm text-gray-500 dark:text-zinc-400">{randomQuote}</p>
            <div className="mt-8 h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800">
                <div className="h-full w-full animate-progress rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500"></div>
            </div>
            <style>{`
                @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-progress { animation: progress 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default LoadingScreen;