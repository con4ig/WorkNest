import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api.js'; // ZMIANA: Importujemy naszą instancję api
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ListFilter,
    RefreshCcw,
    Trash2,
    ArrowLeft,
    FolderKanban,
    Plus,
    Archive,
    ArchiveRestore,
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import AddProjectModal from '../components/AddProjectModal.jsx';
import ViewSwitcher from '../components/ViewSwitcher.jsx';
import GridView from '../components/GridView.jsx';
import KanbanView from '../components/KanbanView.jsx';
import { useAuth } from '../context/AuthContext';

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

// --- Komponenty UI ---

const ProjectListHeader = ({ onAddProject, currentUserRole }) => {
    const navigate = useNavigate();
    return (
        <header className="sticky top-0 z-10 mb-6 rounded-2xl bg-white shadow-sm md:mb-8">
            <div className="max-w-8xl mx-auto px-4 py-4 md:px-8 md:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <div className="hidden h-8 w-px bg-slate-200 sm:block"></div>
                        <div>
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
                    {(currentUserRole === 'admin' ||
                        currentUserRole === 'hr') && (
                        <button
                            onClick={onAddProject}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">Dodaj Projekt</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

const FilterControls = ({ onFilterChange, onRefresh, isFiltering }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) {
            const handler = setTimeout(() => {
                onFilterChange({ name: searchTerm, status });
            }, 500);
            return () => clearTimeout(handler);
        } else {
            isMounted.current = true;
        }
    }, [searchTerm, status, onFilterChange]);

    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm md:flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Wyszukaj po nazwie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isFiltering && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600"></div>
                    </div>
                )}
            </div>
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

const ProjectCard = ({
    project,
    currentUserRole,
    onArchive,
    onRestore, // Dodano
    onPermanentDelete, // Dodano
    showArchived, // Dodano
    onCardClick,
}) => {
    const statusInfo = statusStyles[project.status] || statusStyles['pending'];

    return (
        <div
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
            onClick={() => onCardClick(project._id)}
        >
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
                    <div className="flex gap-1">
                        {!showArchived ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onArchive(project._id);
                                }}
                                title="Archiwizuj projekt"
                                className="-mt-2 rounded-full p-2 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                            >
                                <Archive className="h-4 w-4" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRestore(project._id);
                                    }}
                                    title="Przywróć projekt"
                                    className="-mt-2 rounded-full p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                    <ArchiveRestore className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPermanentDelete(project._id);
                                    }}
                                    title="Usuń trwale"
                                    className="-mr-2 -mt-2 rounded-full p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

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

const AssignedUsersAvatarGroup = ({ users }) => {
    if (!users || users.length === 0) {
        return <div className="text-xs text-slate-400">Brak</div>;
    }

    return (
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
};

const ProjectRow = ({
    project,
    currentUserRole,
    onArchive,
    onRestore,
    onPermanentDelete,
    onRowClick,
    showArchived,
}) => {
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
                    <div className="flex gap-1">
                        {showArchived ? (
                            <>
                                {/* W archiwum: Przywróć + Usuń trwale */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRestore(project._id);
                                    }}
                                    title="Przywróć projekt"
                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                    <ArchiveRestore className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPermanentDelete(project._id);
                                    }}
                                    title="Usuń trwale"
                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* W aktywnych: Archiwizuj + Usuń trwale */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onArchive(project._id);
                                    }}
                                    title="Przenieś do archiwum"
                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                >
                                    <Archive className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPermanentDelete(project._id);
                                    }}
                                    title="Usuń trwale"
                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </td>
        </tr>
    );
};

