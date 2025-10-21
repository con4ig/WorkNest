import Navbar from './components/Navbar.jsx';
import demo from './assets/demo.png';
import { Link } from 'react-router-dom';
import {
    Zap,
    Users,
    TrendingUp,
    CheckCircle,
    Quote,
    Rocket,
    ShieldCheck,
} from 'lucide-react';

function App() {
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
            icon: TrendingUp,
        },
    ];

    // Przywrócono pierwotne, większe wartości
    const stats = [
        { value: '15k+', label: 'Aktywnych Użytkowników' },
        { value: '70k+', label: 'Pomyślnie Zarządzanych Projektów' },
        { value: '99.8%', label: 'Wskaźnik Zadowolenia Klientów' },
    ];

    const finalCtaButton =
        'px-12 py-4 text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-2xl shadow-emerald-500/50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.03]';

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Navbar pozostaje bez zmian (przyjmujemy, że jest już w stylu Emerald/Teal z poprzedniego kroku) */}
            <Navbar />

            <div className="relative overflow-hidden pt-12">
                {/* Bajeranckie Tło (Green/Teal) */}
                <div className="absolute inset-0 z-0 opacity-50">
                    <div className="absolute right-0 top-0 h-[450px] w-[450px] -translate-y-1/3 translate-x-1/3 transform rounded-full bg-emerald-200/50 blur-[150px]" />
                    <div className="absolute bottom-0 left-0 h-[550px] w-[550px] -translate-x-1/2 translate-y-1/2 transform rounded-full bg-teal-200/50 blur-[180px]" />
                </div>

                {/* Główna zawartość */}
                <main className="container relative z-10 mx-auto px-4 py-16 lg:py-24">
                    {/* 1. Sekcja Hero - PRZYWRÓCONY DUŻY NAGŁÓWEK */}
                    <div className="mx-auto mb-24 max-w-7xl text-center">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
                            SYSTEM HR NEXT-GEN
                        </p>
                        {/* PRZYWRÓCONO: text-7xl lg:text-8xl */}
                        <h1 className="mb-8 text-7xl font-extrabold leading-tight tracking-tighter text-gray-900 lg:text-8xl">
                            Odkryj nowy wymiar
                            <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                efektywności w Twoim HR
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-3xl text-xl font-light text-gray-600 lg:text-2xl">
                            Zarządzaj zespołem, automatyzuj procesy i osiągaj
                            cele strategiczne — kompleksowe narzędzie, które
                            rewolucjonizuje pracę w Twojej organizacji.
                        </p>
                        <div className="flex justify-center gap-6">
                            <button className="transform rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.03] hover:from-emerald-700 hover:to-teal-700">
                                <CheckCircle className="mr-2 inline-block h-5 w-5" />
                                Rozpocznij Bezpłatny Okres Próbny
                            </button>
                            <button className="rounded-xl border-2 border-emerald-200 bg-white px-10 py-4 text-lg font-bold text-emerald-600 shadow-lg transition-colors duration-300 hover:bg-emerald-50">
                                Zobacz demo
                            </button>
                        </div>
                    </div>

                    {/* 2. Sekcja Statystyk - PRZYWRÓCONE DUŻE CYFRY */}
                    <div className="mb-32 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-9 shadow-2xl shadow-emerald-600/40">
                        <div className="grid gap-8 divide-x divide-emerald-500 text-center md:grid-cols-3">
                            {stats.map((stat, index) => (
                                <div key={index} className="px-6">
                                    {/* PRZYWRÓCONO: text-6xl */}
                                    <div className="mb-2 text-3xl font-extrabold tracking-tighter text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-lg font-medium text-emerald-200">
                                        {stat.label}
                                    </div>
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

                    {/* 5. Sekcja Zaufania / Testimoniale */}
                    <div className="mb-32 rounded-3xl border border-gray-100 bg-white p-12 shadow-xl">
                        <div className="mx-auto mb-12 max-w-4xl text-center">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
                                CO MÓWIĄ NASI KLIENCI?
                            </p>
                            <h2 className="text-4xl font-bold text-gray-900">
                                Zaufaj liderom branży
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Testimonial 1 */}
                            <div className="rounded-2xl border border-emerald-100 bg-gray-50 p-6 shadow-inner">
                                <Quote className="mb-4 h-8 w-8 text-emerald-400" />
                                <p className="mb-4 text-xl italic text-gray-700">
                                    "Wdrożenie WorkNest skróciło czas
                                    onboardingu o 40%. Interfejs jest
                                    intuicyjny, a wsparcie techniczne na
                                    najwyższym poziomie."
                                </p>
                                <div className="font-semibold text-gray-900">
                                    - Anna Kowalska, Dyrektor HR w TechCorp
                                </div>
                            </div>

                            {/* Testimonial 2 */}
                            <div className="rounded-2xl border border-emerald-100 bg-gray-50 p-6 shadow-inner">
                                <Quote className="mb-4 h-8 w-8 text-emerald-400" />
                                <p className="mb-4 text-xl italic text-gray-700">
                                    "Przejrzyste raporty analityczne pozwalają
                                    nam podejmować lepsze decyzje. To narzędzie,
                                    które faktycznie napędza produktywność
                                    zespołu."
                                </p>
                                <div className="font-semibold text-gray-900">
                                    - Piotr Nowak, Menedżer Projektów w
                                    GlobalSoft
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6. Sekcja Końcowego Wezwania do Akcji (Final CTA) */}
                    <div className="rounded-3xl border-4 border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 py-20 text-center shadow-2xl shadow-emerald-200/50">
                        <Rocket className="mx-auto mb-6 h-12 w-12 text-emerald-600" />
                        <h2 className="mb-4 text-5xl font-extrabold text-gray-900">
                            Gotowy na rewolucję w zarządzaniu HR?
                        </h2>
                        <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-600">
                            Dołącz do tysięcy firm, które już dziś zwiększają
                            swoją efektywność z WorkNest.
                        </p>
                        <button className={finalCtaButton}>
                            <CheckCircle className="mr-2 inline-block h-6 w-6" />
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

export default App;
