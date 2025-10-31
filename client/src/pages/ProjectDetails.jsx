import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserManagementModal from './UserManagementModal';
import {
    Calendar,
    User,
    SquarePen,
    Save,
    X,
    ArrowLeft,
    Users,
    Info,
    CheckCircle2,
    Circle,
    Clock,
    MessageSquare,
    Activity as ActivityIcon,
    Plus,
    Trash2,
    Edit3,
    Send,
    ChevronDown,
    ChevronRight,
    ListTodo,
} from 'lucide-react';
import moment from 'moment';
import 'moment/locale/pl';

moment.locale('pl');

axios.defaults.baseURL = 'http://localhost:5500';

const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Nie określono';
    try {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
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

const Icon = {
    Calendar: ({ className = 'text-emerald-500' }) => (
        <Calendar className={`h-6 w-6 ${className}`} />
    ),
    User: ({ className }) => <User className={`h-5 w-5 ${className}`} />,
    Edit: () => <SquarePen className="h-5 w-5" />,
    Save: () => <Save className="h-5 w-5" />,
    Cancel: () => <X className="h-5 w-5" />,
    Back: () => <ArrowLeft className="h-5 w-5" />,
    Users: ({ className = 'text-emerald-500' }) => (
        <Users className={`h-6 w-6 ${className}`} />
    ),
    Info: ({ className = 'text-emerald-500' }) => (
        <Info className={`h-6 w-6 ${className}`} />
    ),
    CheckCircle: ({ className }) => <CheckCircle2 className={`h-5 w-5 ${className}`} />,
    Circle: ({ className }) => <Circle className={`h-5 w-5 ${className}`} />,
    Clock: ({ className }) => <Clock className={`h-5 w-5 ${className}`} />,
    Message: ({ className = 'text-emerald-500' }) => <MessageSquare className={`h-6 w-6 ${className}`} />,
    Activity: ({ className = 'text-emerald-500' }) => <ActivityIcon className={`h-6 w-6 ${className}`} />,
    Plus: () => <Plus className="h-4 w-4" />,
    Trash: () => <Trash2 className="h-4 w-4" />,
    Edit3: () => <Edit3 className="h-4 w-4" />,
    Send: () => <Send className="h-4 w-4" />,
    ChevronDown: () => <ChevronDown className="h-4 w-4" />,
    ChevronRight: () => <ChevronRight className="h-4 w-4" />,
    ListTodo: ({ className = 'text-emerald-500' }) => <ListTodo className={`h-6 w-6 ${className}`} />,
};

const getStatusClasses = (status) => {
    switch (status) {
        case 'running':
        case 'in-progress':
            return 'bg-sky-100 text-sky-800 ring-sky-300/50';
        case 'completed':
            return 'bg-green-100 text-green-800 ring-green-300/50';
        case 'on-hold':
            return 'bg-amber-100 text-amber-800 ring-amber-300/50';
        case 'todo':
            return 'bg-slate-100 text-slate-800 ring-slate-300/50';
        default:
            return 'bg-slate-100 text-slate-800 ring-slate-300/50';
    }
};

const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-amber-100 text-amber-800';
        default:
            return 'bg-green-100 text-green-800';
    }
};

const AVAILABLE_STATUSES = ['pending', 'running', 'on-hold', 'completed'];
const AVAILABLE_PRIORITIES = ['low', 'medium', 'high'];
const TASK_STATUSES = ['todo', 'in-progress', 'completed'];

const StatCard = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1">{icon}</div>
        <div className="w-full">
            <h3 className="font-semibold text-gray-500">{title}</h3>
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
        <div className="relative flex h-40 w-40 items-center justify-center">
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
            <div className="absolute text-4xl font-bold text-emerald-600">
                {progress}%
            </div>
        </div>
    );
};

const ContentCard = ({ icon, title, children, actions }) => (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
        <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-4">
                {icon}
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        {children}
    </div>
);

