import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import api from '../services/api.js';
import UserManagementModal from '../components/UserManagementModal.jsx';

import clsx from 'clsx';
import {
    translateProjectStatus,
    translatePriority,
} from '../utils/translations';
import { useAuth } from '../context/useAuth';
import LoadingScreen from '../components/LoadingScreen.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import {
    Icon,
    getPriorityClasses,
    getStatusClasses,
    getStatusColor,
    getPriorityColor,
    AVAILABLE_STATUSES,
    AVAILABLE_PRIORITIES,
} from '../components/projects/ProjectTaskShared.jsx';
import { ChevronRight } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import { Select } from '../components/ui/Select';

// Moment locale is set dynamically in the component

const formatDateForDisplay = (dateString, language = 'pl') => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        console.error('Error formatting date', e);
        return i18n.t('common.invalidDate');
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
        return '';
    }
};
import StatCard from '../components/projects/details/StatCard';
import CircularProgress from '../components/projects/details/CircularProgress';
import ContentCard from '../components/projects/details/ContentCard';
import CommentItem from '../components/projects/details/CommentItem';
import ProjectTeam from '../components/projects/details/ProjectTeam';
import ProjectComments from '../components/projects/details/ProjectComments';
import ProjectActivities from '../components/projects/details/ProjectActivities';
import toast from 'react-hot-toast';

