import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import api from '../services/api.js';
import UserManagementModal from '../components/UserManagementModal.jsx';
import moment from 'moment';
import 'moment/locale/pl';
import clsx from 'clsx';
import {
    translateProjectStatus,
    translatePriority,
} from '../utils/translations';
import { useAuth } from '../context/AuthContext';
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

const StatCard = ({ icon, title, children }) => (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 shadow-sm transition-all hover:bg-muted/50 hover:shadow-md hover:border-primary/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border group-hover:text-primary group-hover:border-primary/30 transition-colors">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">{title}</h3>
            <div className="mt-0.5 text-lg font-bold tracking-tight text-foreground">{children}</div>
        </div>
    </div>
);

const CircularProgress = ({ progress }) => {
    const radius = 60,
        stroke = 10;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90 transform"
            >
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-border/40"
                />
                <circle
                    stroke="url(#progressGradient)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-1000 ease-in-out"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(var(--primary))" />
                        <stop offset="100%" stopColor="rgb(var(--primary) / 0.5)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black tracking-tighter text-foreground sm:text-3xl">
                    {progress}%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Done
                </span>
            </div>
        </div>
    );
};

const ContentCard = ({ icon, title, children, actions }) => (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary border border-border shadow-sm sm:h-9 sm:w-9">
                    {icon}
                </div>
                <h2 className="truncate text-sm font-bold uppercase tracking-widest text-foreground/90 sm:text-xl sm:normal-case sm:tracking-tight">
                    {title}
                </h2>
            </div>
            {actions && (
                <div className="flex shrink-0 gap-2">{actions}</div>
            )}
        </div>
        <div className="p-4 sm:p-6">{children}</div>
    </div>
);

