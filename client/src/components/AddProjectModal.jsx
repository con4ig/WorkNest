import { useState, useEffect, useCallback } from 'react';
import { X, User, Calendar, AlertCircle, Plus, Check } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/useAuth';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

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
        if (isOpen && companyId) {
            fetchUsers();
        }
    }, [isOpen, companyId, fetchUsers]);

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
            const response = await api.post(
                '/projects',
                { ...formData, company: companyId },
            );

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
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
            {/* Full-screen Backdrop */}
            <div 
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Card — bottom sheet on mobile, centered dialog on sm+ */}
            <div className="relative w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 sm:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5 border-b border-black/5 dark:border-white/5 shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                            {t('projects.addProject')}
                        </h2>
                        <p className="mt-0.5 text-muted-foreground text-xs">
                            {t('projects.createSubtitle', { defaultValue: 'Define project details and assign team members.' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form id="add-project-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-5 custom-scrollbar">
                    {error && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-medium">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                            <Plus size={16} className="text-primary shrink-0" />
                            <h3>{t('projects.basicInfo', { defaultValue: 'Basic Information' })}</h3>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="project-name" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">
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
                                    className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all font-medium text-base"
                                />
                            </div>

                            <div>
                                <label htmlFor="project-description" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">
                                    {t('projects.labelDescription')}
                                </label>
                                <textarea
                                    id="project-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder={t('projects.placeholderDescription')}
                                    rows={3}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-3 text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none font-medium text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status & Priority — 1 col on mobile, 2 on sm+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label htmlFor="project-status" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                {t('common.status')}
                            </label>
                            <select
                                id="project-status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer font-medium text-base"
                            >
                                <option value="pending" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.pending')}</option>
                                <option value="running" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.running')}</option>
                                <option value="completed" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.completed')}</option>
                                <option value="on-hold" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.on-hold')}</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="project-priority" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                {t('projects.labelPriority')}
                            </label>
                            <select
                                id="project-priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer font-medium text-base"
                            >
                                <option value="low" className="bg-white dark:bg-zinc-900">{t('common.priority.low')}</option>
                                <option value="medium" className="bg-white dark:bg-zinc-900">{t('common.priority.medium')}</option>
                                <option value="high" className="bg-white dark:bg-zinc-900">{t('common.priority.high')}</option>
                                <option value="critical" className="bg-white dark:bg-zinc-900">{t('common.priority.critical')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline Section — 1 col on mobile, 2 on sm+ */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                            <Calendar size={16} className="text-primary shrink-0" />
                            <h3>{t('projects.timeline', { defaultValue: 'Timeline' })}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="project-start-date" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">
                                    {t('projects.labelStartDate')}
                                </label>
                                <input
                                    id="project-start-date"
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium dark:[color-scheme:dark] text-base"
                                />
                            </div>
                            <div>
                                <label htmlFor="project-end-date" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">
                                    {t('projects.labelEndDate')}
                                </label>
                                <input
                                    id="project-end-date"
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium dark:[color-scheme:dark] text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                            <User size={16} className="text-primary shrink-0" />
                            <h3>{t('projects.assignTeam', { defaultValue: 'Assign Team Members' })}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleUserToggle(user._id)}
                                    className={clsx(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer active:scale-95",
                                        formData.assignedUsers.includes(user._id)
                                            ? "bg-primary/10 border-primary/30 shadow-sm"
                                            : "bg-black/5 dark:bg-white/5 border-transparent dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                                        formData.assignedUsers.includes(user._id) ? "bg-primary text-black" : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                                    )}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate">{user.username}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    {formData.assignedUsers.includes(user._id) && (
                                        <Check size={14} className="text-primary shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer — stacked full-width on mobile, inline on sm+ */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors text-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                        disabled={loading}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        form="add-project-form"
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-border/50 bg-secondary/20 text-foreground font-bold hover:bg-secondary/40 hover:border-primary/50 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4 text-primary stroke-[3]" />
                        {loading ? t('projects.creating') : t('projects.addProject')}
                    </button>
                </div>
            </div>
        </div>
    );
}
