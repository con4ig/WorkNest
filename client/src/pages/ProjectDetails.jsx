import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import UserManagementModal from '../components/UserManagementModal.jsx';
import moment from 'moment';
import 'moment/locale/pl';
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
    AVAILABLE_STATUSES,
    AVAILABLE_PRIORITIES,
} from '../components/projects/ProjectTaskShared.jsx';
import { ChevronRight } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

moment.locale('pl');

const formatDateForDisplay = (dateString) => {
    if (!dateString) return null;
    try {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        console.error('Error formatting date', e);
        return 'Błędna data';
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
    <div className="flex items-start gap-3 sm:gap-4">
        <div className="mt-1 flex-shrink-0">{icon}</div>
        <div className="w-full min-w-0">
            <h3 className="truncate font-semibold text-gray-500">{title}</h3>
            <div className="mt-1">{children}</div>
        </div>
    </div>
);

const CircularProgress = ({ progress }) => {
    const radius = 60,
        stroke = 12;
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
                    stroke="#e2e8f0"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="url(#progressGradientLight)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-500 ease-in-out"
                />
                <defs>
                    <linearGradient
                        id="progressGradientLight"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-2xl font-bold text-emerald-600 sm:text-3xl">
                {progress}%
            </div>
        </div>
    );
};

const ContentCard = ({ icon, title, children, actions }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 sm:mb-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                {icon}
                <h2 className="truncate text-xl font-bold text-gray-800 sm:text-2xl">
                    {title}
                </h2>
            </div>
            {actions && (
                <div className="flex flex-shrink-0 gap-2">{actions}</div>
            )}
        </div>
        {children}
    </div>
);

