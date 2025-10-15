import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ListFilter, RefreshCcw, Trash2, ArrowLeft, FolderKanban } from 'lucide-react';

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

// --- Custom Hook do zarządzania danymi projektów ---
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

// --- Komponenty UI ---

// Nagłówek strony
const ProjectListHeader = () => {
    const navigate = useNavigate();
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10 mb-8 rounded-2xl">
            <div className="max-w-8xl mx-auto px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Dashboard</span>
                        </button>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <FolderKanban className="text-emerald-600"/> Przegląd Projektów
                            </h1>
                            <p className="text-sm text-slate-500">Zarządzaj wszystkimi projektami w jednym miejscu.</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Panel filtrów
const FilterControls = ({ onFilterChange, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Debounce: opóźnia wykonanie zapytania, aby nie wysyłać go po każdej literze
        const handler = setTimeout(() => {
            onFilterChange({ name: searchTerm, status });
        }, 500); // Czekaj 500ms po ostatnim wpisaniu
        return () => clearTimeout(handler);
    }, [searchTerm, status, onFilterChange]);

    return (
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="relative flex-grow max-w-sm">
                <Search className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                    className="bg-slate-50 outline-none text-sm w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    placeholder="Wyszukaj po nazwie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ListFilter className="w-5 h-5" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">Wszystkie statusy</option>
                        <option value="pending">Oczekujący</option>
                        <option value="running">W Trakcie</option>
                        <option value="completed">Ukończony</option>
                        <option value="on-hold">Wstrzymany</option>
                    </select>
                </div>
                <button onClick={onRefresh} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
                    <RefreshCcw className="w-4 h-4" /> Odśwież
                </button>
            </div>
        </div>
    );
};

// Szkielet tabeli na czas ładowania
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


// Główny komponent strony
export default function Projekty() {
    const { projects, setProjects, isLoading, error, fetchProjects } = useProjects();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ name: '', status: '' });
    const [currentUserRole, setCurrentUserRole] = useState(null); // Prostsze zarządzanie rolą

    // Pobranie roli użytkownika
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                setCurrentUserRole(res.data.role);
            } catch (e) { console.error(`Błąd autoryzacji: ${e.message}`); }
        };
        checkAuth();
    }, []);

    // Pobieranie projektów przy zmianie filtrów
    useEffect(() => {
        fetchProjects(filters);
    }, [filters, fetchProjects]);

    const handleDelete = async (projectId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten projekt?')) return;
        try {
            await axios.delete(`/projects/${projectId}`);
            setProjects(prev => prev.filter(p => p._id !== projectId));
        } catch (error) {
            alert('Wystąpił błąd podczas usuwania projektu.');
            console.error(error);
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <ProjectListHeader />

            <div className="bg-white rounded-2xl shadow-lg p-6">
                <FilterControls
                    onFilterChange={setFilters}
                    onRefresh={() => fetchProjects(filters)}
                />

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Nazwa Projektu', 'Status', 'Postęp', 'Termin', 'Przypisani', 'Akcje'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading ? <ProjectTableSkeleton /> : 
                             error ? (<tr><td colSpan="6" className="text-center py-10 text-red-600">{error}</td></tr>) :
                             projects.length > 0 ? (
                                projects.map(project => {
                                    const statusInfo = statusStyles[project.status] || statusStyles['pending'];
                                    return (
                                    <tr key={project._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project._id}`)}>
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
                                            <div className="flex -space-x-2">
                                            {project.assignedUsers.slice(0, 3).map(user => (
                                                <div key={user._id} title={user.username} className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700 border-2 border-white">{user.username.charAt(0).toUpperCase()}</div>
                                            ))}
                                            {project.assignedUsers.length > 3 && <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 border-2 border-white">+{project.assignedUsers.length - 3}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {currentUserRole === 'admin' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }} title="Usuń projekt" className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            )}
                                        </td>
                                    </tr>
                                )})
                             ) : (
                                <tr><td colSpan="6" className="text-center py-10 text-slate-500">Nie znaleziono projektów.</td></tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="mt-8 text-sm text-slate-400 text-center">© {new Date().getFullYear()} WorkNest — Wszelkie prawa zastrzeżone</footer>
        </div>
    );
}