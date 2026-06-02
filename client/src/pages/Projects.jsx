import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import {
    FolderKanban,
    Archive,
    ArrowLeft,
    Search,
    Plus,
    LayoutGrid,
    LayoutList,
    LayoutDashboard,
    ListFilter,
    RefreshCcw,
} from 'lucide-react';

import LoadingScreen from '../components/LoadingScreen';
import AddProjectModal from '../components/AddProjectModal.jsx';
import ViewSwitcher from '../components/ViewSwitcher.jsx';
import GridView from '../components/GridView.jsx';
import KanbanView from '../components/KanbanView.jsx';
import { useAuth } from '../context/useAuth';
import ListView from '../components/ListView';
import BulkActionsHeader from '../components/projects/BulkActionsHeader';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useProjectRealtime } from '../hooks/useProjectRealtime';
import toast from 'react-hot-toast';
import { Select } from '../components/ui/Select';

export default function Projects() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const companyId = user?.company?._id;
    const currentUserRole = user?.role;
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [error, setError] = useState(null);
    // Split filters state for easier UI binding
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            // Trigger fetch only if initial load is done to avoid double fetch on mount
            if (!initialLoad.current) {
                setRefreshKey((prev) => prev + 1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    // Open confirmation modal
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
    }, [searchTerm, statusFilter, showArchived, currentView]);

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
                message: t('projects.bulkActions.archiveMessage', {
                    count: selectedProjects.length,
                }),
                confirmText: t('projects.bulkActions.archiveConfirm'),
                confirmVariant: 'primary',
            },
            restore: {
                title: t('projects.bulkActions.restoreTitle'),
                message: t('projects.bulkActions.restoreMessage', {
                    count: selectedProjects.length,
                }),
                confirmText: t('projects.bulkActions.restoreConfirm'),
                confirmVariant: 'primary',
            },
            delete: {
                title: t('projects.bulkActions.deleteTitle'),
                message: t('projects.bulkActions.deleteMessage', {
                    count: selectedProjects.length,
                }),
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
        async (showFullLoader = false) => {
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
                        name: searchTerm,
                        status: statusFilter,
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
        [companyId, navigate, showArchived, searchTerm, statusFilter, t],
    );

    // Combined data-loading effect
    useEffect(() => {
        if (authLoading || !companyId) return;

        // First load or manual refresh
        if (initialLoad.current) {
            fetchProjects(true);
            initialLoad.current = false;
        } else {
            // Otherwise it's a filter change (triggered by refreshKey incremented in debounce or manual refresh)
            fetchProjects(false);
        }
    }, [authLoading, companyId, refreshKey, fetchProjects]);

    // Live updates from other clients in the same tenant — apply the
    // mutation optimistically against the in-memory list so the user
    // sees the change without a refetch round-trip.
    useProjectRealtime({
        onStatusChanged: ({ projectId, status }) => {
            setProjects((prev) =>
                prev.map((p) => (p._id === projectId ? { ...p, status } : p)),
            );
        },
        onArchived: ({ projectId }) => {
            setProjects((prev) => {
                const target = prev.find((p) => p._id === projectId);
                if (target && !showArchived) {
                    toast(
                        t('projects.realtime.archivedByTeammate', {
                            name: target.name,
                            defaultValue: `"${target.name}" was archived by a teammate`,
                        }),
                        { icon: '📦' },
                    );
                    return prev.filter((p) => p._id !== projectId);
                }
                return prev.map((p) =>
                    p._id === projectId ? { ...p, isArchived: true } : p,
                );
            });
        },
        onRestored: ({ projectId }) => {
            setProjects((prev) =>
                prev.map((p) =>
                    p._id === projectId ? { ...p, isArchived: false } : p,
                ),
            );
        },
    });

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
        setSearchTerm('');
        setStatusFilter('');
        setRefreshKey((k) => k + 1);
        initialLoad.current = true;
    };
    const handleProjectAdded = () => {
        setIsModalOpen(false);
        setRefreshKey((k) => k + 1);
        initialLoad.current = true;
    };
    const handleViewChange = (view) => {
        setCurrentView(view);
        localStorage.setItem('projectsViewPreference', view);
    };

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
        } catch (error) {
            console.error(error);
            setProjects(originalProjects);
        }
    };

    if (isInitialLoading || authLoading)
        return <LoadingScreen message={t('projects.misc.loadingProjects')} />;

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-xl border border-destructive/50 bg-card px-6 py-6 text-destructive shadow-sm">
                    <div className="mb-2 text-lg font-semibold">
                        {t('projects.misc.error')}
                    </div>
                    <div className="text-sm">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 w-full rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-colors hover:bg-destructive/90 sm:w-auto"
                    >
                        {t('projects.misc.backToDashboard')}
                    </button>
                </div>
            </div>
        );
    }

    if (!companyId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-xl border border-yellow-500/50 bg-card px-6 py-6 text-yellow-500 shadow-sm">
                    <div className="mb-2 text-lg font-semibold">
                        {t('projects.misc.noCompanyAssigned')}
                    </div>
                    <div className="text-sm">
                        {t('projects.misc.noCompanyAssignedMessage')}
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 w-full rounded-lg bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600 sm:w-auto"
                    >
                        {t('projects.misc.backToDashboard')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full select-none flex-col space-y-6 px-6 pb-6 pt-6 md:px-8 md:pt-8">
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
            />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="mr-2 md:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {t('projects.projectListHeader.title')}
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('projects.projectListHeader.subtitle')}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                    {(currentUserRole === 'admin' ||
                        currentUserRole === 'hr') && (
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="outline"
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>
                                {t('projects.projectListHeader.addProject')}
                            </span>
                        </Button>
                    )}
                    <div className="relative w-full sm:w-auto">
                        <input
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[250px]"
                            placeholder={t('projects.filter.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & View Switcher - Styled to match the flow */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative">
                        <Select
                            className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[200px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">
                                {t('projects.filter.allStatuses')}
                            </option>
                            <option value="pending">
                                {t('common.projectStatus.pending')}
                            </option>
                            <option value="running">
                                {t('common.projectStatus.running')}
                            </option>
                            <option value="completed">
                                {t('common.projectStatus.completed')}
                            </option>
                            <option value="on-hold">
                                {t('common.projectStatus.on-hold')}
                            </option>
                        </Select>
                        <ListFilter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                        <button
                            onClick={() => setShowArchived(false)}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                                !showArchived
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <FolderKanban className="h-3.5 w-3.5" />
                            {t('projects.misc.active')}
                        </button>
                        <button
                            onClick={() => setShowArchived(true)}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                                showArchived
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <Archive className="h-3.5 w-3.5" />
                            {t('projects.misc.archive')}
                        </button>
                    </div>
                    {screenSize !== 'mobile' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            className={`h-10 w-10 ${isFiltering ? 'animate-spin' : ''}`}
                            title={t('projects.filter.refresh')}
                        >
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    )}
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

            {/* Main Content Card */}
            <Card
                className={`transition-opacity duration-300 ${
                    isFiltering ? 'opacity-60' : 'opacity-100'
                } h-full border-border bg-card shadow-sm`}
            >
                <CardContent className="h-full p-0">
                    {currentUserRole !== 'employee' &&
                        selectedProjects.length > 0 && (
                            <div className="border-b border-border bg-muted/30 p-4">
                                <BulkActionsHeader
                                    selectedCount={selectedProjects.length}
                                    onClearSelection={() =>
                                        setSelectedProjects([])
                                    }
                                    onArchive={() =>
                                        handleBulkAction('archive')
                                    }
                                    onRestore={() =>
                                        handleBulkAction('restore')
                                    }
                                    onDelete={() => handleBulkAction('delete')}
                                    showArchived={showArchived}
                                />
                            </div>
                        )}

                    <div className="h-full p-4 md:p-6">
                        {projects.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                        <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {showArchived
                                        ? t('projects.misc.noArchivedProjects')
                                        : t('projects.misc.noProjectsFound')}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t('common.tryDifferentSearch')}
                                </p>
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
                            <ListView
                                projects={projects}
                                currentUserRole={currentUserRole}
                                onArchive={handleArchive}
                                onRestore={handleRestore}
                                onPermanentDelete={handlePermanentDelete}
                                onRowClick={handleRowClick}
                                showArchived={showArchived}
                                selectedProjects={selectedProjects}
                                onToggleSelect={toggleSelection}
                                onToggleSelectAll={toggleSelectAll}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <footer className="mt-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
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
