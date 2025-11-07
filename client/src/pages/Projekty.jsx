import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ListFilter,
    RefreshCcw,
    Trash2,
    ArrowLeft,
    FolderKanban,
    MoreVertical,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- Style i dane pomocnicze (bez zmian) ---
const statusStyles = {
    pending: {
        text: 'text-yellow-800',
        bg: 'bg-yellow-100',
        label: 'Oczekujący',
    },
    running: { text: 'text-sky-800', bg: 'bg-sky-100', label: 'W Trakcie' },
    completed: {
        text: 'text-emerald-800',
        bg: 'bg-emerald-100',
        label: 'Ukończony',
    },
    'on-hold': { text: 'text-red-800', bg: 'bg-red-100', label: 'Wstrzymany' },
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// --- Custom Hook ---
const useProjects = (companyId) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProjects = useCallback(
        async (params = {}) => {
            if (!companyId) {
                setIsLoading(false);
                return; // Nie pobieraj projektów, jeśli companyId nie jest dostępne
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/projects', {
                    params: { ...params, company: companyId },
                });
                setProjects(response.data.projects);
            } catch (err) {
                console.error('Błąd ładowania projektów:', err);
                if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    navigate('/login');
                } else {
                    setError('Nie udało się załadować listy projektów.');
                }
            } finally {
                setIsLoading(false);
            }
        },
        [navigate, companyId],
    );

    return { projects, setProjects, isLoading, error, fetchProjects };
};

// --- Komponenty UI (Zaktualizowane o responsywność) ---

const ProjectListHeader = () => {
    const navigate = useNavigate();
    return (
        // ZMIANA: Dodano responsywne paddingi i układ
        <header className="sticky top-0 z-10 mb-6 rounded-2xl bg-white shadow-sm md:mb-8">
            <div className="max-w-8xl mx-auto px-4 py-4 md:px-8 md:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            {/* ZMIANA: Tekst chowany na najmniejszych ekranach */}
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <div className="hidden h-8 w-px bg-slate-200 sm:block"></div>
                        <div>
                            {/* ZMIANA: Responsywna typografia */}
                            <h1 className="flex items-center gap-3 text-xl font-bold text-slate-800 sm:text-2xl">
                                <FolderKanban className="text-emerald-600" />{' '}
                                Przegląd Projektów
                            </h1>
                            <p className="hidden text-sm text-slate-500 md:block">
                                Zarządzaj wszystkimi projektami w jednym
                                miejscu.
                            </p>
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
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm md:flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Wyszukaj po nazwie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* ZMIANA: Grupowanie kontrolek i responsywny układ */}
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center md:w-auto">
                <div className="flex w-full items-center gap-2 text-sm text-slate-600">
                    <ListFilter className="h-5 w-5" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white p-2 focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">Wszystkie statusy</option>
                        <option value="pending">Oczekujący</option>
                        <option value="running">W Trakcie</option>
                        <option value="completed">Ukończony</option>
                        <option value="on-hold">Wstrzymany</option>
                    </select>
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200"
                >
                    <RefreshCcw className="h-4 w-4" /> Odśwież
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
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
            onClick={() => onCardClick(project._id)}
        >
            {/* Nagłówek karty */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-800">
                        {project.name}
                    </h3>
                    <p className="max-w-[200px] truncate text-xs text-slate-500">
                        {project.description}
                    </p>
                </div>
                {currentUserRole === 'admin' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project._id);
                        }}
                        title="Usuń projekt"
                        className="-mr-2 -mt-2 rounded-full p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Status i Postęp */}
            <div className="mb-4">
                <div className="mb-1 text-xs text-slate-500">Status</div>
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusInfo.bg} ${statusInfo.text}`}
                >
                    {statusInfo.label}
                </span>
            </div>

            <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                    <div className="text-xs text-slate-500">Postęp</div>
                    <span className="text-xs font-medium text-slate-700">
                        {project.progress || 0}%
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                        className="h-2 rounded-full bg-emerald-600"
                        style={{ width: `${project.progress || 0}%` }}
                    ></div>
                </div>
            </div>

            {/* Szczegóły - siatka */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                    <div className="mb-1 text-xs text-slate-500">Termin</div>
                    <div className="text-sm font-medium text-slate-700">
                        {formatDate(project.endDate)}
                    </div>
                </div>
                <div>
                    <div className="mb-1 text-xs text-slate-500">
                        Przypisani
                    </div>
                    <AssignedUsersAvatarGroup users={project.assignedUsers} />
                </div>
            </div>
        </div>
    );
};

// NOWY KOMPONENT: Skeleton dla widoku kart
const ProjectCardSkeleton = () =>
    [...Array(3)].map((_, i) => (
        <div
            key={i}
            className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 shadow-md"
        >
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <div className="mb-2 h-4 w-32 rounded bg-slate-200"></div>
                    <div className="h-3 w-48 rounded bg-slate-200"></div>
                </div>
                <div className="h-6 w-6 rounded-full bg-slate-200"></div>
            </div>
            <div className="mb-4 h-5 w-24 rounded-full bg-slate-200"></div>
            <div className="mb-4 h-2 w-full rounded-full bg-slate-200"></div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                    <div className="mb-2 h-3 w-16 rounded bg-slate-200"></div>
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                </div>
                <div>
                    <div className="mb-2 h-3 w-20 rounded bg-slate-200"></div>
                    <div className="flex -space-x-2">
                        <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200"></div>
                        <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200"></div>
                    </div>
                </div>
            </div>
        </div>
    ));

const AssignedUsersAvatarGroup = ({ users }) => (
    <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
            <div
                key={user._id}
                title={user.username}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-xs font-bold text-sky-700"
            >
                {user.username.charAt(0).toUpperCase()}
            </div>
        ))}
        {users.length > 3 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-700">
                +{users.length - 3}
            </div>
        )}
    </div>
);

const ProjectRow = ({ project, currentUserRole, onDelete, onRowClick }) => {
    const statusInfo = statusStyles[project.status] || statusStyles['pending'];
    return (
        <tr
            className="cursor-pointer transition-colors hover:bg-slate-50"
            onClick={() => onRowClick(project._id)}
        >
            <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900">
                    {project.name}
                </div>
                <div className="max-w-xs truncate text-xs text-slate-500">
                    {project.description}
                </div>
            </td>
            <td className="px-6 py-4">
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusInfo.bg} ${statusInfo.text}`}
                >
                    {statusInfo.label}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                            className="h-2 rounded-full bg-emerald-600"
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>
                    <span className="ml-3 text-xs font-medium text-slate-700">
                        {project.progress || 0}%
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">
                {formatDate(project.endDate)}
            </td>
            <td className="px-6 py-4">
                <AssignedUsersAvatarGroup users={project.assignedUsers} />
            </td>
            <td className="px-6 py-4">
                {currentUserRole === 'admin' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project._id);
                        }}
                        title="Usuń projekt"
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </td>
        </tr>
    );
};

