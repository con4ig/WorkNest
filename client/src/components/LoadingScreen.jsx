import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const LoadingScreen = ({
    message = 'Przygotowujemy dla Ciebie aplikację...',
    quote,
}) => {
    const quotes = [
        'Organizowanie to to, co robisz, zanim coś zrobisz, aby kiedy to zrobisz, nie było bałaganu.',
        'Kluczem nie jest priorytetyzacja tego, co jest w harmonogramie, ale zaplanowanie swoich priorytetów.',
        'Wielkie rzeczy w biznesie nigdy nie są dziełem jednej osoby. Są dziełem zespołu ludzi.',
        'Sposobem na rozpoczęcie jest rzucenie gadania i rozpoczęcie działania.',
    ];
    const randomQuote =
        quote || quotes[Math.floor(Math.random() * quotes.length)];

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 text-center">
            <div className="relative mb-6">
                <div className="absolute -inset-2 animate-ping rounded-full bg-emerald-400 opacity-30"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                    <LayoutDashboard className="h-10 w-10 text-white" />
                </div>
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">
                {message}
            </h2>
            <p className="max-w-sm text-gray-500">{randomQuote}</p>
            <div className="mt-8 h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-full animate-progress rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            </div>
            <style>{`
                @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-progress { animation: progress 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default LoadingScreen;