// Komponent Zadania
const TaskItem = ({ task, onUpdate, onDelete, projectUsers, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || '',
        dueDate: formatDateForInput(task.dueDate),
    });

    const handleSave = async () => {
        // Stwórz obiekt payloadu do wysłania
        const payload = {
            ...editData,
            // Konwertuj pusty string (z opcji "Nie przypisano") na 'null'
            // Mongoose zrozumie 'null', ale nie zrozumie '""' dla pola ObjectId
            assignedTo: editData.assignedTo || null,
        };

        try {
            // Wyślij 'payload' zamiast 'editData'
            await axios.patch(`/api/tasks/${task._id}`, payload, {
                withCredentials: true,
            });
            setIsEditing(false);
            onUpdate();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        }
    };

    const toggleStatus = async () => {
        const statuses = ['todo', 'in-progress', 'completed'];
        const currentIndex = statuses.indexOf(task.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        try {
            await axios.patch(
                `/api/tasks/${task._id}`,
                { status: nextStatus },
                { withCredentials: true }
            );
            onUpdate();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        }
    };

    const StatusIcon = () => {
        switch (task.status) {
            case 'completed':
                return <Icon.CheckCircle className="text-green-600" />;
            case 'in-progress':
                return <Icon.Clock className="text-sky-600" />;
            default:
                return <Icon.Circle className="text-slate-400" />;
        }
    };

    if (isEditing) {
        return (
            <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
                <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="mb-2 w-full rounded border border-gray-300 p-2"
                    placeholder="Tytuł zadania"
                />
                <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="mb-2 w-full rounded border border-gray-300 p-2"
                    rows="2"
                    placeholder="Opis zadania"
                />
                <div className="mb-2 flex gap-2">
                    <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="rounded border border-gray-300 p-2"
                    >
                        {TASK_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <select
                        value={editData.priority}
                        onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                        className="rounded border border-gray-300 p-2"
                    >
                        {AVAILABLE_PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                                            <select
                                                value={editData.assignedTo}
                                                onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                                                className="flex-1 rounded border border-gray-300 p-2"
                                            >
                                                <option value="">Nie przypisano</option>                        {projectUsers.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
                <input
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                    className="mb-2 w-full rounded border border-gray-300 p-2"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                    >
                        <Icon.Save /> Zapisz
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1 rounded bg-gray-300 px-3 py-1 text-sm hover:bg-gray-400"
                    >
                        <Icon.Cancel /> Anuluj
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 ease-in-out hover:border-emerald-300 hover:shadow-lg hover:scale-[1.01]">
            <button
                onClick={toggleStatus}
                className="mt-0.5 transition-transform hover:scale-110"
            >
                <StatusIcon />
            </button>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4
                            className={`font-semibold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                        >
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span
                                className={`rounded-full px-2 py-1 ${getStatusClasses(task.status)}`}
                            >
                                {task.status}
                            </span>
                            <span
                                className={`rounded-full px-2 py-1 ${getPriorityClasses(task.priority)}`}
                            >
                                {task.priority}
                            </span>
                            {task.assignedTo && (
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                    👤 {task.assignedTo.username}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                    📅 {moment(task.dueDate).format('DD MMM YYYY')}
                                </span>
                            )}
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                            >
                                <Icon.Edit3 />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Czy na pewno usunąć to zadanie?')) {
                                        onDelete(task._id);
                                    }
                                }}
                                className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                            >
                                <Icon.Trash />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Komponent Komentarza
const CommentItem = ({ comment, onDelete, onReply, currentUserId, isAdmin }) => {
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
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                    {comment.author.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="rounded-lg bg-gray-50 p-3 transition-all duration-200 ease-in-out hover:shadow-sm hover:scale-[1.005]">
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
                        <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>
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
                                {showReplies ? <Icon.ChevronDown /> : <Icon.ChevronRight />}
                                {comment.replies.length} {comment.replies.length === 1 ? 'odpowiedź' : 'odpowiedzi'}
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-3 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                                    placeholder="Napisz odpowiedź..."
                                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                                />                            <button
                                onClick={handleReply}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                            >
                                <Icon.Send />
                            </button>
                        </div>
                    )}

                    {showReplies && comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {comment.replies.map((reply) => (
                                <div key={reply._id} className="flex gap-2">
                                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-400 flex items-center justify-center text-white text-sm font-bold">
                                        {reply.author.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                                                        <div className="rounded-lg bg-white border border-gray-200 p-2">
                                                                            <div className="mb-1 flex items-center justify-between">
                                                                                <span className="text-sm font-semibold text-gray-800">
                                                                                    {reply.author.username}
                                                                                </span>
                                                                                <span className="text-xs text-gray-400">
                                                                                    {moment(reply.createdAt).fromNow()}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-700">{reply.content}</p>
                                                                        </div>                                    </div>
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
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // States dla zadań
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
    });

    // States dla komentarzy
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // States dla aktywności
    const [activities, setActivities] = useState([]);
    const [showActivities, setShowActivities] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const meRes = await axios.get('/api/auth/me', {
                withCredentials: true,
            });
            setCurrentUser(meRes.data);
            
            const res = await axios.get(`/api/projects/${id}`, {
                withCredentials: true,
            });
            setProject(res.data);
            setEditData({
                name: res.data.name,
                description: res.data.description,
                status: res.data.status,
                priority: res.data.priority,
                progress: res.data.progress || 0,
                startDate: formatDateForInput(res.data.startDate),
                endDate: formatDateForInput(res.data.endDate),
            });
            setError(null);
        } catch (err) {
            setError(`Nie udało się załadować danych projektu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get(`/api/tasks/project/${id}`, {
                withCredentials: true,
            });
            setTasks(res.data);
        } catch (err) {
            console.error('Błąd pobierania zadań:', err);
        }
    }, [id]);

    const fetchComments = useCallback(async () => {
        try {
            const res = await axios.get(`/api/comments/project/${id}`, {
                withCredentials: true,
            });
            setComments(res.data);
        } catch (err) {
            console.error('Błąd pobierania komentarzy:', err);
        }
    }, [id]);

    const fetchActivities = useCallback(async () => {
        try {
            const res = await axios.get(`/api/activities/project/${id}`, {
                withCredentials: true,
            });
            setActivities(res.data.activities);
        } catch (err) {
            console.error('Błąd pobierania aktywności:', err);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchData();
            fetchTasks();
            fetchComments();
            fetchActivities();
        }
    }, [id, fetchData, fetchTasks, fetchComments, fetchActivities]);

    const handleEditChange = (e) => {
        const { name, value, type } = e.target;
        let newValue =
            name === 'progress' && type === 'number'
                ? Math.max(0, Math.min(100, parseInt(value, 10) || 0))
                : value;
        setEditData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.patch(
                `/api/projects/${id}`,
                {
                    ...editData,
                    startDate: editData.startDate || null,
                    endDate: editData.endDate || null,
                },
                { withCredentials: true },
            );
            await fetchData();
            await fetchActivities();
            setIsEditing(false);
        } catch (err) {
            alert(`Błąd podczas zapisywania zmian: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.title.trim()) {
            alert('Tytuł zadania jest wymagany');
            return;
        }

        setIsAddingTask(true);
        try {
            await axios.post(
                '/api/tasks',
                {
                    ...newTask,
                    project: id,
                },
                { withCredentials: true }
            );
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                assignedTo: '',
                dueDate: '',
            });
            setShowAddTask(false);
            fetchTasks();
            fetchActivities();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`/api/tasks/${taskId}`, {
                withCredentials: true,
            });
            fetchTasks();
            fetchActivities();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await axios.post(
                '/api/comments',
                {
                    content: newComment,
                    project: id,
                },
                { withCredentials: true }
            );
            setNewComment('');
            fetchComments();
            fetchActivities();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        }
    };

    const handleReplyComment = async (parentId, content) => {
        try {
            await axios.post(
                '/api/comments',
                {
                    content,
                    project: id,
                    parentComment: parentId,
                },
                { withCredentials: true }
            );
            fetchComments();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Czy na pewno usunąć ten komentarz?')) return;

        try {
            await axios.delete(`/api/comments/${commentId}`, {
                withCredentials: true,
            });
            fetchComments();
            fetchActivities();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        }
    };

    const handleProjectUpdate = useCallback(() => {
        fetchData();
        fetchActivities();
    }, [fetchData, fetchActivities]);

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                    <p className="text-lg text-slate-600">
                        Ładowanie projektu...
                    </p>
                </div>
            </div>
        );
    if (error)
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-center">
                <div className="w-full max-w-lg rounded-xl border border-red-400 bg-red-50 px-8 py-6 text-red-700 shadow-lg">
                    <strong className="mb-2 block text-lg font-bold">
                        Wystąpił błąd
                    </strong>
                    <span>{error}</span>
                    <button
                        onClick={() => navigate('/projekty')}
                        className="mt-6 w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
                    >
                        Powrót
                    </button>
                </div>
            </div>
        );
    if (!project) return null;

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'hr';
    const progress = isEditing ? editData.progress : project.progress || 0;

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-800 lg:flex-row">
            {/* LEWY PANEL (SIDEBAR) */}
            <aside className="flex w-full flex-col border-r border-gray-200 bg-white p-6 lg:min-h-screen lg:w-[380px] lg:p-8">
                <div className="mb-10 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/projekty')}
                        className="rounded-lg bg-slate-100 p-2.5 transition-colors hover:bg-slate-200"
                    >
                        <Icon.Back />
                    </button>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">
                        Szczegóły Projektu
                    </h2>
                </div>

                <div className="flex flex-col items-center text-center">
                    <CircularProgress progress={progress} />
                    {isEditing && isAdmin ? (
                        <div className="mt-4 w-full max-w-xs">
                            <input
                                type="range"
                                name="progress"
                                value={editData.progress}
                                onChange={handleEditChange}
                                min="0"
                                max="100"
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
                                disabled={isSaving}
                            />
                        </div>
                    ) : (
                        <p className="mt-3 text-lg font-semibold text-slate-600">
                            Postęp projektu
                        </p>
                    )}
                </div>

                <div className="mt-10 space-y-6">
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
                            <p className="text-lg font-bold text-gray-800">
                                {formatDateForDisplay(project.startDate)} -{' '}
                                {formatDateForDisplay(project.endDate)}
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
                                    className={`rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold capitalize ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                                >
                                    {AVAILABLE_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="priority"
                                    value={editData.priority}
                                    onChange={handleEditChange}
                                    className={`rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold capitalize ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                                >
                                    {AVAILABLE_PRIORITIES.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${getStatusClasses(project.status)}`}
                                >
                                    {project.status}
                                </span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getPriorityClasses(project.priority)}`}
                                >
                                    {project.priority}
                                </span>
                            </div>
                        )}
                    </StatCard>

                    {/* Statystyki zadań */}
                    <StatCard
                        icon={<Icon.ListTodo />}
                        title="Statystyki zadań"
                    >
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Wszystkie:</span>
                                <span className="font-bold">{taskStats.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ukończone:</span>
                                <span className="font-bold text-green-600">{taskStats.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">W trakcie:</span>
                                <span className="font-bold text-sky-600">{taskStats.inProgress}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Do zrobienia:</span>
                                <span className="font-bold text-gray-600">{taskStats.todo}</span>
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
            <main className="w-full flex-grow p-6 lg:p-10">
                <header className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-8 shadow-xl shadow-emerald-300/50">
                    <div className="relative z-10">
                        {isEditing && isAdmin ? (
                            <input
                                type="text"
                                name="name"
                                value={editData.name}
                                onChange={handleEditChange}
                                className="w-full border-b-2 border-white/50 bg-transparent text-4xl font-extrabold tracking-tight text-white placeholder:text-white/70 focus:outline-none lg:text-5xl"
                                placeholder="Nazwa projektu..."
                            />
                        ) : (
                            <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                                {project.name}
                            </h1>
                        )}
                        {isAdmin && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {isEditing && isAdmin ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-bold text-emerald-700 shadow-md transition-all duration-200 ease-in-out hover:bg-gray-200 hover:scale-[1.02] disabled:opacity-60"
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
                                            className="flex items-center gap-2 rounded-lg bg-black/20 px-5 py-2.5 font-bold text-white transition-all duration-200 ease-in-out hover:bg-black/30 hover:scale-[1.02]"
                                        >
                                            <Icon.Cancel /> Anuluj
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-bold text-slate-800 shadow-lg transition-all hover:bg-slate-200"
                                        >
                                            <Icon.Edit /> Edytuj
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowUserModal(true)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-black/20 px-5 py-2.5 font-bold text-white transition-all hover:bg-black/30"
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
                        actions={
                            isAdmin && (
                                <button
                                    onClick={() => setShowAddTask(!showAddTask)}
                                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
                                >
                                    <Icon.Plus /> Dodaj zadanie
                                </button>
                            )
                        }
                    >
                        {showAddTask && (
                            <div className="mb-6 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, title: e.target.value })
                                    }
                                    placeholder="Tytuł zadania"
                                    className="mb-2 w-full rounded border border-gray-300 p-2"
                                />
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, description: e.target.value })
                                    }
                                    placeholder="Opis zadania (opcjonalnie)"
                                    className="mb-2 w-full rounded border border-gray-300 p-2"
                                    rows="2"
                                />
                                <div className="mb-2 flex gap-2">
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) =>
                                            setNewTask({ ...newTask, priority: e.target.value })
                                        }
                                        className="rounded border border-gray-300 p-2"
                                    >
                                        {AVAILABLE_PRIORITIES.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={newTask.assignedTo}
                                        onChange={(e) =>
                                            setNewTask({ ...newTask, assignedTo: e.target.value })
                                        }
                                        className="flex-1 rounded border border-gray-300 p-2"
                                    >
                                        <option value="">Nie przypisano</option>
                                        {project.assignedUsers.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.username}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) =>
                                            setNewTask({ ...newTask, dueDate: e.target.value })
                                        }
                                        className="rounded border border-gray-300 p-2"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddTask}
                                        disabled={isAddingTask}
                                        className="flex items-center gap-1 rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAddingTask ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Dodawanie...
                                            </>
                                        ) : (
                                            <>
                                                <Icon.Plus /> Dodaj
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowAddTask(false)}
                                        className="flex items-center gap-1 rounded bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400"
                                    >
                                        <Icon.Cancel /> Anuluj
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    Nie ma jeszcze żadnych zadań. {isAdmin && 'Kliknij "Dodaj zadanie" aby utworzyć pierwsze.'}
                                </p>
                            ) : (
                                tasks.map((task) => (
                                    <TaskItem
                                        key={task._id}
                                        task={task}
                                        onUpdate={fetchTasks}
                                        onDelete={handleDeleteTask}
                                        projectUsers={project.assignedUsers}
                                        isAdmin={isAdmin}
                                    />
                                ))
                            )}
                        </div>
                    </ContentCard>

                    {/* ZESPÓŁ PROJEKTOWY */}
                    <ContentCard
                        icon={<Icon.Users />}
                        title={`Zespół projektowy (${project.assignedUsers.length})`}
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {project.assignedUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                                >
                                    <div
                                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {user.username}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {project.assignedUsers.length === 0 && (
                                <p className="col-span-full text-gray-500">
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
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                    placeholder="Dodaj komentarz..."
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                                >
                                    <Icon.Send />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
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
                                onClick={() => setShowActivities(!showActivities)}
                                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                            >
                                {showActivities ? 'Ukryj' : 'Pokaż'}
                                {showActivities ? <Icon.ChevronDown /> : <Icon.ChevronRight />}
                            </button>
                        }
                    >
                        {showActivities && (
                            <div className="space-y-3">
                                {activities.length === 0 ? (
                                                                    <p className="text-center text-gray-500 py-4">
                                                                        Brak aktywności
                                                                    </p>
                                                                ) : (
                                                                    activities.map((activity) => (
                                                                                                            <div
                                                                                                                key={activity._id}
                                                                                                                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all duration-200 ease-in-out hover:shadow-sm hover:scale-[1.005]"
                                                                                                            >                                                                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                                <span className="text-emerald-600 text-xs font-bold">
                                                                                    {activity.user.username.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <p className="text-sm text-gray-700">
                                                                                    <span className="font-semibold">
                                                                                        {activity.user.username}
                                                                                    </span>{' '}
                                                                                    {activity.description}
                                                                                </p>
                                                                                <p className="text-xs text-gray-400 mt-1">
                                                                                    {moment(activity.createdAt).fromNow()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))                                )}
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