export default function ProjectDetails() {
    const { t, i18n: i18nInstance } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const { user: currentUser } = useAuth(); // Use currentUser from AuthContext

    useEffect(() => {
        // locale is handled dynamically in date-fns
    }, [i18nInstance.language]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const [tasks, setTasks] = useState([]);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const [activities, setActivities] = useState([]);
    const [showActivities, setShowActivities] = useState(false);

    const [confirmationProps, setConfirmationProps] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const askForConfirmation = (props) => {
        setConfirmationProps({ isOpen: true, ...props });
    };

    const fetchData = useCallback(
        async (showLoader = false) => {
            if (showLoader) setLoading(true);
            try {
                const res = await api.get(`/projects/${id}`);
                setProject(res.data);
                setEditData({
                    name: res.data.name,
                    description: res.data.description,
                    status: res.data.status,
                    priority: res.data.priority,
                    // progress: res.data.progress || 0, // Calculated automatically
                    startDate: formatDateForInput(res.data.startDate),
                    endDate: formatDateForInput(res.data.endDate),
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching project:', err);
                setError(
                    `${t('projects.details.errors.fetchErrorDetail')}: ${err.response?.data?.message || err.message}`,
                );
            } finally {
                if (showLoader) setLoading(false);
            }
        },
        [id, t],
    );

    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get(`/tasks/project/${id}`);
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    }, [id]);

    const fetchComments = useCallback(async () => {
        try {
            const res = await api.get(`/comments/project/${id}`);
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    }, [id]);

    const fetchActivities = useCallback(async () => {
        try {
            const res = await api.get(`/activities/project/${id}`);
            setActivities(res.data.activities);
        } catch (err) {
            console.error('Error fetching activities:', err);
        }
    }, [id]);

    useEffect(() => {
        if (id && currentUser) {
            fetchData(true);
            fetchTasks();
            fetchComments();
            fetchActivities();
        }
    }, [
        id,
        currentUser,
        fetchData,
        fetchTasks,
        fetchComments,
        fetchActivities,
    ]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.patch(`/projects/${id}`, {
                ...editData,
                startDate: editData.startDate || null,
                endDate: editData.endDate || null,
                company: currentUser.company._id,
            });
            await fetchData();
            await fetchActivities();
            setIsEditing(false);
            setIsEditing(false);
        } catch (err) {
            toast.error(`${t('common.error')}: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        askForConfirmation({
            title: t('projects.details.errors.deleteTaskTitle'),
            message: t('projects.details.errors.deleteTaskMessage'),
            confirmText: t('common.delete'),
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/tasks/${taskId}`, {
                        params: { company: currentUser?.company?._id },
                    });
                    fetchTasks();
                    fetchActivities();
                } catch (err) {
                    toast.error(`${t('common.error')}: ${err.message}`);
                }
            },
        });
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await api.post('/comments', {
                content: newComment,
                project: id,
            });
            setNewComment('');
            fetchComments();
            fetchActivities();
        } catch (err) {
            toast.error(`${t('common.error')}: ${err.message}`);
        }
    };

    const handleReplyComment = async (parentId, content) => {
        try {
            await api.post('/comments', {
                content,
                project: id,
                parentComment: parentId,
            });
            fetchComments();
        } catch (err) {
            toast.error(`${t('common.error')}: ${err.message}`);
        }
    };

    const handleDeleteComment = async (commentId) => {
        askForConfirmation({
            title: t('projects.details.errors.deleteCommentTitle'),
            message: t('projects.details.errors.deleteCommentMessage'),
            confirmText: t('common.delete'),
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/comments/${commentId}`);
                    fetchComments();
                    fetchActivities();
                } catch (err) {
                    toast.error(`${t('common.error')}: ${err.message}`);
                }
            },
        });
    };

    const handleProjectUpdate = useCallback(() => {
        fetchData();
        fetchActivities();
    }, [fetchData, fetchActivities]);

    const taskStats = useMemo(
        () =>
            tasks.reduce(
                (acc, task) => {
                    acc.total++;
                    if (task.status === 'completed') acc.completed++;
                    if (task.status === 'in-progress') acc.inProgress++;
                    if (task.status === 'todo') acc.todo++;
                    return acc;
                },
                { total: 0, completed: 0, inProgress: 0, todo: 0 },
            ),
        [tasks],
    );

    const calculatedProgress = useMemo(
        () =>
            taskStats.total > 0
                ? Math.round((taskStats.completed / taskStats.total) * 100)
                : 0,
        [taskStats.total, taskStats.completed],
    );

    if (loading || !currentUser) {
        return <LoadingScreen message={t('projects.details.loading')} />;
    }

    // A manual progress fallback is unnecessary if we want full automation,
    // but it might be worth keeping as a visual fallback while tasks are still loading?
    // The loader handles that anyway.

    const isAdmin =
        currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

    if (error) {
        return (
            <div className="py-10 text-center text-destructive">{error}</div>
        );
    }

    return (
        <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-background font-sans text-foreground lg:flex-row">
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
            />
            {/* Sidebar - Left Panel */}
            <aside className="flex w-full max-w-full flex-col border-b border-r-0 border-border bg-card px-3 py-4 sm:p-6 lg:min-h-screen lg:w-[360px] lg:max-w-[360px] lg:border-b-0 lg:border-r lg:p-8">
                <div className="mb-6 flex items-center gap-4 lg:mb-10">
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-primary active:scale-95"
                    >
                        <Icon.Back size={18} />
                    </button>
                    <div className="flex min-w-0 flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                            {t('projects.details.title')}
                        </span>
                        <h2 className="truncate text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
                            {project.name}
                        </h2>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-center gap-6 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-4 shadow-inner sm:flex-col sm:py-6 lg:flex-col">
                    <CircularProgress progress={calculatedProgress} />
                    <div className="flex flex-col items-center sm:mt-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            {calculatedProgress === 100
                                ? 'Completed'
                                : t('projects.details.progress')}
                        </p>
                        <div className="mt-1 h-1 w-12 rounded-full bg-primary/20 sm:hidden"></div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:mt-10 lg:grid-cols-1">
                    <StatCard
                        icon={<Icon.Calendar className="h-5 w-5" />}
                        title={t('projects.details.duration')}
                    >
                        {isEditing && isAdmin ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={editData.startDate}
                                    onChange={handleEditChange}
                                    aria-label={t('projects.labelStartDate')}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={editData.endDate}
                                    onChange={handleEditChange}
                                    aria-label={t('projects.labelEndDate')}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        ) : (
                            <div className="text-xs font-bold tracking-tight sm:text-sm">
                                <span className="block sm:inline">
                                    {formatDateForDisplay(
                                        project.startDate,
                                        i18nInstance.language,
                                    )}
                                </span>
                                <span className="mx-1 hidden sm:inline">—</span>
                                <span className="block text-muted-foreground sm:hidden">
                                    ↓
                                </span>
                                <span className="block sm:inline">
                                    {formatDateForDisplay(
                                        project.endDate,
                                        i18nInstance.language,
                                    )}
                                </span>
                            </div>
                        )}
                    </StatCard>
                    <StatCard
                        icon={<Icon.Status className="h-5 w-5" />}
                        title={t('projects.details.statusAndPriority')}
                    >
                        {isEditing && isAdmin ? (
                            <div className="flex flex-col gap-2">
                                <Select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleEditChange}
                                    aria-label={t('common.status')}
                                >
                                    {AVAILABLE_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {translateProjectStatus(
                                                s,
                                                i18nInstance.language,
                                            )}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    name="priority"
                                    value={editData.priority}
                                    onChange={handleEditChange}
                                    aria-label={t('projects.labelPriority')}
                                >
                                    {AVAILABLE_PRIORITIES.map((p) => (
                                        <option key={p} value={p}>
                                            {translatePriority(
                                                p,
                                                i18nInstance.language,
                                            )}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <div
                                    className={clsx(
                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                                        getStatusClasses(project.status),
                                    )}
                                >
                                    <div
                                        className={clsx(
                                            'h-1.5 w-1.5 rounded-full',
                                            getStatusColor(project.status),
                                            project.status === 'running' &&
                                                'animate-pulse',
                                        )}
                                    />
                                    {translateProjectStatus(
                                        project.status,
                                        i18nInstance.language,
                                    )}
                                </div>
                                <div
                                    className={clsx(
                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                                        getPriorityClasses(project.priority),
                                    )}
                                >
                                    <div
                                        className={clsx(
                                            'h-1.5 w-1.5 rounded-full',
                                            getPriorityColor(project.priority),
                                        )}
                                    />
                                    {translatePriority(
                                        project.priority,
                                        i18nInstance.language,
                                    )}
                                </div>
                            </div>
                        )}
                    </StatCard>

                    {/* Task statistics */}
                    <StatCard
                        icon={<Icon.ListTodo className="h-5 w-5" />}
                        title={t('projects.details.statCardTitle')}
                    >
                        <div className="mt-2 space-y-2.5">
                            {[
                                {
                                    label: t('projects.details.totalTasks'),
                                    value: taskStats.total,
                                    color: 'text-foreground',
                                },
                                {
                                    label: t('projects.details.completedTasks'),
                                    value: taskStats.completed,
                                    color: 'text-primary',
                                },
                                {
                                    label: t(
                                        'projects.details.inProgressTasks',
                                    ),
                                    value: taskStats.inProgress,
                                    color: 'text-blue-500',
                                },
                                {
                                    label: t('projects.details.todoTasks'),
                                    value: taskStats.todo,
                                    color: 'text-muted-foreground',
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="group flex items-center justify-between"
                                >
                                    <span className="mr-4 flex-1 border-b border-dotted border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {stat.label}
                                    </span>
                                    <span
                                        className={clsx(
                                            'text-sm font-bold tabular-nums',
                                            stat.color,
                                        )}
                                    >
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </StatCard>
                </div>
                <div className="hidden lg:block">
                    <div className="mt-auto pt-8 text-center text-xs text-muted-foreground">
                        <p>
                            {t('projects.details.createdBy')}{' '}
                            <span className="font-semibold text-foreground">
                                {project.createdBy.username}
                            </span>
                        </p>
                        <p>
                            {formatDateForDisplay(
                                project.createdAt,
                                i18nInstance.language,
                            )}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-background p-3 sm:p-6 lg:p-10">
                <div className="space-y-4 sm:space-y-6 lg:space-y-10">
                    <header className="relative rounded-lg border border-border bg-card p-4 shadow-sm sm:p-8 lg:p-10">
                        <div className="relative z-10">
                            {isEditing && isAdmin ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleEditChange}
                                    aria-label={t(
                                        'projects.details.projectNamePlaceholder',
                                    )}
                                    className="w-full border-b border-border bg-transparent text-2xl font-bold tracking-tight text-foreground focus:border-primary focus:outline-none sm:text-4xl lg:text-5xl"
                                    placeholder={t(
                                        'projects.details.projectNamePlaceholder',
                                    )}
                                />
                            ) : (
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                    {project.name}
                                </h1>
                            )}

                            {isAdmin && (
                                <div className="mt-8 flex flex-wrap gap-3">
                                    {isEditing ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                                        {t(
                                                            'projects.details.saving',
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Icon.Save size={16} />
                                                        {t(
                                                            'projects.details.saveChanges',
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    fetchData();
                                                }}
                                                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
                                            >
                                                <Icon.Cancel size={16} />
                                                {t('projects.details.cancel')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsEditing(true)
                                                }
                                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                                            >
                                                <Icon.Edit size={16} />
                                                {t('projects.details.edit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowUserModal(true)
                                                }
                                                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
                                            >
                                                <Icon.User size={16} />
                                                {t(
                                                    'projects.details.manageTeam',
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="animate-fade-in space-y-8 pb-20">
                        {/* PROJECT DESCRIPTION */}
                        <ContentCard
                            icon={<Icon.Description className="h-5 w-5" />}
                            title={t('projects.details.description')}
                        >
                            {isEditing && isAdmin ? (
                                <textarea
                                    name="description"
                                    value={editData.description}
                                    onChange={handleEditChange}
                                    rows={6}
                                    aria-label={t(
                                        'projects.details.description',
                                    )}
                                    className="w-full rounded-lg border border-border bg-background p-4 text-sm font-medium placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                                    placeholder={t(
                                        'projects.details.addDescriptionPlaceholder',
                                    )}
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-loose text-muted-foreground/80">
                                    {project.description ||
                                        t('projects.details.noDescription')}
                                </p>
                            )}
                        </ContentCard>

                        {/* TASKS KANBAN */}
                        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3 sm:px-8 sm:py-5">
                                <div className="flex items-center gap-3">
                                    <Icon.ListTodo className="h-4 w-4 text-primary" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                        {t('projects.details.tasksTitle')}
                                        <span className="ml-2 text-primary/60">
                                            ({tasks.length})
                                        </span>
                                    </h2>
                                </div>
                            </div>
                            <div className="overflow-x-auto p-1 sm:p-4">
                                <KanbanBoard
                                    tasks={tasks}
                                    onUpdate={fetchTasks}
                                    onDelete={handleDeleteTask}
                                    projectUsers={project.assignedUsers}
                                    isAdmin={isAdmin}
                                    projectId={id}
                                    onTaskCreated={fetchTasks}
                                    isProjectEditing={isEditing}
                                />
                            </div>
                        </div>

                        {/* PROJECT TEAM */}
                        <ProjectTeam assignedUsers={project.assignedUsers} />

                        {/* KOMENTARZE */}
                        <ProjectComments
                            comments={comments}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            handleAddComment={handleAddComment}
                            handleDeleteComment={handleDeleteComment}
                            handleReplyComment={handleReplyComment}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                        />

                        {/* ACTIVITY HISTORY */}
                        <ProjectActivities
                            activities={activities}
                            showActivities={showActivities}
                            setShowActivities={setShowActivities}
                        />
                    </div>
                </div>
                {showUserModal && (
                    <UserManagementModal
                        project={project}
                        onClose={() => setShowUserModal(false)}
                        onUpdate={handleProjectUpdate}
                    />
                )}
            </main>
        </div>
    );
}
