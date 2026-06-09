import { useState, useEffect, useCallback } from 'react';
import { X, User, Calendar, AlertCircle, Plus, Check } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/useAuth';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

export default function AddProjectModal({ isOpen, onClose, onSuccess }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const companyId = user?.company?._id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        startDate: '',
        endDate: '',
        assignedUsers: [],
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/users', {
                params: { company: companyId },
            });
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, [companyId]);

    useEffect(() => {
        if (companyId) {
            fetchUsers();
        }
    }, [companyId, fetchUsers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUserToggle = (userId) => {
        setFormData((prev) => ({
            ...prev,
            assignedUsers: prev.assignedUsers.includes(userId)
                ? prev.assignedUsers.filter((id) => id !== userId)
                : [...prev.assignedUsers, userId],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/projects', {
                ...formData,
                company: companyId,
            });

            const newProject = response.data.project;
            onSuccess(newProject);
            onClose();
        } catch (err) {
            console.error('Error creating project:', err);
            setError(err.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="animate-in fade-in fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="animate-in zoom-in-95 fade-in relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl duration-200">
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between border-b border-border px-5 pb-4 pt-5">
                    <div>
                        <h2 className="text-base font-semibold leading-snug text-foreground">
                            {t('projects.addProject')}
                        </h2>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                            {t('projects.createSubtitle', {
                                defaultValue:
                                    'Define project details and assign team members.',
                            })}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form
                    id="add-project-form"
                    onSubmit={handleSubmit}
                    className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-5 py-5"
                >
                    {error && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-500 dark:text-red-400">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Plus size={16} className="shrink-0 text-primary" />
                            <h3>
                                {t('projects.basicInfo', {
                                    defaultValue: 'Basic Information',
                                })}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label
                                    htmlFor="project-name"
                                    className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    {t('projects.labelName')}
                                </label>
                                <input
                                    id="project-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t('projects.placeholderName')}
                                    required
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="project-description"
                                    className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    {t('projects.labelDescription')}
                                </label>
                                <textarea
                                    id="project-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder={t(
                                        'projects.placeholderDescription',
                                    )}
                                    rows={3}
                                    className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status & Priority — 1 col on mobile, 2 on sm+ */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="project-status"
                                className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
                            >
                                {t('common.status')}
                            </label>
                            <Select
                                id="project-status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option
                                    value="pending"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.projectStatus.pending')}
                                </option>
                                <option
                                    value="running"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.projectStatus.running')}
                                </option>
                                <option
                                    value="completed"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.projectStatus.completed')}
                                </option>
                                <option
                                    value="on-hold"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.projectStatus.on-hold')}
                                </option>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="project-priority"
                                className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
                            >
                                {t('projects.labelPriority')}
                            </label>
                            <Select
                                id="project-priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option
                                    value="low"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.priority.low')}
                                </option>
                                <option
                                    value="medium"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.priority.medium')}
                                </option>
                                <option
                                    value="high"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.priority.high')}
                                </option>
                                <option
                                    value="critical"
                                    className="bg-background text-foreground"
                                >
                                    {t('common.priority.critical')}
                                </option>
                            </Select>
                        </div>
                    </div>

                    {/* Timeline Section — 1 col on mobile, 2 on sm+ */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Calendar
                                size={16}
                                className="shrink-0 text-primary"
                            />
                            <h3>
                                {t('projects.timeline', {
                                    defaultValue: 'Timeline',
                                })}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="project-start-date"
                                    className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    {t('projects.labelStartDate')}
                                </label>
                                <input
                                    id="project-start-date"
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring dark:[color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="project-end-date"
                                    className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    {t('projects.labelEndDate')}
                                </label>
                                <input
                                    id="project-end-date"
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User size={16} className="shrink-0 text-primary" />
                            <h3>
                                {t('projects.assignTeam', {
                                    defaultValue: 'Assign Team Members',
                                })}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    aria-hidden="true"
                                    onClick={() => handleUserToggle(user._id)}
                                    className={clsx(
                                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all active:scale-95',
                                        formData.assignedUsers.includes(
                                            user._id,
                                        )
                                            ? 'border-primary/30 bg-primary/10 shadow-sm'
                                            : 'border-border bg-background hover:bg-muted',
                                    )}
                                >
                                    <div
                                        className={clsx(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                                            formData.assignedUsers.includes(
                                                user._id,
                                            )
                                                ? 'bg-primary text-black'
                                                : 'bg-zinc-200 text-muted-foreground dark:bg-zinc-800',
                                        )}
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-foreground">
                                            {user.username}
                                        </p>
                                        <p className="truncate text-[10px] text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    {formData.assignedUsers.includes(
                                        user._id,
                                    ) && (
                                        <Check
                                            size={14}
                                            className="shrink-0 text-primary"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        form="add-project-form"
                        type="submit"
                        disabled={loading}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {loading
                            ? t('projects.creating')
                            : t('projects.addProject')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
