import Navbar from '../components/Navbar.jsx';
import demo from '../assets/demo.png';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

function Landing() {
    const features = [
        {
            title: 'Zarządzanie Projektami',
            description:
                'Intuicyjne narzędzia do planowania, przypisywania zadań i śledzenia postępów w czasie rzeczywistym.',
            icon: Zap,
        },
        {
            title: 'Współpraca Zespołowa',
            description:
                'Komunikacja, udostępnianie dokumentów i wymiana wiedzy w jednym, zorganizowanym hubie.',
            icon: Users,
        },
        {
            title: 'Analityka i Raporty',
            description:
                'Szczegółowe statystyki wydajności i wizualne raporty do optymalizacji procesów HR.',
            icon: Play,
        },
    ];

    const values = [
        {
            value: 'Intuicyjność',
            label: 'Prosty interfejs bez skomplikowanego wdrożenia',
            icon: Layout,
        },
        {
            value: 'Szybkość',
            label: 'Błyskawiczne działanie i natychmiastowe aktualizacje',
            icon: Zap,
        },
        {
            value: 'Bezpieczeństwo',
            label: 'Twoje dane są chronione nowoczesnymi standardami',
            icon: Lock,
        },
    ];

    const finalCtaButton =
        'px-12 py-4 text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-2xl shadow-emerald-500/50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.03]';

    return (
        <div className="min-h-screen bg-gray-50/50">
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
                    <div className="mx-auto mb-16 max-w-7xl px-4 text-center md:mb-24">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600 md:text-sm">
                            SYSTEM HR NEXT-GEN
                        </p>
                        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tighter text-gray-900 sm:text-5xl md:mb-8 md:text-6xl lg:text-7xl xl:text-8xl">
                            Odkryj nowy wymiar
                            <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                efektywności w Twoim HR
                            </span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-3xl px-4 text-base font-light text-gray-600 sm:text-lg md:mb-10 md:text-xl lg:text-2xl">
                            Zarządzaj zespołem, automatyzuj procesy i osiągaj
                            cele strategiczne — kompleksowe narzędzie, które
                            rewolucjonizuje pracę w Twojej organizacji.
                        </p>
                        <div className="flex flex-col justify-center gap-4 px-4 sm:flex-row md:gap-6">
                            <button className="transform rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-base font-bold text-white shadow-2xl shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.03] hover:from-emerald-700 hover:to-teal-700 md:px-10 md:py-4 md:text-lg">
                                <CheckCircle className="mr-2 inline-block h-4 w-4 md:h-5 md:w-5" />
                                Rozpocznij Bezpłatny Okres Próbny
                            </button>
                            <button className="rounded-xl border-2 border-emerald-200 bg-white px-6 py-3 text-base font-bold text-emerald-600 shadow-lg transition-colors duration-300 hover:bg-emerald-50 md:px-10 md:py-4 md:text-lg">
                                Zobacz demo
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
                                    PŁYNNA INTEGRACJA
                                </p>
                                <h2 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
                                    Zautomatyzuj HR i skup się na rozwoju
                                </h2>
                                <p className="mb-8 text-xl text-gray-600">
                                    WorkNest to nie tylko narzędzie, to Twój
                                    cyfrowy asystent. Uprość onboarding,
                                    zarządzanie urlopami i ocenę wydajności
                                    dzięki intuicyjnemu interfejsowi.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Szybki dostęp do danych pracownika',
                                        'Bezpieczne przechowywanie dokumentacji',
                                        'Automatyczne powiadomienia i alerty',
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
                                    <div className="flex aspect-video items-center justify-center rounded-xl border-4 border-emerald-500/20 bg-gray-100">
                                        <img src={demo} alt="demo photo" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Sekcja Funkcji - Grid Cards */}
                    <div className="mx-auto mb-16 max-w-4xl text-center">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
                            KLUCZOWE NARZĘDZIA
                        </p>
                        <h2 className="text-4xl font-bold text-gray-900">
                            Wszystko, czego potrzebuje Twój HR
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
                                PROSTY PROCES
                            </p>
                            <h2 className="text-4xl font-bold text-gray-900">
                                Zacznij w 3 prostych krokach
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="relative rounded-2xl border border-emerald-50 bg-gray-50/50 p-8 text-center transition-all hover:bg-white hover:shadow-lg">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                                    1
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">Utwórz konto</h3>
                                <p className="text-gray-600">
                                    Zarejestruj swoją firmę w mniej niż minutę. Bez zbędnych formalności i kart kredytowych na start.
                                </p>
                            </div>
                            <div className="relative rounded-2xl border border-emerald-50 bg-gray-50/50 p-8 text-center transition-all hover:bg-white hover:shadow-lg">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                                    2
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">Zaproś zespół</h3>
                                <p className="text-gray-600">
                                    Dodaj pracowników i przypisz im role. Stwórz strukturę, która odpowiada Twojej organizacji.
                                </p>
                            </div>
                            <div className="relative rounded-2xl border border-emerald-50 bg-gray-50/50 p-8 text-center transition-all hover:bg-white hover:shadow-lg">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                                    3
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">Zarządzaj projektami</h3>
                                <p className="text-gray-600">
                                    Twórz tablice Kanban, śledź postępy i ciesz się zorganizowaną pracą od pierwszego dnia.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 6. Sekcja Końcowego Wezwania do Akcji (Final CTA) */}
                    <div className="mx-4 rounded-2xl border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-12 text-center shadow-2xl shadow-emerald-200/50 md:rounded-3xl md:border-4 md:py-20">
                        <Rocket className="mx-auto mb-4 h-8 w-8 text-emerald-600 md:mb-6 md:h-12 md:w-12" />
                        <h2 className="mb-4 px-4 text-3xl font-extrabold text-gray-900 md:text-4xl lg:text-5xl">
                            Gotowy na rewolucję w zarządzaniu HR?
                        </h2>
                        <p className="mx-auto mb-8 max-w-3xl px-4 text-base text-gray-600 md:mb-10 md:text-lg lg:text-xl">
                            Dołącz do tysięcy firm, które już dziś zwiększają
                            swoją efektywność z WorkNest.
                        </p>
                        <button className="transform rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-lg font-bold text-white shadow-2xl shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.03] hover:from-emerald-600 hover:to-teal-600 md:px-12 md:py-4 md:text-xl">
                            <CheckCircle className="mr-2 inline-block h-5 w-5 md:h-6 md:w-6" />
                            Rozpocznij Test Już Teraz!
                        </button>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="mt-16 bg-gray-800 py-8">
                <div className="container mx-auto px-4 text-center text-gray-400">
                    <p>
                        &copy; {new Date().getFullYear()} WorkNest. Wszelkie
                        prawa zastrzeżone.
                    </p>
                    <div className="mt-2 text-sm">
                        <Link
                            to="/polityka-prywatnosci"
                            className="mx-2 hover:text-emerald-400"
                        >
                            Polityka Prywatności
                        </Link>
                        <span className="text-gray-600">|</span>
                        <Link
                            to="/regulamin"
                            className="mx-2 hover:text-emerald-400"
                        >
                            Regulamin
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
