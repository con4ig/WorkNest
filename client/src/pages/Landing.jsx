import Navbar from '../components/Navbar.jsx';
import demo from '../assets/demo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation, Trans } from 'react-i18next';
import {
    Zap,
    Users,
    Quote,
    Rocket,
    ShieldCheck,
    Layout,
    CheckCircle,
    Play,
    Clock,
    Lock,
    Loader2,
} from 'lucide-react';

function Landing() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { demoLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const features = [
        {
            title: t('landing.features.Management.Title'),
            description: t('landing.features.Management.Desc'),
            icon: Zap,
        },
        {
            title: t('landing.features.Collaboration.Title'),
            description: t('landing.features.Collaboration.Desc'),
            icon: Users,
        },
        {
            title: t('landing.features.Analytics.Title'),
            description: t('landing.features.Analytics.Desc'),
            icon: Play,
        },
    ];

    const values = [
        {
            value: t('landing.values.Intuitive.Title'),
            label: t('landing.values.Intuitive.Desc'),
            icon: Layout,
        },
        {
            value: t('landing.values.Fast.Title'),
            label: t('landing.values.Fast.Desc'),
            icon: Zap,
        },
        {
            value: t('landing.values.Secure.Title'),
            label: t('landing.values.Secure.Desc'),
            icon: Lock,
        },
    ];

    const finalCtaButton =
        'px-12 py-4 text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-2xl shadow-emerald-500/50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.03]';

    return (
        <div className="min-h-screen bg-gray-50/50 select-none">
            {/* Navbar pozostaje bez zmian (przyjmujemy, że jest już w stylu Emerald/Teal z poprzedniego kroku) */}
            <Navbar />

            <div className="relative overflow-hidden pt-12">
                <div className="absolute inset-0 z-0 opacity-50">
                    <div className="absolute right-0 top-0 h-[450px] w-[450px] -translate-y-1/3 translate-x-1/3 transform rounded-full bg-emerald-200/50 blur-[150px]" />
                    <div className="absolute bottom-0 left-0 h-[550px] w-[550px] -translate-x-1/2 translate-y-1/2 transform rounded-full bg-teal-200/50 blur-[180px]" />
                </div>

                {/* Główna zawartość */}
                <main className="container relative z-10 mx-auto px-4 py-16 lg:py-24">
                    {/* 1. Sekcja Hero - PRZYWRÓCONY DUŻY NAGŁÓWEK */}
                    <div className="mx-auto mb-16 max-w-screen-2xl px-4 text-center md:mb-24">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600 md:text-sm">
                            {t('landing.hero.Badge')}
                        </p>
                        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tighter text-gray-900 sm:text-4xl md:mb-8 md:text-6xl lg:text-7xl xl:text-8xl">
                            <Trans i18nKey="landing.hero.Title">
                                Odkryj nowy wymiar
                                <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                    efektywności w Twoim HR
                                </span>
                            </Trans>
                        </h1>
                        <p className="mx-auto mb-8 max-w-3xl px-4 text-base font-light text-gray-600 sm:text-lg md:mb-10 md:text-xl lg:text-2xl">
                            {t('landing.hero.Subtitle')}
                        </p>
                        <div className="flex justify-center px-4">
                            <button
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        await demoLogin();
                                        navigate('/dashboard');
                                    } catch (err) {
                                        toast.error('Błąd logowania do demo');
                                        console.error(err);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 transform rounded-xl px-8 py-3 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 md:px-10 md:py-4 md:text-lg ${
                                    isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.03] hover:from-emerald-700 hover:to-teal-700'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {t('landing.hero.Loading')}
                                    </>
                                ) : (
                                    t('landing.hero.Cta')
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 2. Sekcja Wartości (Zamiast statystyk) */}
                    <div className="mx-4 mb-16 rounded-2xl bg-white border border-gray-100 p-6 shadow-xl shadow-emerald-100/50 md:mb-32 md:rounded-3xl md:p-9">
                        <div className="grid gap-6 divide-y divide-gray-100 text-center md:grid-cols-3 md:gap-8 md:divide-x md:divide-y-0">
                            {values.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center px-4 py-4 md:px-6 md:py-0"
                                >
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                                        {item.value}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-500 md:text-base">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Sekcja Wizualna / Feature Spotlight */}
                    <div className="mb-32 py-16">
                        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row">
                            {/* Opis */}
                            <div className="text-left lg:w-1/2">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal-600">
                                    {t('landing.integration.Badge')}
                                </p>
                                <h2 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
                                    {t('landing.integration.Title')}
                                </h2>
                                <p className="mb-8 text-xl text-gray-600">
                                    {t('landing.integration.Desc')}
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        t('landing.integration.List.1'),
                                        t('landing.integration.List.2'),
                                        t('landing.integration.List.3'),
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start text-lg text-gray-700"
                                        >
                                            <ShieldCheck className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-emerald-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Mockup / Zrzut ekranu (symulacja) */}
                            <div className="relative p-4 lg:w-1/2">
                                <div className="absolute inset-0 -rotate-2 scale-105 transform rounded-3xl bg-gradient-to-br from-emerald-100/50 to-teal-100/50 shadow-xl"></div>
                                <div className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl">
                                    <div className="mb-6 flex items-center justify-between">
                                        <span className="text-xl font-semibold text-gray-900">
                                            Panel Zarządzania
                                        </span>
                                        <div className="h-3 w-16 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border-4 border-emerald-500/20 bg-gray-100">
                                        <img
                                            src={demo}
                                            alt="demo photo"
                                            className="h-auto w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Sekcja Funkcji - Grid Cards */}
                    <div className="mx-auto mb-16 max-w-4xl text-center">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
                            {t('landing.features.Title')}
                        </p>
                        <h2 className="text-4xl font-bold text-gray-900">
                            {t('landing.features.Subtitle')}
                        </h2>
                    </div>
                    <div className="mx-auto mb-32 grid max-w-7xl gap-8 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="transform rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-300/50"
                            >
                                {/* Ikona w eleganckim kółku */}
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-200/50 bg-emerald-50">
                                    <feature.icon className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                                    {feature.title}
                                </h2>
                                <p className="text-base text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* 5. Sekcja "Jak to działa" (Zamiast opinii) */}
                    <div className="mb-32 rounded-3xl border border-gray-100 bg-white p-12 shadow-xl">
                        <div className="mx-auto mb-12 max-w-4xl text-center">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
                                {t('landing.howItWorks.Badge')}
                            </p>
                            <h2 className="text-4xl font-bold text-gray-900">
                                {t('landing.howItWorks.Title')}
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="relative rounded-2xl border border-emerald-50 bg-gray-50/50 p-8 text-center transition-all hover:bg-white hover:shadow-lg">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                                    1
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">{t('landing.howItWorks.Step1.Title')}</h3>
                                <p className="text-gray-600">
                                    {t('landing.howItWorks.Step1.Desc')}
                                </p>
                            </div>
                            <div className="relative rounded-2xl border border-emerald-50 bg-gray-50/50 p-8 text-center transition-all hover:bg-white hover:shadow-lg">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                                    2
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">{t('landing.howItWorks.Step2.Title')}</h3>
                                <p className="text-gray-600">
                                    {t('landing.howItWorks.Step2.Desc')}
                                </p>
                            </div>
                            <div className="relative rounded-2xl border border-emerald-50 bg-gray-50/50 p-8 text-center transition-all hover:bg-white hover:shadow-lg">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                                    3
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">{t('landing.howItWorks.Step3.Title')}</h3>
                                <p className="text-gray-600">
                                    {t('landing.howItWorks.Step3.Desc')}
                                </p>
                            </div>
                        </div>
                </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="mt-16 bg-gray-800 py-8">
                <div className="container mx-auto px-4 text-center text-gray-400">
                    <p>
                        &copy; {new Date().getFullYear()} WorkNest. {t('landing.footer.Rights')}
                    </p>
                    <div className="mt-2 text-sm">
                        <Link
                            to="/polityka-prywatnosci"
                            className="mx-2 hover:text-emerald-400"
                        >
                            {t('landing.footer.Privacy')}
                        </Link>
                        <span className="text-gray-600">|</span>
                        <Link
                            to="/regulamin"
                            className="mx-2 hover:text-emerald-400"
                        >
                            {t('landing.footer.Terms')}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