// --- Główny komponent strony (POPRAWIONY) ---
export default function Projekty() {
    const { user, loading: authLoading } = useAuth();
    const companyId = user?.company?._id;
    const currentUserRole = user?.role;
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ name: '', status: '' });
    const [refreshKey, setRefreshKey] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Nowe stany dla widoków i archiwum
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem('projectsViewPreference') || 'list';
    });
    const [showArchived, setShowArchived] = useState(false);
    const [screenSize, setScreenSize] = useState('desktop');

    // Wykrywanie rozmiaru ekranu (mobile / tablet / desktop)
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('mobile');
            } else if (width <= 1024) {
                setScreenSize('tablet');
            } else {
                setScreenSize('desktop');
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const fetchProjects = useCallback(
        async (showFullLoader = false, currentFilters = filters) => {
            if (!companyId) {
                setProjects([]);
                setIsInitialLoading(false);
                return;
            }

            // Używamy pełnego loadera tylko przy pierwszym ładowaniu lub odświeżaniu
            if (showFullLoader) {
                setIsInitialLoading(true);
            } else {
                setIsFiltering(true);
            }

            setError(null);

            try {
                const response = await api.get('/projects', {
                    params: {
                        ...currentFilters,
                        company: companyId,
                        isArchived: showArchived ? 'true' : 'false',
                    },
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
                setIsInitialLoading(false);
                setIsFiltering(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [companyId, navigate, showArchived],
    );

    // Pierwsze załadowanie (z pełnym loaderem) - tylko przy wejściu i odświeżaniu
    useEffect(() => {
        if (!authLoading && companyId) {
            fetchProjects(true, filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, companyId, refreshKey, showArchived]);

    // Filtrowanie (tylko spinner w polu wyszukiwania)
    useEffect(() => {
        if (!authLoading && companyId && !isInitialLoading) {
            fetchProjects(false, filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Archiwizacja projektu (soft delete)
    const handleArchive = async (projectId) => {
        if (!companyId) return;
        if (
            !window.confirm(
                'Czy na pewno chcesz przenieść ten projekt do archiwum?',
            )
        )
            return;
        try {
            await api.patch(`/projects/${projectId}/archive`);
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
        } catch (error) {
            alert('Wystąpił błąd podczas archiwizacji projektu.');
            console.error(error);
        }
    };

    // Permanentne usunięcie projektu
    const handlePermanentDelete = async (projectId) => {
        if (!companyId) return;
        if (
            !window.confirm(
                'Czy na pewno chcesz TRWALE usunąć ten projekt? Ta operacja jest nieodwracalna!',
            )
        )
            return;
        try {
            await api.delete(`/projects/${projectId}`, {
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

    const handleRefresh = () => {
        setFilters({ name: '', status: '' });
        setRefreshKey((k) => k + 1);
    };

    const handleProjectAdded = () => {
        setIsModalOpen(false);
        setRefreshKey((k) => k + 1);
    };

    // Obsługa zmiany widoku
    const handleViewChange = (view) => {
        setCurrentView(view);
        localStorage.setItem('projectsViewPreference', view);
    };

    // Przywracanie projektu z archiwum
    const handleRestore = async (projectId) => {
        try {
            await api.patch(`/projects/${projectId}/restore`);
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
        } catch (error) {
            alert('Wystąpił błąd podczas przywracania projektu.');
            console.error(error);
        }
    };

    // Zmiana statusu (dla Kanban)
    const handleStatusChange = async (projectId, newStatus) => {
        try {
            await api.patch(`/projects/${projectId}/status`, {
                status: newStatus,
            });
            setProjects((prev) =>
                prev.map((p) =>
                    p._id === projectId ? { ...p, status: newStatus } : p,
                ),
            );
        } catch (error) {
            alert('Wystąpił błąd podczas aktualizacji statusu projektu.');
            console.error(error);
        }
    };

    if (isInitialLoading || authLoading) {
        return <LoadingScreen message="Ładowanie projektów..." />;
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-6 py-6 text-red-700 shadow-sm">
                    <div className="mb-2 text-lg font-semibold">Błąd</div>
                    <div className="text-sm">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 sm:w-auto"
                    >
                        Powrót do Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!companyId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md rounded-xl border border-yellow-200 bg-yellow-50 px-6 py-6 text-yellow-700 shadow-sm">
                    <div className="mb-2 text-lg font-semibold">
                        Brak przypisanej firmy
                    </div>
                    <div className="text-sm">
                        Nie jesteś przypisany do żadnej firmy. Skontaktuj się z
                        administratorem.
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 w-full rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700 sm:w-auto"
                    >
                        Powrót do Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-2 sm:p-4 md:p-8">
            <ProjectListHeader
                onAddProject={() => setIsModalOpen(true)}
                currentUserRole={currentUserRole}
            />
            <div className="rounded-2xl bg-white p-4 shadow-lg md:p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <FilterControls
                        onFilterChange={setFilters}
                        onRefresh={handleRefresh}
                        isFiltering={isFiltering}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Przełącznik Aktywne/Archiwum */}
                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
                            <button
                                onClick={() => setShowArchived(false)}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    !showArchived
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <FolderKanban className="h-4 w-4" />
                                Aktywne
                            </button>
                            <button
                                onClick={() => setShowArchived(true)}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    showArchived
                                        ? 'bg-slate-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Archive className="h-4 w-4" />
                                Archiwum
                            </button>
                        </div>
                        {screenSize !== 'mobile' && (
                            <ViewSwitcher
                                currentView={currentView}
                                onViewChange={handleViewChange}
                                showArchived={showArchived}
                                disableKanban={screenSize !== 'desktop'}
                            />
                        )}
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="py-10 text-center text-slate-500">
                        {showArchived
                            ? 'Brak zarchiwizowanych projektów.'
                            : 'Nie znaleziono projektów.'}
                    </div>
                ) : screenSize === 'mobile' ||
                  currentView === 'grid' ||
                  (currentView === 'kanban' &&
                      (showArchived || screenSize !== 'desktop')) ? (
                    // Grid view (Mobile / Grid / Fallback dla Kanban na Tablet/Archiwum)
                    <GridView
                        projects={projects}
                        currentUserRole={currentUserRole}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        onDelete={handlePermanentDelete}
                        onCardClick={handleRowClick}
                        showArchived={showArchived}
                    />
                ) : currentView === 'kanban' ? (
                    // Kanban tylko dla aktywnych projektów i desktop
                    <KanbanView
                        projects={projects}
                        onStatusChange={handleStatusChange}
                        onCardClick={handleRowClick}
                        onArchive={handleArchive}
                        onPermanentDelete={handlePermanentDelete}
                        currentUserRole={currentUserRole}
                    />
                ) : (
                    <>
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
                                            onArchive={handleArchive}
                                            onRestore={handleRestore}
                                            onPermanentDelete={
                                                handlePermanentDelete
                                            }
                                            onRowClick={handleRowClick}
                                            showArchived={showArchived}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="block space-y-4 lg:hidden">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    currentUserRole={currentUserRole}
                                    onArchive={handleArchive}
                                    onRestore={handleRestore}
                                    onPermanentDelete={handlePermanentDelete}
                                    showArchived={showArchived}
                                    onCardClick={handleRowClick}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <footer className="mt-8 text-center text-sm text-slate-400">
                © {new Date().getFullYear()} WorkNest — Wszelkie prawa
                zastrzeżone
            </footer>

            {/* Modal do dodawania projektów */}
            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProjectAdded}
            />
        </div>
    );
}