const ProjectTableSkeleton = () =>
    [...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="px-6 py-4">
                <div className="h-4 w-3/4 rounded bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-6 w-24 rounded-full bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 w-1/2 rounded bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 w-20 rounded bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
                <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200"></div>
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200"></div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="h-8 w-8 rounded-lg bg-slate-200"></div>
            </td>
        </tr>
    ));

// --- Główny komponent strony (ZREFRAKTORYZOWANY) ---
export default function Projekty() {
    const { user, loading: authLoading } = useAuth();
    const companyId = user?.company?._id;
    const currentUserRole = user?.role;

    const { projects, setProjects, isLoading, error, fetchProjects } =
        useProjects(companyId);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ name: '', status: '' });

    useEffect(() => {
        if (companyId) {
            fetchProjects(filters);
        }
    }, [filters, fetchProjects, companyId]);

    const handleDelete = async (projectId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten projekt?')) return;
        if (!companyId) return;
        try {
            await axios.delete(`/api/projects/${projectId}`, {
                withCredentials: true,
                params: { company: companyId },
            });
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
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
        if (authLoading || isLoading) {
            return (
                <>
                    {/* Skeleton dla widoku tabeli (desktop) */}
                    <table className="hidden min-w-full lg:table">
                        <tbody className="divide-y divide-slate-200">
                            <ProjectTableSkeleton />
                        </tbody>
                    </table>
                    {/* Skeleton dla widoku kart (mobile/tablet) */}
                    <div className="block space-y-4 lg:hidden">
                        <ProjectCardSkeleton />
                    </div>
                </>
            );
        }

        if (error) {
            return (
                <div className="py-10 text-center text-red-600">{error}</div>
            );
        }
        if (projects.length === 0 && !isLoading) {
            return (
                <div className="py-10 text-center text-slate-500">
                    Nie znaleziono projektów.
                </div>
            );
        }

        return (
            <>
                {/* Widok tabeli na desktopie */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {[
                                    'Nazwa Projektu',
                                    'Status',
                                    'Postęp',
                                    'Termin',
                                    'Przypisani',
                                    'Akcje',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {projects.map((project) => (
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
                <div className="block space-y-4 lg:hidden">
                    {projects.map((project) => (
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

            <div className="rounded-2xl bg-white p-4 shadow-lg md:p-6">
                <FilterControls
                    onFilterChange={setFilters}
                    onRefresh={() => fetchProjects(filters)}
                />

                {renderContent()}
            </div>

            <footer className="mt-8 text-center text-sm text-slate-400">
                © {new Date().getFullYear()} WorkNest — Wszelkie prawa
                zastrzeżone
            </footer>
        </div>
    );
}
