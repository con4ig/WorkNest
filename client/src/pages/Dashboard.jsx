import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api.js';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    ChartLine,
    Home,
    CalendarCheck,
    ChevronRight,
    ChevronLeft,
    Key,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    PieChart,
    Pie,
    YAxis,
} from 'recharts';

import moment from 'moment';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useAuth } from '../context/AuthContext';
import { translateRole } from '../utils/translations.js';

// Funkcja do obsługi polskich form liczby mnogiej
function polishPlural(n, singular, few, many) {
    if (n === 1) return singular;
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return many;
    if (lastDigit >= 2 && lastDigit <= 4) return few;
    return many;
}

// Konfiguracja polskiej lokalizacji dla moment.js
moment.updateLocale('pl', {
    relativeTime: {
        future: 'za %s',
        past: '%s temu',
        s: 'kilka sekund',
        ss: '%d sekund',
        m: 'minutę',
        mm: function (number) {
            return (
                number + ' ' + polishPlural(number, 'minuta', 'minuty', 'minut')
            );
        },
        h: 'godzinę',
        hh: function (number) {
            return (
                number +
                ' ' +
                polishPlural(number, 'godzina', 'godziny', 'godzin')
            );
        },
        d: 'dzień',
        dd: function (number) {
            return number + ' ' + polishPlural(number, 'dzień', 'dni', 'dni');
        },
        M: 'miesiąc',
        MM: function (number) {
            return (
                number +
                ' ' +
                polishPlural(number, 'miesiąc', 'miesiące', 'miesięcy')
            );
        },
        y: 'rok',
        yy: function (number) {
            return number + ' ' + polishPlural(number, 'rok', 'lata', 'lat');
        },
    },
});
moment.locale('pl');