// Komponent Komentarza
const CommentItem = ({
    comment,
    onDelete,
    onReply,
    currentUserId,
    isAdmin,
    t,
}) => {
    const [showReplies, setShowReplies] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const canDelete = comment.author._id === currentUserId || isAdmin;

    const handleReply = async () => {
        if (!replyText.trim()) return;
        await onReply(comment._id, replyText);
        setReplyText('');
        setIsReplying(false);
        setShowReplies(true);
    };

    return (
        <div className="relative border-l-2 border-border pl-6 pb-6">
            <div className="absolute left-[-5px] top-2 h-2.5 w-2.5 rounded-full border border-border bg-muted-foreground" />
            
            <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground font-semibold border border-border">
                    {comment.author.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:bg-muted/30">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">
                                    {comment.author.username}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                                    {moment(comment.createdAt).fromNow()}
                                </span>
                            </div>
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(comment._id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
                                >
                                    <Icon.Trash className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                            {comment.content}
                        </p>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline"
                        >
                            {t('projects.details.reply')}
                        </button>
                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            >
                                {showReplies ? (
                                    <Icon.ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                    <Icon.ChevronRight className="h-3.5 w-3.5" />
                                )}
                                {comment.replies.length}{' '}
                                {t('projects.details.replies', {
                                    count: comment.replies.length,
                                })}
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleReply()
                                }
                                placeholder={t(
                                    'projects.details.replyPlaceholder',
                                )}
                                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            />{' '}
                            <button
                                onClick={handleReply}
                                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                            >
                                <Icon.Send />
                            </button>
                        </div>
                    )}

                    {showReplies &&
                        comment.replies &&
                        comment.replies.length > 0 && (
                            <div className="mt-3 space-y-3">
                                {comment.replies.map((reply) => (
                                    <div key={reply._id} className="flex gap-2">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                                            {reply.author.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="rounded-lg border border-border bg-card p-2">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {reply.author.username}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {moment(
                                                            reply.createdAt,
                                                        ).fromNow()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/80">
                                                    {reply.content}
                                                </p>
                                            </div>{' '}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

// Główny komponent
export default function ProjectDetails() {
    const { t, i18n: i18nInstance } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const { user: currentUser } = useAuth(); // Use currentUser from AuthContext

    useEffect(() => {
        moment.locale(i18nInstance.language);
    }, [i18nInstance.language]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // States dla zadań
    const [tasks, setTasks] = useState([]);

    // States dla komentarzy
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // States dla aktywności
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
                    // progress: res.data.progress || 0, // Automatyczne wyliczanie
                    startDate: formatDateForInput(res.data.startDate),
                    endDate: formatDateForInput(res.data.endDate),
                });
                setError(null);
            } catch (err) {
                console.error('Błąd pobierania projektu:', err);
                setError(
                    `${t('projects.details.errors.fetchErrorDetail')}: ${err.response?.data?.message || err.message}`,
                );
            } finally {
                if (showLoader) setLoading(false);
            }
        },
        [id],
    );

    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get(`/tasks/project/${id}`);
            setTasks(res.data);
        } catch (err) {
            console.error('Błąd pobierania zadań:', err);
        }
    }, [id]);

    const fetchComments = useCallback(async () => {
        try {
            const res = await api.get(`/comments/project/${id}`);
            setComments(res.data);
        } catch (err) {
            console.error('Błąd pobierania komentarzy:', err);
        }
    }, [id]);

    const fetchActivities = useCallback(async () => {
        try {
            const res = await api.get(`/activities/project/${id}`);
            setActivities(res.data.activities);
        } catch (err) {
            console.error('Błąd pobierania aktywności:', err);
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
            error(`${t('common.error')}: ${err.message}`, 'error');
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
                    error(`${t('common.error')}: ${err.message}`, 'error');
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
            error(`${t('common.error')}: ${err.message}`, 'error');
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
            error(`${t('common.error')}: ${err.message}`, 'error');
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
                    error(`${t('common.error')}: ${err.message}`, 'error');
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

    // Fallback do ręcznego progressu jest niepotrzebny, jeśli chcemy full automation,
    // ale może warto zostawić jako fallback wizualny, gdy zadania się jeszcze ładują?
    // W sumie loader to obsłuży.

    const isAdmin =
        currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

    const renderActivityDescription = (activity) => {
        if (!activity.action) return activity.description;

        const { action, metadata } = activity;
        const translateStatus = (status) =>
            t(`common.taskStatus.${status}`) || status;

        switch (action) {
            case 'task_created':
            case 'task_completed':
            case 'task_deleted':
                return t(`projects.details.activities.${action}`, {
                    title: metadata?.title || '...',
                });
            case 'task_updated':
                return t('projects.details.activities.task_updated', {
                    title: metadata?.title || '...',
                    oldStatus: translateStatus(metadata?.oldStatus),
                    newStatus: translateStatus(metadata?.newStatus),
                });
            case 'comment_added':
            case 'comment_replied':
            case 'comment_deleted':
                return t(`projects.details.activities.${action}`);
            default:
                return activity.description;
        }
    };

    if (error) {
        return <div className="py-10 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="flex min-h-screen w-full max-w-full flex-col bg-background font-sans text-foreground lg:flex-row overflow-x-hidden">
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

                <div className="flex flex-row items-center justify-center gap-6 bg-gradient-to-br from-card to-muted/30 rounded-2xl border border-border p-4 shadow-inner sm:flex-col sm:py-6 lg:flex-col">
                    <CircularProgress progress={calculatedProgress} />
                    <div className="flex flex-col items-center sm:mt-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            {calculatedProgress === 100 ? "Completed" : t('projects.details.progress')}
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
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={editData.endDate}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        ) : (
                            <div className="text-xs font-bold tracking-tight sm:text-sm">
                                <span className="block sm:inline">{formatDateForDisplay(project.startDate, i18nInstance.language)}</span>
                                <span className="mx-1 hidden sm:inline">—</span>
                                <span className="block text-muted-foreground sm:hidden">↓</span>
                                <span className="block sm:inline">{formatDateForDisplay(project.endDate, i18nInstance.language)}</span>
                            </div>
                        )}
                    </StatCard>
                    <StatCard
                        icon={<Icon.Status className="h-5 w-5" />}
                        title={t('projects.details.statusAndPriority')}
                    >
                        {isEditing && isAdmin ? (
                            <div className="flex flex-col gap-2">
                                <select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                                >
                                    {AVAILABLE_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {translateProjectStatus(s, i18nInstance.language)}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="priority"
                                    value={editData.priority}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                                >
                                    {AVAILABLE_PRIORITIES.map((p) => (
                                        <option key={p} value={p}>
                                            {translatePriority(p, i18nInstance.language)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <div className={clsx(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                                    getStatusClasses(project.status)
                                )}>
                                    <div className={clsx(
                                        'h-1.5 w-1.5 rounded-full', 
                                        getStatusColor(project.status),
                                        project.status === 'running' && 'animate-pulse'
                                    )} />
                                    {translateProjectStatus(project.status, i18nInstance.language)}
                                </div>
                                <div className={clsx(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                                    getPriorityClasses(project.priority)
                                )}>
                                    <div className={clsx('h-1.5 w-1.5 rounded-full', getPriorityColor(project.priority))} />
                                    {translatePriority(project.priority, i18nInstance.language)}
                                </div>
                            </div>
                        )}
                    </StatCard>

                    {/* Statystyki zadań */}
                    <StatCard
                        icon={<Icon.ListTodo className="h-5 w-5" />}
                        title={t('projects.details.statCardTitle')}
                    >
                        <div className="mt-2 space-y-2.5">
                            {[
                                { label: t('projects.details.totalTasks'), value: taskStats.total, color: 'text-foreground' },
                                { label: t('projects.details.completedTasks'), value: taskStats.completed, color: 'text-primary' },
                                { label: t('projects.details.inProgressTasks'), value: taskStats.inProgress, color: 'text-blue-500' },
                                { label: t('projects.details.todoTasks'), value: taskStats.todo, color: 'text-muted-foreground' }
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between group">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-dotted border-border flex-1 mr-4">
                                        {stat.label}
                                    </span>
                                    <span className={clsx('text-sm font-bold tabular-nums', stat.color)}>
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
            <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-background p-3 sm:p-6 lg:p-10">
                <div className="space-y-4 sm:space-y-6 lg:space-y-10">
                    <header className="relative rounded-lg border border-border bg-card p-4 sm:p-8 lg:p-10 shadow-sm">
                        <div className="relative z-10">
                            
                            {isEditing && isAdmin ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleEditChange}
                                    className="w-full border-b border-border bg-transparent text-2xl font-bold tracking-tight text-foreground focus:border-primary focus:outline-none sm:text-4xl lg:text-5xl"
                                    placeholder={t('projects.details.projectNamePlaceholder')}
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
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95"
                                            >
                                                {isSaving ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                                        {t('projects.details.saving')}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Icon.Save size={16} />
                                                        {t('projects.details.saveChanges')}
                                                    </>
                                                )}
                                            </button>
                                            <button
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
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                                            >
                                                <Icon.Edit size={16} />
                                                {t('projects.details.edit')}
                                            </button>
                                            <button
                                                onClick={() => setShowUserModal(true)}
                                                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
                                            >
                                                <Icon.User size={16} />
                                                {t('projects.details.manageTeam')}
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
                                className="w-full rounded-lg border border-border bg-background p-4 text-sm font-medium focus:border-primary focus:outline-none placeholder:text-muted-foreground/40"
                                placeholder={t('projects.details.addDescriptionPlaceholder')}
                            />
                        ) : (
                            <p className="whitespace-pre-wrap text-sm leading-loose text-muted-foreground/80">
                                {project.description || t('projects.details.noDescription')}
                            </p>
                        )}
                    </ContentCard>

                    {/* TASKS KANBAN */}
                    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3 sm:px-8 sm:py-5">
                            <div className="flex items-center gap-3">
                                <Icon.ListTodo className="h-4 w-4 text-primary" />
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                    {t('projects.details.tasksTitle')}
                                    <span className="ml-2 text-primary/60">({tasks.length})</span>
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
                    <ContentCard
                        icon={<Icon.Users className="h-5 w-5" />}
                        title={`${t('projects.details.teamTitle')} (${project.assignedUsers.length})`}
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                            {project.assignedUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="group relative flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/40"
                                >
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg" />
                                    
                                    <div className={clsx(
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white",
                                        user.role === 'admin' ? "bg-amber-500" : "bg-primary"
                                    )}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-foreground">
                                            {user.username}
                                        </p>
                                        <p className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                            {user.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {project.assignedUsers.length === 0 && (
                                <div className="col-span-full py-10 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground/40 border border-border">
                                        <Icon.Users className="h-8 w-8" />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
                                        {t('projects.details.noUsers')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ContentCard>

                    {/* KOMENTARZE */}
                    <ContentCard
                        icon={<Icon.Message />}
                        title={`${t('projects.details.commentsTitle')} (${comments.length})`}
                    >
                        <div className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && handleAddComment()
                                    }
                                    placeholder={t(
                                        'projects.details.addCommentPlaceholder',
                                    )}
                                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none"
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="flex-shrink-0 rounded-lg bg-primary p-3 text-primary-foreground hover:bg-primary/90 sm:p-2 sm:px-4"
                                >
                                    <Icon.Send />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    {t('projects.details.noComments')}
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <CommentItem
                                        key={comment._id}
                                        comment={comment}
                                        onDelete={handleDeleteComment}
                                        onReply={handleReplyComment}
                                        currentUserId={currentUser._id}
                                        isAdmin={isAdmin}
                                        t={t}
                                    />
                                ))
                            )}
                        </div>
                    </ContentCard>

                    {/* HISTORIA AKTYWNOŚCI */}
                    <ContentCard
                        icon={<Icon.Activity />}
                        title={`${t('projects.details.activityTitle')} (${activities.length})`}
                        actions={
                            <button
                                onClick={() =>
                                    setShowActivities(!showActivities)
                                }
                                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                            >
                                {showActivities
                                    ? t('projects.details.hide')
                                    : t('projects.details.show')}
                                {showActivities ? (
                                    <Icon.ChevronDown />
                                ) : (
                                    <Icon.ChevronRight />
                                )}
                            </button>
                        }
                    >
                        {showActivities && (
                            <div className="divide-y divide-border/20">
                                {activities.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground/30 border border-border">
                                            <Icon.Activity className="h-8 w-8" />
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
                                            {t('projects.details.noActivity')}
                                        </p>
                                    </div>
                                ) : (
                                    activities.map((activity) => (
                                        <div
                                            key={activity._id}
                                            className="group relative flex items-start gap-3 p-3 sm:gap-4 sm:p-5 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                                                <span className="text-sm font-black">
                                                    {activity.user.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <p className="text-sm font-bold text-foreground">
                                                        {activity.user.username}
                                                    </p>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                        {moment(activity.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground/70">
                                                    {renderActivityDescription(activity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </ContentCard>
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