// Komponent Komentarza
const CommentItem = ({
    comment,
    onDelete,
    onReply,
    currentUserId,
    isAdmin,
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
        <div className="border-l-2 border-gray-200 pl-4">
            <div className="mb-3 flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                    {comment.author.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="rounded-lg bg-gray-50 p-3 transition-all duration-200 ease-in-out hover:scale-[1.005] hover:shadow-sm">
                        <div className="mb-1 flex items-center justify-between">
                            <span className="font-semibold text-gray-800">
                                {comment.author.username}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                    {moment(comment.createdAt).fromNow()}
                                </span>
                                {canDelete && (
                                    <button
                                        onClick={() => onDelete(comment._id)}
                                        className="text-slate-400 hover:text-red-600"
                                    >
                                        <Icon.Trash />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="whitespace-pre-wrap text-slate-700">
                            {comment.content}
                        </p>
                    </div>
                    <div className="mt-2 flex gap-3 text-sm">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            Odpowiedz
                        </button>
                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="flex items-center gap-1 text-slate-600 hover:text-slate-700"
                            >
                                {showReplies ? (
                                    <Icon.ChevronDown />
                                ) : (
                                    <Icon.ChevronRight />
                                )}
                                {comment.replies.length}{' '}
                                {comment.replies.length === 1
                                    ? 'odpowiedź'
                                    : 'odpowiedzi'}
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
                                placeholder="Napisz odpowiedź..."
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                            />{' '}
                            <button
                                onClick={handleReply}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
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
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">
                                            {reply.author.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="rounded-lg border border-gray-200 bg-white p-2">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {reply.author.username}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {moment(
                                                            reply.createdAt,
                                                        ).fromNow()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">
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
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const { user: currentUser } = useAuth(); // Use currentUser from AuthContext
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
                    `Nie udało się załadować danych projektu: ${err.response?.data?.message || err.message}`,
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
            error(`Błąd: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        askForConfirmation({
            title: 'Usuwanie Zadania',
            message:
                'Czy na pewno chcesz usunąć to zadanie? Ta operacja jest nieodwracalna.',
            confirmText: 'Usuń',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/tasks/${taskId}`, {
                        params: { company: currentUser?.company?._id },
                    });
                    fetchTasks();
                    fetchActivities();
                } catch (err) {
                    error(`Błąd: ${err.message}`, 'error');
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
            error(`Błąd: ${err.message}`, 'error');
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
            error(`Błąd: ${err.message}`, 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        askForConfirmation({
            title: 'Usuwanie Komentarza',
            message: 'Czy na pewno chcesz usunąć ten komentarz?',
            confirmText: 'Usuń',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/comments/${commentId}`);
                    fetchComments();
                    fetchActivities();
                } catch (err) {
                    error(`Błąd: ${err.message}`, 'error');
                }
            },
        });
    };

    const handleProjectUpdate = useCallback(() => {
        fetchData();
        fetchActivities();
    }, [fetchData, fetchActivities]);

    if (loading || !currentUser) {
        return <LoadingScreen message="Ładowanie projektu..." />;
    }

    // Calculate task statistics
    const taskStats = tasks.reduce(
        (acc, task) => {
            acc.total++;
            if (task.status === 'completed') acc.completed++;
            if (task.status === 'in-progress') acc.inProgress++;
            if (task.status === 'todo') acc.todo++;
            return acc;
        },
        { total: 0, completed: 0, inProgress: 0, todo: 0 },
    );

    const calculatedProgress =
        taskStats.total > 0
            ? Math.round((taskStats.completed / taskStats.total) * 100)
            : 0;

    // Fallback do ręcznego progressu jest niepotrzebny, jeśli chcemy full automation,
    // ale może warto zostawić jako fallback wizualny, gdy zadania się jeszcze ładują?
    // W sumie loader to obsłuży.

    const isAdmin =
        currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

    if (error) {
        return <div className="py-10 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-800 lg:flex-row">
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
            />
            {/* LEWY PANEL (SIDEBAR) */}
            <aside className="flex w-full flex-col border-r border-gray-200 bg-white p-4 lg:min-h-screen lg:w-[380px] lg:p-8">
                <div className="mb-8 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/projekty')}
                        className="rounded-lg bg-slate-100 p-2.5 transition-colors hover:bg-slate-200"
                    >
                        <Icon.Back />
                    </button>
                    <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                        Szczegóły Projektu
                    </h2>
                </div>

                <div className="flex flex-col items-center text-center">
                    <CircularProgress progress={calculatedProgress} />
                    <p className="mt-3 text-base font-semibold text-slate-600 sm:text-lg">
                        Postęp projektu
                    </p>
                </div>

                <div className="mt-8 space-y-6 sm:mt-10">
                    <StatCard
                        icon={<Icon.Calendar />}
                        title="Okres trwania projektu"
                    >
                        {isEditing && isAdmin ? (
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={editData.startDate}
                                    onChange={handleEditChange}
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={editData.endDate}
                                    onChange={handleEditChange}
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        ) : (
                            <p className="text-base font-bold text-gray-800 sm:text-lg">
                                {formatDateForDisplay(project.startDate) &&
                                formatDateForDisplay(project.endDate)
                                    ? `${formatDateForDisplay(project.startDate)} - ${formatDateForDisplay(project.endDate)}`
                                    : 'Nieokreślono'}
                            </p>
                        )}
                    </StatCard>
                    <StatCard
                        icon={
                            <ChevronRight className="h-6 w-6 text-emerald-500" />
                        }
                        title="Status i priorytet"
                    >
                        {isEditing && isAdmin ? (
                            <div className="flex flex-wrap gap-2">
                                <select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleEditChange}
                                    className={`w-full rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold capitalize ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto`}
                                >
                                    {AVAILABLE_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {translateProjectStatus(s)}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="priority"
                                    value={editData.priority}
                                    onChange={handleEditChange}
                                    className={`w-full rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold capitalize ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto`}
                                >
                                    {AVAILABLE_PRIORITIES.map((p) => (
                                        <option key={p} value={p}>
                                            {translatePriority(p)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${getStatusClasses(project.status)}`}
                                >
                                    {translateProjectStatus(project.status)}
                                </span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getPriorityClasses(project.priority)}`}
                                >
                                    {translatePriority(project.priority)}
                                </span>
                            </div>
                        )}
                    </StatCard>

                    {/* Statystyki zadań */}
                    <StatCard icon={<Icon.ListTodo />} title="Statystyki zadań">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Wszystkie:
                                </span>
                                <span className="font-bold">
                                    {taskStats.total}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Ukończone:
                                </span>
                                <span className="font-bold text-green-600">
                                    {taskStats.completed}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    W trakcie:
                                </span>
                                <span className="font-bold text-sky-600">
                                    {taskStats.inProgress}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Do zrobienia:
                                </span>
                                <span className="font-bold text-gray-600">
                                    {taskStats.todo}
                                </span>
                            </div>
                        </div>
                    </StatCard>
                </div>
                <div className="mt-auto pt-8 text-center text-xs text-gray-400">
                    <p>
                        Utworzony przez{' '}
                        <span className="font-semibold text-gray-500">
                            {project.createdBy.username}
                        </span>
                    </p>
                    <p>{formatDateForDisplay(project.createdAt)}</p>
                </div>
            </aside>

            {/* GŁÓWNA ZAWARTOŚĆ */}
            <main className="w-full flex-grow p-4 lg:p-10">
                <header className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 shadow-xl shadow-emerald-300/50 sm:rounded-3xl sm:p-8">
                    <div className="relative z-10">
                        {isEditing && isAdmin ? (
                            <input
                                type="text"
                                name="name"
                                value={editData.name}
                                onChange={handleEditChange}
                                className="w-full border-b-2 border-white/50 bg-transparent text-3xl font-extrabold tracking-tight text-white placeholder:text-white/70 focus:outline-none sm:text-4xl lg:text-5xl"
                                placeholder="Nazwa projektu..."
                            />
                        ) : (
                            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {project.name}
                            </h1>
                        )}
                        {isAdmin && (
                            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                                {isEditing && isAdmin ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-emerald-700 shadow-md transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-gray-200 disabled:opacity-60 sm:px-5 sm:py-2.5"
                                        >
                                            {isSaving ? (
                                                'Zapisywanie...'
                                            ) : (
                                                <>
                                                    <Icon.Save /> Zapisz zmiany
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                fetchData();
                                            }}
                                            className="flex items-center gap-2 rounded-lg bg-black/20 px-4 py-2 font-bold text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-black/30 sm:px-5 sm:py-2.5"
                                        >
                                            <Icon.Cancel /> Anuluj
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-slate-800 shadow-lg transition-all hover:bg-slate-200 sm:px-5 sm:py-2.5"
                                        >
                                            <Icon.Edit /> Edytuj
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowUserModal(true)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-black/20 px-4 py-2 font-bold text-white transition-all hover:bg-black/30 sm:px-5 sm:py-2.5"
                                        >
                                            <Icon.User /> Zarządzaj zespołem
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="animate-fade-in space-y-8">
                    {/* OPIS PROJEKTU */}
                    <ContentCard icon={<Icon.Info />} title="Opis projektu">
                        {isEditing && isAdmin ? (
                            <textarea
                                name="description"
                                value={editData.description}
                                onChange={handleEditChange}
                                rows="6"
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Dodaj szczegółowy opis..."
                            />
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-gray-600">
                                {project.description ||
                                    'Ten projekt nie ma jeszcze szczegółowego opisu.'}
                            </p>
                        )}
                    </ContentCard>

                    {/* ZADANIA */}
                    <ContentCard
                        icon={<Icon.ListTodo />}
                        title={`Zadania (${tasks.length})`}
                    >
                        <KanbanBoard
                            tasks={tasks}
                            onUpdate={fetchTasks}
                            onDelete={handleDeleteTask}
                            projectUsers={project.assignedUsers}
                            isAdmin={isAdmin}
                            projectId={id}
                            onTaskCreated={fetchTasks}
                        />
                    </ContentCard>

                    {/* ZESPÓŁ PROJEKTOWY */}
                    <ContentCard
                        icon={<Icon.Users />}
                        title={`Zespół projektowy (${project.assignedUsers.length})`}
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            {project.assignedUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-emerald-400 hover:bg-emerald-50 sm:gap-4 sm:p-4"
                                >
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white sm:h-11 sm:w-11 ${user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-gray-800">
                                            {user.username}
                                        </p>
                                        <p className="max-w-48 truncate text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {project.assignedUsers.length === 0 && (
                                <p className="col-span-full text-center text-gray-500 sm:text-left">
                                    Do tego projektu nie przypisano jeszcze
                                    żadnych użytkowników.
                                </p>
                            )}
                        </div>
                    </ContentCard>

                    {/* KOMENTARZE */}
                    <ContentCard
                        icon={<Icon.Message />}
                        title={`Komentarze (${comments.length})`}
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
                                    placeholder="Dodaj komentarz..."
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="flex-shrink-0 rounded-lg bg-emerald-600 p-3 text-white hover:bg-emerald-700 sm:p-2 sm:px-4"
                                >
                                    <Icon.Send />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="py-8 text-center text-gray-500">
                                    Brak komentarzy. Bądź pierwszy!
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
                                    />
                                ))
                            )}
                        </div>
                    </ContentCard>

                    {/* HISTORIA AKTYWNOŚCI */}
                    <ContentCard
                        icon={<Icon.Activity />}
                        title={`Historia aktywności (${activities.length})`}
                        actions={
                            <button
                                onClick={() =>
                                    setShowActivities(!showActivities)
                                }
                                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                            >
                                {showActivities ? 'Ukryj' : 'Pokaż'}
                                {showActivities ? (
                                    <Icon.ChevronDown />
                                ) : (
                                    <Icon.ChevronRight />
                                )}
                            </button>
                        }
                    >
                        {showActivities && (
                            <div className="space-y-3">
                                {activities.length === 0 ? (
                                    <p className="py-4 text-center text-gray-500">
                                        Brak aktywności
                                    </p>
                                ) : (
                                    activities.map((activity) => (
                                        <div
                                            key={activity._id}
                                            className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all duration-200 ease-in-out hover:scale-[1.005] hover:shadow-sm"
                                        >
                                            {' '}
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                                <span className="text-xs font-bold text-emerald-600">
                                                    {activity.user.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">
                                                        {activity.user.username}
                                                    </span>{' '}
                                                    {activity.description}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {moment(
                                                        activity.createdAt,
                                                    ).fromNow()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </ContentCard>
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
