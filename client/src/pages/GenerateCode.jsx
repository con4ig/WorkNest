import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowLeft, RefreshCw, Sparkles, Lock } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function GenerateCode() {
    const [invitationCode, setInvitationCode] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Do ładowania przycisku
    const [pageLoading, setPageLoading] = useState(true); // Do ładowania strony
    const navigate = useNavigate();

    useEffect(() => {
        // Symulacja ładowania strony
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 500); // 0.5 sekundy opóźnienia
        return () => clearTimeout(timer);
    }, []);

    const generateCode = async () => {
        setIsLoading(true);
        setError(null);
        setInvitationCode(null);

        try {
            const response = await api.post('/users/generate-invitation', {});
            setInvitationCode(response.data.invitationCode);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || 'Błąd generowania kodu';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (pageLoading) {
        return <LoadingScreen message="Ładowanie..." />;
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
            {/* Animated background gradient orbs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="animate-float absolute -left-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 opacity-20 blur-3xl"></div>
                <div className="animation-delay-2000 animate-float absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-300 to-blue-300 opacity-20 blur-3xl"></div>
                <div className="animation-delay-4000 animate-float absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 opacity-20 blur-3xl"></div>
            </div>

            {/* Main card */}
            <div className="relative w-full max-w-md">
                {/* Glow effect behind card */}
                <div className="animate-pulse-slow absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-20 blur-2xl"></div>

                <div className="relative overflow-hidden rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                    {/* Shimmer effect */}
                    <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    {/* Back button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group absolute left-4 top-4 rounded-full bg-gray-100/80 p-2.5 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg"
                        title="Powrót do dashboardu"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600 transition-colors group-hover:text-white" />
                    </button>

                    {/* Header with icon animation */}
                    <div className="text-center">
                        <div className="relative mx-auto mb-6 inline-block">
                            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20"></div>
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/50">
                                <Key className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        <h2 className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-4xl font-black tracking-tight text-transparent">
                            Kod Zaproszenia
                        </h2>
                        <p className="mt-3 text-base text-gray-600">
                            Wygeneruj nowy kod zaproszenia dla swoich
                            pracowników
                        </p>
                    </div>

                    {/* Generate button */}
                    <div className="mt-10 space-y-6">
                        <button
                            onClick={generateCode}
                            disabled={isLoading}
                            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-1 shadow-lg shadow-emerald-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                        >
                            <div className="relative flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-4 text-lg font-bold text-white transition-all duration-300 group-hover:from-emerald-600 group-hover:via-teal-600 group-hover:to-cyan-600">
                                {isLoading ? (
                                    <>
                                        <div className="border-3 h-6 w-6 animate-spin rounded-full border-white/30 border-t-white"></div>
                                        <span className="animate-pulse">
                                            Generowanie...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180" />
                                        <span>Generuj Nowy Kod</span>
                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                    </>
                                )}
                            </div>

                            {/* Animated shine effect */}
                            <div className="animate-shine absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full"></div>
                        </button>

                        {/* Code display with enhanced animations */}
                        {invitationCode && (
                            <div className="animate-scale-in relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-lg">
                                {/* Animated border glow */}
                                <div className="animate-pulse-slow absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-30 blur-sm"></div>

                                <div className="relative">
                                    <div className="mb-3 flex items-center justify-center gap-2">
                                        <Lock className="h-4 w-4 animate-pulse text-emerald-600" />
                                        <p className="text-sm font-semibold text-emerald-800">
                                            Nowy Kod Zaproszenia
                                        </p>
                                        <Lock className="h-4 w-4 animate-pulse text-emerald-600" />
                                    </div>

                                    <div className="flex items-center justify-center gap-4">
                                        <div className="group relative">
                                            <div className="animate-pulse-slow absolute -inset-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 opacity-50 blur-lg"></div>
                                            <p className="animate-glow relative bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-black tracking-[0.1em] text-transparent">
                                                {invitationCode}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-white/60 p-2 backdrop-blur-sm">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                                        <p className="text-xs font-medium text-emerald-700">
                                            Kod jest ważny przez{' '}
                                            <span className="font-bold">
                                                5 minut
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error display */}
                        {error && (
                            <div className="animate-shake rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-pink-50 p-4 shadow-lg">
                                <p className="text-sm font-semibold text-red-700">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Info footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            💡 Kod można użyć tylko raz do rejestracji
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { 
                        transform: translate(0, 0) rotate(0deg); 
                    }
                    33% { 
                        transform: translate(30px, -30px) rotate(5deg); 
                    }
                    66% { 
                        transform: translate(-20px, 20px) rotate(-5deg); 
                    }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }

                @keyframes shine {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }

                @keyframes scale-in {
                    0% { 
                        opacity: 0; 
                        transform: scale(0.8) rotateX(45deg); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: scale(1) rotateX(0deg); 
                    }
                }

                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                @keyframes glow {
                    0%, 100% { 
                        filter: brightness(1) drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
                    }
                    50% { 
                        filter: brightness(1.1) drop-shadow(0 0 20px rgba(16, 185, 129, 0.8));
                    }
                }

                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }

                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }

                .animate-shine {
                    animation: shine 1s;
                }

                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }

                .animate-glow {
                    animation: glow 2s ease-in-out infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
