import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ListFilter, RefreshCcw, Trash2, ArrowLeft, FolderKanban, MoreVertical } from 'lucide-react'; // Dodano MoreVertical dla menu akcji na mobilnych

const API_BASE_URL = 'http://localhost:5500/api';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// --- Style i dane pomocnicze (bez zmian) ---
const statusStyles = {
    pending: { text: 'text-yellow-800', bg: 'bg-yellow-100', label: 'Oczekujący' },
    running: { text: 'text-sky-800', bg: 'bg-sky-100', label: 'W Trakcie' },
    completed: { text: 'text-emerald-800', bg: 'bg-emerald-100', label: 'Ukończony' },
    'on-hold': { text: 'text-red-800', bg: 'bg-red-100', label: 'Wstrzymany' },
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- Custom Hook (bez zmian) ---
const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProjects = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/projects', { params });
            setProjects(response.data.projects);
        } catch (err) {
            console.error('Błąd ładowania projektów:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            } else {
                setError('Nie udało się załadować listy projektów.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    return { projects, setProjects, isLoading, error, fetchProjects };
};

// --- Komponenty UI (Zaktualizowane o responsywność) ---

const ProjectListHeader = () => {
    const navigate = useNavigate();
    return (
        // ZMIANA: Dodano responsywne paddingi i układ
        <header className="bg-white shadow-sm sticky top-0 z-10 mb-6 md:mb-8 rounded-2xl">
            <div className="max-w-8xl mx-auto px-4 py-4 md:px-8 md:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            {/* ZMIANA: Tekst chowany na najmniejszych ekranach */}
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                        <div>
                            {/* ZMIANA: Responsywna typografia */}
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <FolderKanban className="text-emerald-600" /> Przegląd Projektów
                            </h1>
                            <p className="text-sm text-slate-500 hidden md:block">Zarządzaj wszystkimi projektami w jednym miejscu.</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const FilterControls = ({ onFilterChange, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            onFilterChange({ name: searchTerm, status });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, status, onFilterChange]);

    return (
        // ZMIANA: Kontrolki układają się w kolumnie na mobile, w wierszu na desktopie
        <div className="flex flex-col md:flex-row md:flex-wrap md:justify-between md:items-center mb-6 gap-4">
            <div className="relative w-full md:flex-grow md:max-w-sm">
                <Search className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                    className="bg-slate-50 outline-none text-sm w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    placeholder="Wyszukaj po nazwie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* ZMIANA: Grupowanie kontrolek i responsywny układ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 text-sm text-slate-600 w-full">
                    <ListFilter className="w-5 h-5" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500 w-full"
                    >
                        <option value="">Wszystkie statusy</option>
                        <option value="pending">Oczekujący</option>
                        <option value="running">W Trakcie</option>
                        <option value="completed">Ukończony</option>
                        <option value="on-hold">Wstrzymany</option>
                    </select>
                </div>
                <button onClick={onRefresh} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
                    <RefreshCcw className="w-4 h-4" /> Odśwież
                </button>
            </div>
        </div>
    );
};


// NOWY KOMPONENT: Karta projektu dla widoku mobilnego
const ProjectCard = ({ project, currentUserRole, onDelete, onCardClick }) => {
    const statusInfo = statusStyles[project.status] || statusStyles['pending'];

    return (
        <div
            className="bg-white rounded-lg shadow-md p-4 border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onCardClick(project._id)}
        >
            {/* Nagłówek karty */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-800">{project.name}</h3>
                    <p className="text-xs text-slate-500 max-w-[200px] truncate">{project.description}</p>
                </div>
                {currentUserRole === 'admin' && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(project._id); }} title="Usuń projekt" className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors -mr-2 -mt-2">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Status i Postęp */}
            <div className="mb-4">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                </span>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <div className="text-xs text-slate-500">Postęp</div>
                    <span className="text-xs font-medium text-slate-700">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                </div>
            </div>

            {/* Szczegóły - siatka */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                    <div className="text-xs text-slate-500 mb-1">Termin</div>
                    <div className="text-sm font-medium text-slate-700">{formatDate(project.endDate)}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 mb-1">Przypisani</div>
                    <AssignedUsersAvatarGroup users={project.assignedUsers} />
                </div>
            </div>
        </div>
    );
};

// NOWY KOMPONENT: Skeleton dla widoku kart
const ProjectCardSkeleton = () => (
    [...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4 border border-slate-200 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-48"></div>
                </div>
                <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-5 bg-slate-200 rounded-full w-24 mb-4"></div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4"></div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                    <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                </div>
                <div>
                    <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
                    <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white"></div>
                        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white"></div>
                    </div>
                </div>
            </div>
        </div>
    ))
);


const AssignedUsersAvatarGroup = ({ users }) => (
    <div className="flex -space-x-2">
        {users.slice(0, 3).map(user => (
            <div key={user._id} title={user.username} className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700 border-2 border-white">
                {user.username.charAt(0).toUpperCase()}
            </div>
        ))}
        {users.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 border-2 border-white">
                +{users.length - 3}
            </div>
        )}
    </div>
);

const ProjectRow = ({ project, currentUserRole, onDelete, onRowClick }) => {
    const statusInfo = statusStyles[project.status] || statusStyles['pending'];
    return (
        <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onRowClick(project._id)}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{project.name}</div>
                <div className="text-xs text-slate-500 truncate max-w-xs">{project.description}</div>
            </td>
            <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span></td>
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }}></div></div>
                    <span className="text-xs font-medium text-slate-700 ml-3">{project.progress || 0}%</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">{formatDate(project.endDate)}</td>
            <td className="px-6 py-4">
                <AssignedUsersAvatarGroup users={project.assignedUsers} />
            </td>
            <td className="px-6 py-4">
                {currentUserRole === 'admin' && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(project._id); }} title="Usuń projekt" className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </td>
        </tr>
    );
};

const ProjectTableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
            <td className="px-6 py-4"><div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white"></div>
                <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white"></div>
            </div></td>
            <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-200 rounded-lg"></div></td>
        </tr>
    ))
);


// --- Główny komponent strony (ZREFRAKTORYZOWANY) ---
export default function Projekty() {
    const { projects, setProjects, isLoading, error, fetchProjects } = useProjects();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ name: '', status: '' });
    const [currentUserRole, setCurrentUserRole] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                setCurrentUserRole(res.data.role);
            } catch (e) { console.error(`Błąd autoryzacji: ${e.message}`); }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        fetchProjects(filters);
    }, [filters, fetchProjects]);

    const handleDelete = async (projectId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten projekt?')) return;
        try {
            await axios.delete(`/api/projects/${projectId}`);
            setProjects(prev => prev.filter(p => p._id !== projectId));
        } catch (error) {
            alert('Wystąpił błąd podczas usuwania projektu.');
            console.error(error);
        }
    };

    const handleRowClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    // Funkcja renderująca zawartość w zależności od stanu (ładowanie, błąd, dane)
    const renderContent = () => {
        if (error) {
            return <div className="text-center py-10 text-red-600">{error}</div>;
        }
        if (projects.length === 0 && !isLoading) {
            return <div className="text-center py-10 text-slate-500">Nie znaleziono projektów.</div>;
        }

        // ZMIANA: Renderowanie odpowiedniego Skeleto na podstawie widoku
        if (isLoading) {
            return (
                <>
                    {/* Skeleton dla widoku tabeli (desktop) */}
                    <table className="hidden lg:table min-w-full">
                        <tbody className="divide-y divide-slate-200"><ProjectTableSkeleton /></tbody>
                    </table>
                    {/* Skeleton dla widoku kart (mobile/tablet) */}
                    <div className="block lg:hidden space-y-4"><ProjectCardSkeleton /></div>
                </>
            );
        }

        return (
            <>
                {/* Widok tabeli na desktopie */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Nazwa Projektu', 'Status', 'Postęp', 'Termin', 'Przypisani', 'Akcje'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {projects.map(project => (
                                <ProjectRow
                                    key={project._id}
                                    project={project}
                                    currentUserRole={currentUserRole}
                                    onDelete={handleDelete}
                                    onRowClick={handleRowClick}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Widok kart na mobile/tablet */}
                <div className="block lg:hidden space-y-4">
                    {projects.map(project => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            currentUserRole={currentUserRole}
                            onDelete={handleDelete}
                            onCardClick={handleRowClick}
                        />
                    ))}
                </div>
            </>
        );
    };

    return (
        // ZMIANA: Responsywne paddingi dla całej strony
        <div className="min-h-screen bg-slate-50 p-2 sm:p-4 md:p-8">
            <ProjectListHeader />

            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <FilterControls
                    onFilterChange={setFilters}
                    onRefresh={() => fetchProjects(filters)}
                />

                {renderContent()}

            </div>

            <footer className="mt-8 text-sm text-slate-400 text-center">
                © {new Date().getFullYear()} WorkNest — Wszelkie prawa zastrzeżone
            </footer>
        </div>
    );
}
