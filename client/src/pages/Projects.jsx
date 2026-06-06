import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';

import LoadingScreen from '../components/LoadingScreen';
import AddProjectModal from '../components/AddProjectModal.jsx';
import { useAuth } from '../context/useAuth';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import { useProjectRealtime } from '../hooks/useProjectRealtime';
import toast from 'react-hot-toast';

import ProjectsHeader from '../components/projects/list/ProjectsHeader';
import ProjectsFilterBar from '../components/projects/list/ProjectsFilterBar';
import ProjectsContent from '../components/projects/list/ProjectsContent';

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

    // Live updates from other clients in the same tenant
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
                        type="button"
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
                        type="button"
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

            <ProjectsHeader
                navigate={navigate}
                t={t}
                currentUserRole={currentUserRole}
                setIsModalOpen={setIsModalOpen}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <ProjectsFilterBar
                t={t}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                showArchived={showArchived}
                setShowArchived={setShowArchived}
                screenSize={screenSize}
                isFiltering={isFiltering}
                handleRefresh={handleRefresh}
                currentView={currentView}
                handleViewChange={handleViewChange}
            />

            <ProjectsContent
                isFiltering={isFiltering}
                projects={projects}
                currentUserRole={currentUserRole}
                selectedProjects={selectedProjects}
                setSelectedProjects={setSelectedProjects}
                handleBulkAction={handleBulkAction}
                showArchived={showArchived}
                screenSize={screenSize}
                currentView={currentView}
                handleArchive={handleArchive}
                handleRestore={handleRestore}
                handlePermanentDelete={handlePermanentDelete}
                handleRowClick={handleRowClick}
                toggleSelection={toggleSelection}
                toggleSelectAll={toggleSelectAll}
                handleStatusChange={handleStatusChange}
                t={t}
            />

            <footer
                suppressHydrationWarning
                className="mt-8 text-center text-xs uppercase tracking-widest text-muted-foreground"
            >
                © {new Date().getFullYear()} WorkNest - {t('footer.Rights')}
            </footer>

            {isModalOpen && (
                <AddProjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleProjectAdded}
                />
            )}
        </div>
    );
}
