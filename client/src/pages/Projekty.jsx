import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Archive } from 'lucide-react';

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
import ConfirmationModal from '../components/ConfirmationModal.jsx';

export default function Projekty() {
    const { t } = useTranslation();
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
    const [currentView, setCurrentView] = useState(
        () => localStorage.getItem('projectsViewPreference') || 'kanban',
    );
    const [showArchived, setShowArchived] = useState(false);
    const [screenSize, setScreenSize] = useState('desktop');
    const [selectedProjects, setSelectedProjects] = useState([]);
    const initialLoad = useRef(true);

    const [confirmationProps, setConfirmationProps] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    // Funkcja do otwierania modala potwierdzającego
    const askForConfirmation = (props) => {
        setConfirmationProps({ isOpen: true, ...props });
    };

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) setScreenSize('mobile');
            else if (width <= 1366) setScreenSize('tablet');
            else setScreenSize('desktop');
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        setSelectedProjects([]);
    }, [filters, showArchived, currentView]);

    const toggleSelection = (projectId) => {
        if (currentUserRole === 'employee') return;
        setSelectedProjects((prev) =>
            prev.includes(projectId)
                ? prev.filter((id) => id !== projectId)
                : [...prev, projectId],
        );
    };

    const toggleSelectAll = () => {
        if (currentUserRole === 'employee') return;
        if (selectedProjects.length === projects.length) {
            setSelectedProjects([]);
        } else {
            setSelectedProjects(projects.map((p) => p._id));
        }
    };

    const handleBulkAction = (action, payload = null) => {
        if (selectedProjects.length === 0) return;

        const actionConfig = {
            archive: {
                title: t('projects.bulkActions.archiveTitle'),
                message: t('projects.bulkActions.archiveMessage', { count: selectedProjects.length }),
                confirmText: t('projects.bulkActions.archiveConfirm'),
                confirmVariant: 'primary',
            },
            restore: {
                title: t('projects.bulkActions.restoreTitle'),
                message: t('projects.bulkActions.restoreMessage', { count: selectedProjects.length }),
                confirmText: t('projects.bulkActions.restoreConfirm'),
                confirmVariant: 'primary',
            },
            delete: {
                title: t('projects.bulkActions.deleteTitle'),
                message: t('projects.bulkActions.deleteMessage', { count: selectedProjects.length }),
                confirmText: t('projects.bulkActions.deleteConfirm'),
                confirmVariant: 'danger',
            },
        };

        askForConfirmation({
            ...actionConfig[action],
            onConfirm: async () => {
                try {
                    await api.patch('/projects/bulk-action', {
                        projectIds: selectedProjects,
                        action,
                        payload,
                    });
                    setRefreshKey((prev) => prev + 1);
                    setSelectedProjects([]);
                } catch (error) {
                    console.error(t('projects.errors.bulkActionError'), error);
                }
            },
        });
    };

    const fetchProjects = useCallback(
        async (showFullLoader = false, currentFilters = filters) => {
            if (!companyId) {
                setProjects([]);
                setIsInitialLoading(false);
                return;
            }
            if (showFullLoader) setIsInitialLoading(true);
            else setIsFiltering(true);
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
                console.error(t('projects.errors.loadingErrorLog'), err);
                setError(t('projects.errors.loadingError'));
                if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                )
                    navigate('/login');
                else setError(t('projects.errors.loadingError'));
            } finally {
                setIsInitialLoading(false);
                setIsFiltering(false);
            }
        },
        [companyId, navigate, showArchived],
    );

    // Połączony useEffect do ładowania danych
    useEffect(() => {
        if (authLoading || !companyId) return;

        // Jeśli to jest pierwsze ładowanie lub ręczne odświeżenie
        if (initialLoad.current) {
            fetchProjects(true, filters);
            initialLoad.current = false;
        } else {
            // W przeciwnym razie to zmiana filtrów
            fetchProjects(false, filters);
        }
    }, [
        authLoading,
        companyId,
        filters,
        showArchived,
        refreshKey,
        fetchProjects,
    ]);

    const handleArchive = (projectId) => {
        askForConfirmation({
            title: t('projects.confirmation.archiveProjectTitle'),
            message: t('projects.confirmation.archiveProjectMessage'),
            confirmText: t('projects.confirmation.archiveButton'),
            confirmVariant: 'warning',
            onConfirm: async () => {
                try {
                    await api.patch(`/projects/${projectId}/archive`);
                    setProjects((prev) =>
                        prev.filter((p) => p._id !== projectId),
                    );
                } catch (error) {
                    console.error(error);
                }
            },
        });
    };

    const handlePermanentDelete = (projectId) => {
        askForConfirmation({
            title: t('projects.singleActions.deleteTitle'),
            message: t('projects.singleActions.deleteMessage'),
            confirmText: t('projects.singleActions.deleteConfirm'),
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/projects/${projectId}`, {
                        params: { company: companyId },
                    });
                    setProjects((prev) =>
                        prev.filter((p) => p._id !== projectId),
                    );
                } catch (error) {
                    console.error(error);
                }
            },
        });
    };

    const handleRestore = (projectId) => {
        askForConfirmation({
            title: t('projects.singleActions.restoreTitle'),
            message: t('projects.singleActions.restoreMessage'),
            confirmText: t('projects.singleActions.restoreConfirm'),
            confirmVariant: 'primary',
            onConfirm: async () => {
                try {
                    await api.patch(`/projects/${projectId}/restore`);
                    setProjects((prev) =>
                        prev.filter((p) => p._id !== projectId),
                    );
                } catch (error) {
                    console.error(error);
                }
            },
        });
    };

    const handleRowClick = (projectId) => navigate(`/projects/${projectId}`);
    const handleRefresh = () => {
        setFilters({ name: '', status: '' });
        setRefreshKey((k) => k + 1); // Trigger refresh
        initialLoad.current = true; // Force a full reload on refresh
    };
    const handleProjectAdded = () => {
        setIsModalOpen(false);
        setRefreshKey((k) => k + 1);
        initialLoad.current = true; // Force a full reload on add
    };
    const handleViewChange = (view) => {
        setCurrentView(view);
        localStorage.setItem('projectsViewPreference', view);
    };

    const tableHeaders = [
        t('projects.tableHeaders.projectName'),
        t('projects.tableHeaders.status'),
        t('projects.tableHeaders.progress'),
        t('projects.tableHeaders.deadline'),
        t('projects.tableHeaders.assigned'),
    ];
    if (currentUserRole !== 'employee') {
        tableHeaders.push(t('projects.tableHeaders.actions'));
    }

    const handleStatusChange = async (projectId, newStatus) => {
        const originalProjects = projects;
        const updatedProjects = originalProjects.map((p) =>
            p._id === projectId ? { ...p, status: newStatus } : p,
        );
        setProjects(updatedProjects);

        try {
            await api.patch(`/projects/${projectId}/status`, {
                status: newStatus,
            });
            // Nie ma potrzeby pokazywać notyfikacji przy każdej zmianie statusu w Kanbanie, jest to zbyt uciążliwe
        } catch (error) {
            console.error(error);
            setProjects(originalProjects); // Przywróć stan w razie błędu
        }
    };

    if (isInitialLoading || authLoading)
        return <LoadingScreen message={t('projects.misc.loadingProjects')} />;

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-6 py-6 text-red-700 shadow-sm">
                    <div className="mb-2 text-lg font-semibold">{t('projects.misc.error')}</div>
                    <div className="text-sm">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 sm:w-auto"
                    >
                        {t('projects.misc.backToDashboard')}
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
                        {t('projects.misc.noCompanyAssigned')}
                    </div>
                    <div className="text-sm">
                        {t('projects.misc.noCompanyAssignedMessage')}
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 w-full rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700 sm:w-auto"
                    >
                        {t('projects.misc.backToDashboard')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen select-none bg-slate-50 p-2 sm:p-4 md:p-8">
            {/* <Notification notification={notification} onClear={clearNotification} /> */}
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
            />

            <ProjectListHeader
                onAddProject={() => setIsModalOpen(true)}
                currentUserRole={currentUserRole}
            />
            <div
                className={`rounded-2xl bg-white p-4 shadow-lg transition-opacity duration-300 md:p-6 ${isFiltering ? 'opacity-60' : 'opacity-100'}`}
            >
                <div className="mb-4 grid grid-cols-1 grid-rows-1">
                    {currentUserRole !== 'employee' && (
                        <div
                            className={`z-20 col-start-1 row-start-1 transition-all duration-300 ease-in-out ${selectedProjects.length > 0 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
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
                    )}
                    <div
                        className={`z-10 col-start-1 row-start-1 transition-all duration-300 ease-in-out ${selectedProjects.length > 0 && currentUserRole !== 'employee' ? 'pointer-events-none -translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <FilterControls
                                filters={filters}
                                onFilterChange={setFilters}
                                onRefresh={handleRefresh}
                                isFiltering={isFiltering}
                                screenSize={screenSize}
                            />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
                                    <button
                                        onClick={() => setShowArchived(false)}
                                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${!showArchived ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        <FolderKanban className="h-4 w-4" />{' '}
                                        {t('projects.misc.active')}
                                    </button>
                                    <button
                                        onClick={() => setShowArchived(true)}
                                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${showArchived ? 'bg-slate-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        <Archive className="h-4 w-4" /> {t('projects.misc.archive')}
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
                            ? t('projects.misc.noArchivedProjects')
                            : t('projects.misc.noProjectsFound')}
                    </div>
                ) : screenSize === 'mobile' ||
                  currentView === 'grid' ||
                  (currentView === 'kanban' &&
                      (showArchived || screenSize !== 'desktop')) ? (
                    <GridView
                        projects={projects}
                        currentUserRole={currentUserRole}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        onDelete={handlePermanentDelete}
                        onCardClick={handleRowClick}
                        showArchived={showArchived}
                        selectedProjects={selectedProjects}
                        onToggleSelect={toggleSelection}
                    />
                ) : currentView === 'kanban' ? (
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
                                        {currentUserRole !== 'employee' && (
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
                                        )}
                                        {tableHeaders.map((header) => (
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
            <footer className="mt-8 text-center text-sm text-slate-400">
                © {new Date().getFullYear()} WorkNest - {t('footer.Rights')}
            </footer>
            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProjectAdded}
            />
        </div>
    );
}