const Icon = {
    Dashboard: () => <LayoutDashboard className="h-5 w-5" />,
    Projects: () => <FolderKanban className="h-5 w-5" />,
    Users: () => <Users className="h-5 w-5" />,
    Analytics: () => <ChartLine className="h-5 w-5" />,
    Home: () => <Home className="h-5 w-5" />,
    Check: () => <CalendarCheck className="h-5 w-5" />,
    ChevronRight: () => <ChevronRight className="h-5 w-5" />,
    ChevronLeft: () => <ChevronLeft className="h-5 w-5" />,
    Key: () => <Key className="h-4 w-4" />,
};

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [stats, setStats] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [profileImage, setProfileImage] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { user, logout } = useAuth();
    const [weeklyActivity, setWeeklyActivity] = useState([]);
    // Wykrywanie rozmiaru ekranu
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Połączona funkcja do pobierania wszystkich danych
    const fetchDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Dane użytkownika są już w 'user' z AuthContext
            setMessage(
                `Witaj, ${user.username}! Masz szybki przegląd ostatnich projektów.`,
            );
            setUsername(user.username);
            setRole(user.role);
            setProfileImage(user.profileImage);

            const companyId = user.company?._id;
            if (!companyId) {
                setLoading(false);
                return;
            }

            // Pobieranie wszystkich danych równolegle
            const dataPromises = [
                api.get('/projects', {
                    params: {
                        sortBy: 'createdAt:desc',
                        limit: 4,
                        company: companyId,
                        isArchived: 'false',
                    },
                }),
                api.get('/projects/stats/weekly-activity', {
                    params: { company: companyId },
                }),
            ];

            if (user.role === 'admin' || user.role === 'hr' || user.role === 'superadmin') {
                dataPromises.push(api.get(`/projects/stats/summary`, {
                    params: { company: companyId },
                }));
            } else {
                dataPromises.push(api.get(`/projects/users/${user._id}/assigned-projects/summary`, {
                    params: { company: companyId },
                }));
            }

            const [projectsRes, activityRes, statsRes] = await Promise.all(dataPromises);



            // Ustaw statystyki
            if (user.role === 'admin' || user.role === 'hr' || user.role === 'superadmin') {
                const { total, running, pending, completed } = statsRes.data;
                setStats([
                    { id: 1, title: 'Wszystkie Projekty', value: total.toString() },
                    { id: 2, title: 'Zakończone Projekty', value: completed.toString() },
                    { id: 3, title: 'W trakcie', value: running.toString() },
                    { id: 4, title: 'Oczekujące', value: pending.toString() },
                ]);
            } else {
                const { assigned, completed, running, pending } = statsRes.data;
                setStats([
                    { id: 1, title: 'Moje Projekty', value: assigned.toString() },
                    { id: 2, title: 'Zakończone', value: completed.toString() },
                    { id: 3, title: 'W Trakcie', value: running.toString() },
                    { id: 4, title: 'Oczekujące', value: pending.toString() },
                ]);
            }

            setProjects(projectsRes.data.projects);

            // Przetwarzanie danych aktywności, aby pokazać bieżący tydzień roboczy (Pon-Pt)
            const rawActivity = activityRes.data;
            const activityMap = rawActivity.reduce((acc, item) => {
                acc[item.date] = item.count;
                return acc;
            }, {});

            const processedWeeklyData = [];
            const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt'];
            const today = new Date();
            const dayOfWeek = today.getDay();
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - daysToSubtract);
            startOfWeek.setHours(0, 0, 0, 0);

            for (let i = 0; i < 5; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);

                const year = day.getFullYear();
                const month = String(day.getMonth() + 1).padStart(2, '0');
                const date = String(day.getDate()).padStart(2, '0');
                const dayString = `${year}-${month}-${date}`;

                processedWeeklyData.push({
                    day: dayNames[i],
                    fullDate: dayString,
                    val: activityMap[dayString] || 0,
                });
            }
            setWeeklyActivity(processedWeeklyData);
        
        } catch {
            // Silent error handling
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);



    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return <LoadingScreen message="Przygotowujemy Twój pulpit..." />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Overlay dla mobile gdy sidebar otwarty */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 z-10 bg-black bg-opacity-50"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex">
                <aside
                    className={`${isSidebarOpen ? 'w-64' : isMobile ? '-translate-x-full' : 'w-20'} ${isMobile ? 'fixed' : 'fixed'} z-20 h-screen overflow-hidden bg-white shadow-lg transition-all duration-300`}
                >
                    <div className="flex h-full flex-col p-6">
                        <div className="mb-8">
                            {!isMobile && !isSidebarOpen ? (
                                /* Zwinięty sidebar (desktop) - TYLKO strzałka */
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="text-gray-500 transition hover:text-gray-700"
                                        title="Rozwiń menu"
                                    >
                                        <Icon.ChevronRight />
                                    </button>
                                </div>
                            ) : (
                                /* Rozwinięty sidebar - Avatar + username + strzałka */
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
                                                alt="Avatar"
                                                className="h-10 w-10 cursor-pointer rounded-full object-cover"
                                                onClick={() =>
                                                    navigate('/upload')
                                                }
                                            />
                                        ) : (
                                            <div
                                                onClick={() =>
                                                    navigate('/upload')
                                                }
                                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
                                            >
                                                {username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        {/* Username i role */}
                                        <div>
                                            <div className="font-semibold">
                                                {username}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {translateRole(role)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strzałka do zwijania - tylko desktop */}
                                    {!isMobile && (
                                        <button
                                            onClick={() =>
                                                setIsSidebarOpen(false)
                                            }
                                            className="text-gray-500 transition hover:text-gray-700"
                                            title="Zwiń menu"
                                        >
                                            <Icon.ChevronLeft />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Reszta sidebaru bez zmian... */}
                        <nav className="flex-1">
                            <ul className="space-y-2">
                                {/* Dashboard */}
                                <li
                                    onClick={() => {
                                        navigate('/dashboard');
                                        if (isMobile) setIsSidebarOpen(false);
                                    }}
                                    className={`flex cursor-pointer items-center rounded-lg transition-colors ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-0'} ${location.pathname === '/dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} py-3`}
                                >
                                    <Icon.Dashboard />
                                    {isSidebarOpen && (
                                        <span className="font-medium">
                                            Dashboard
                                        </span>
                                    )}
                                </li>

                                {/* Projekty */}
                                <li
                                    onClick={() => {
                                        navigate('/projekty');
                                        if (isMobile) setIsSidebarOpen(false);
                                    }}
                                    className={`flex cursor-pointer items-center rounded-lg transition-colors ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-0'} ${location.pathname.startsWith('/projekty') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} py-3`}
                                >
                                    <Icon.Projects />
                                    {isSidebarOpen && (
                                        <span className="font-medium">
                                            Projekty
                                        </span>
                                    )}
                                </li>

                                {/* Zespół */}
                                {(role === 'hr' || role === 'admin') && (
                                    <li
                                        onClick={() => {
                                            navigate('/employees');
                                            if (isMobile)
                                                setIsSidebarOpen(false);
                                        }}
                                        className={`flex cursor-pointer items-center rounded-lg transition-colors ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-0'} ${location.pathname.startsWith('/employees') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} py-3`}
                                    >
                                        <Icon.Users />
                                        {isSidebarOpen && (
                                            <span className="font-medium">
                                                Zespół
                                            </span>
                                        )}
                                    </li>
                                )}

                                {/* Zatwierdzanie Urlopów */}
                                {(role === 'hr' || role === 'admin') && (
                                    <li
                                        onClick={() => {
                                            navigate('/leave-approvals');
                                            if (isMobile)
                                                setIsSidebarOpen(false);
                                        }}
                                        className={`flex cursor-pointer items-center rounded-lg transition-colors ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-0'} ${location.pathname.startsWith('/leave-approvals') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} py-3`}
                                    >
                                        <Icon.Check />
                                        {isSidebarOpen && (
                                            <span className="font-medium">
                                                Zatwierdzanie Urlopów
                                            </span>
                                        )}
                                    </li>
                                )}

                                {/* Rejestracja Urlopu */}
                                {(role === 'employee' || role === 'hr') && (
                                    <li
                                        onClick={() => {
                                            navigate('/myleaves');
                                            if (isMobile)
                                                setIsSidebarOpen(false);
                                        }}
                                        className={`flex cursor-pointer items-center rounded-lg transition-colors ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-0'} ${location.pathname.startsWith('/myleaves') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} py-3`}
                                    >
                                        <Icon.Check />
                                        {isSidebarOpen && (
                                            <span className="font-medium">
                                                Rejestracja Urlopu
                                            </span>
                                        )}
                                    </li>
                                )}

                                {/* Home */}
                                <li
                                    onClick={() => {
                                        navigate('/');
                                        if (isMobile) setIsSidebarOpen(false);
                                    }}
                                    className={`flex cursor-pointer items-center rounded-lg transition-colors ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-0'} ${location.pathname === '/' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'} py-3`}
                                >
                                    <Icon.Home />
                                    {isSidebarOpen && (
                                        <span className="font-medium">
                                            Strona główna
                                        </span>
                                    )}
                                </li>
                            </ul>
                        </nav>

                        <div className="mt-auto">
                            {isSidebarOpen && (
                                <button
                                    onClick={handleLogout}
                                    className="w-full rounded-lg bg-red-50 px-4 py-3 text-left text-sm text-red-700 transition-colors hover:bg-red-100"
                                >
                                    Wyloguj
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main content wrapper */}
                <div
                    className={`flex h-screen w-full flex-col transition-all duration-300 ${isMobile ? 'pl-0' : isSidebarOpen ? 'pl-64' : 'pl-20'}`}
                >
                    {/* Topbar */}
                    <div className="sticky top-0 z-10 w-full bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 py-4 md:px-8">
                            <div className="flex items-center gap-3">
                                {/* Hamburger menu na mobile */}
                                {isMobile && (
                                    <button
                                        onClick={() =>
                                            setIsSidebarOpen(!isSidebarOpen)
                                        }
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    </button>
                                )}
                                <div>
                                    <h1 className="text-xl font-bold md:text-2xl">
                                        Dashboard
                                    </h1>
                                    <p className="hidden text-xs text-gray-500 sm:block md:text-sm">
                                        {message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 md:gap-6">
                                {role === 'admin' && (
                                    <button
                                        onClick={() =>
                                            navigate('/generate-code')
                                        }
                                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white shadow-sm transition-colors hover:bg-blue-700 md:px-5"
                                    >
                                        <Icon.Key />
                                        <span className="hidden text-sm sm:inline">
                                            Generuj Kod
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Page content */}
                    <main className="flex-grow overflow-y-auto">
                        <div className="grid grid-cols-1 gap-4 p-4 md:gap-4 md:p-6 lg:grid-cols-12">
                            {/* Stats big card */}
                            <div className="flex flex-col gap-4 md:gap-4 lg:col-span-8">
                                <div className="flex max-h-36 items-start justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white shadow-lg md:p-6">
                                    <div>
                                        <div className="text-xs opacity-90 md:text-sm">
                                            {stats[0]?.title ||
                                                'Wszystkie Projekty'}
                                        </div>
                                        <div className="mt-2 min-h-[48px] text-3xl font-bold md:text-4xl">
                                            {stats[0]?.value || '0'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-4">
                                    {/* Stat 2 */}
                                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                                        <div className="text-xs text-gray-500">
                                            {stats[1]?.title ||
                                                'Zakończone Projekty'}
                                        </div>
                                        <div className="text mt-2 min-h-[28px] font-semibold md:text-xl">
                                            {stats[1]?.value || '0'}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-400 md:text-sm">
                                            {stats[1]?.hint}
                                        </div>
                                    </div>

                                    {/* Stat 3 */}
                                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                                        <div className="text-xs text-gray-500">
                                            {stats[2]?.title || 'W trakcie'}
                                        </div>
                                        <div className="text mt-2 min-h-[28px] font-semibold md:text-xl">
                                            {stats[2]?.value || '0'}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-400 md:text-sm">
                                            {stats[2]?.hint}
                                        </div>
                                    </div>

                                    {/* Stat 4 */}
                                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                                        <div className="text-xs text-gray-500">
                                            {stats[3]?.title || 'Oczekujące'}
                                        </div>
                                        <div className="text mt-2 min-h-[28px] font-semibold md:text-xl">
                                            {stats[3]?.value || '0'}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-400 md:text-sm">
                                            {stats[3]?.hint}
                                        </div>
                                    </div>
                                </div>

                                {/* Weekly Activity Chart */}
                                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
                                    <div className="mb-4">
                                        <div className="text-base font-medium">
                                            Aktywność w ostatnim tygodniu
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Nowo dodane projekty
                                        </div>
                                    </div>
                                    <div className="h-40 w-full">
                                        {weeklyActivity.length === 0 ? (
                                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                                Brak danych do wykresu
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={weeklyActivity}
                                                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} />
                                                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickCount={6} interval={0} />
                                                    <Tooltip
                                                        cursor={{ fill: 'rgba(52, 211, 153, 0.2)' }}
                                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                                                        labelStyle={{ fontWeight: 'bold' }}
                                                        formatter={(value) => [value, 'Nowe projekty']}
                                                        labelFormatter={(label) => {
                                                            const item = weeklyActivity.find((d) => d.day === label);
                                                            return item ? moment(item.fullDate).format('DD MMM YYYY') : label;
                                                        }}
                                                    />
                                                    <Bar dataKey="val" fill="#34d399" radius={[10, 10, 0, 0]} barSize={120} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <aside className="space-y-4 md:space-y-4 lg:col-span-4">
                                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="text-sm font-medium md:text-base">
                                            Przypomnienia
                                        </div>
                                        <button className="text-xs text-emerald-600">
                                            Zobacz wszystkie
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Spotkanie z firmą Arc
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">
                                        02:00 pm - 04:00 pm
                                    </div>
                                    <div className="mt-4">
                                        <button className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white sm:w-auto">
                                            Rozpocznij Spotkanie
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="text-sm font-medium md:text-base">
                                            Postęp Projektu
                                        </div>
                                        <div className="text-xs text-gray-400 md:text-sm">
                                            Ogólnie
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">                                        
                                        <div className="relative h-24 w-24">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Completed', value: Number(stats[1]?.value || 0) },
                                                            { name: 'Other', value: Number(stats[0]?.value || 0) - Number(stats[1]?.value || 0) }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        dataKey="value"
                                                        innerRadius="70%"
                                                        outerRadius="100%"
                                                        startAngle={90}
                                                        endAngle={450}
                                                        stroke="none"
                                                        fill="#10B981"
                                                    >
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                                                {stats[0]?.value > 0 ? `${Math.round((stats[1]?.value / stats[0]?.value) * 100)}%` : '0%'}
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                Zakończone: <strong>{stats[1]?.value || '0'}</strong>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-gray-500">
                                                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                                W Trakcie
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-gray-500">
                                                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                                                Oczekujące
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ostatnio dodane projekty lub Moje aktywności */}
                                {(role === 'hr' || role === 'admin') &&
                                projects.length > 0 ? (
                                    <div className="rounded-xl bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="text-base font-medium">
                                                Ostatnio dodane projekty
                                            </div>
                                            <button
                                                onClick={() =>
                                                    navigate('/projekty')
                                                }
                                                className="text-xs text-emerald-600"
                                            >
                                                Zobacz wszystkie →
                                            </button>
                                        </div>
                                        <ul className="space-y-3">
                                            {projects.map((project) => (
                                                <li
                                                    key={project._id}
                                                    className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
                                                    onClick={() =>
                                                        navigate(
                                                            `/projects/${project._id}`,
                                                        )
                                                    }
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-medium">
                                                            {project.name}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            Dodano{' '}
                                                            {moment(
                                                                project.createdAt,
                                                            ).fromNow()}
                                                        </div>
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-400">
                                                        →
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </aside>
                        </div>
                    </main>
                    <footer className="flex-shrink-0 p-3 text-center text-xs text-gray-400 md:text-sm">
                        © {new Date().getFullYear()} WorkNest — Wszelkie prawa
                        zastrzeżone
                    </footer>
                </div>
            </div>
        </div>
    );
}
