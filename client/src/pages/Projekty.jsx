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
    X,
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import AddProjectModal from '../components/AddProjectModal.jsx';
import ViewSwitcher from '../components/ViewSwitcher.jsx';
import GridView from '../components/GridView.jsx';
import KanbanView from '../components/KanbanView.jsx';
import { useAuth } from '../context/AuthContext';
import ProjectListHeader from '../components/projects/ProjectListHeader';
import ProjectGridCard from '../components/projects/ProjectGridCard';
import FilterControls from '../components/projects/FilterControls';
import BulkActionsHeader from '../components/projects/BulkActionsHeader';
import ProjectRow from '../components/projects/ProjectRow';

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
    // Stan dla zaznaczonych projektów (Bulk Actions)
    const [selectedProjects, setSelectedProjects] = useState([]);

    // Wykrywanie rozmiaru ekranu (mobile / tablet / desktop)
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('mobile');
            } else if (width <= 1366) {
                setScreenSize('tablet');
            } else {
                setScreenSize('desktop');
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Reset zaznaczenia przy zmianie filtrów lub widoku archiwum
    useEffect(() => {
        setSelectedProjects([]);
    }, [filters, showArchived, currentView]); // Reset również przy zmianie widoku

    // Obsługa zaznaczania
    const toggleSelection = (projectId) => {
        setSelectedProjects((prev) =>
            prev.includes(projectId)
                ? prev.filter((id) => id !== projectId)
                : [...prev, projectId],
        );
    };

    const toggleSelectAll = () => {
        if (selectedProjects.length === projects.length) {
            setSelectedProjects([]);
        } else {
            setSelectedProjects(projects.map((p) => p._id));
        }
    };

    // Obsługa akcji masowych
    const handleBulkAction = async (action, payload = null) => {
        if (selectedProjects.length === 0) return;

        let confirmMessage = `Czy na pewno chcesz wykonać tę akcję dla ${selectedProjects.length} projektów?`;
        if (action === 'delete')
            confirmMessage = `UWAGA: Trwale usuniesz ${selectedProjects.length} projektów. Operacja jest nieodwracalna. Kontynuować?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            await api.patch('/projects/bulk-action', {
                projectIds: selectedProjects,
                action,
                payload,
            });

            // Odśwież listę i wyczyść zaznaczenie
            setRefreshKey((prev) => prev + 1);
            setSelectedProjects([]);
            alert('Operacja zakończona pomyślnie.');
        } catch (error) {
            console.error('Błąd operacji masowej:', error);
            alert('Wystąpił błąd podczas wykonywania operacji.');
        }
    };

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

    // Pierwsze załadowanie (z pełnym loaderem) - tylko przy wejściu i ręcznym odświeżeniu
    useEffect(() => {
        if (!authLoading && companyId) {
            fetchProjects(true, filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, companyId, refreshKey]);

    // Filtrowanie i zmiana widoku (bez pełnego loadera)
    useEffect(() => {
        if (!authLoading && companyId && !isInitialLoading) {
            fetchProjects(false, filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, showArchived]);

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

    const handleSearchChange = useCallback((name) => {
        setFilters((f) => ({ ...f, name }));
    }, []);

    const handleStatusFilterChange = useCallback((status) => {
        setFilters((f) => ({ ...f, status }));
    }, []);

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
            <div
                className={`rounded-2xl bg-white p-4 shadow-lg transition-opacity duration-300 md:p-6 ${isFiltering ? 'opacity-60' : 'opacity-100'}`}
            >
                <div className="mb-4 grid grid-cols-1 grid-rows-1">
                    {/* Bulk Actions Header Layer */}
                    <div
                        className={`z-20 col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
                            selectedProjects.length > 0
                                ? 'translate-y-0 opacity-100'
                                : 'pointer-events-none translate-y-2 opacity-0'
                        }`}
                    >
                        <BulkActionsHeader
                            selectedCount={selectedProjects.length}
                            onClearSelection={() => setSelectedProjects([])}
                            onArchive={() => handleBulkAction('archive')}
                            onRestore={() => handleBulkAction('restore')}
                            onDelete={() => handleBulkAction('delete')}
                            showArchived={showArchived}
                        />
                    </div>

                    {/* Normal Header Layer */}
                    <div
                        className={`z-10 col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
                            selectedProjects.length > 0
                                ? 'pointer-events-none -translate-y-2 opacity-0'
                                : 'translate-y-0 opacity-100'
                        }`}
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <FilterControls
                                onFilterChange={setFilters}
                                onRefresh={handleRefresh}
                                isFiltering={isFiltering}
                                screenSize={screenSize}
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
                        selectedProjects={selectedProjects} // Dodano
                        onToggleSelect={toggleSelection} // Dodano
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
                                        <th className="w-4 px-6 py-3">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    projects.length > 0 &&
                                                    selectedProjects.length ===
                                                        projects.length
                                                }
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                        </th>
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
                                            isSelected={selectedProjects.includes(
                                                project._id,
                                            )}
                                            onToggleSelect={toggleSelection}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="block space-y-4 lg:hidden">
                            {projects.map((project) => (
                                <ProjectGridCard
                                    key={project._id}
                                    project={project}
                                    currentUserRole={currentUserRole}
                                    onArchive={handleArchive}
                                    onRestore={handleRestore}
                                    onPermanentDelete={handlePermanentDelete}
                                    showArchived={showArchived}
                                    onCardClick={handleRowClick}
                                    isSelected={selectedProjects.includes(
                                        project._id,
                                    )}
                                    onToggleSelect={toggleSelection}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Bulk Action Bar - Pasek akcji masowych */}

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
