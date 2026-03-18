import { useState, useEffect } from 'react';
import { X, User, Calendar, AlertCircle, Plus, Check } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
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

    useEffect(() => {
        if (isOpen && companyId) {
            fetchUsers();
        }
    }, [isOpen, companyId]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users', {
                params: { company: companyId },
            });
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Full-screen Backdrop */}
            <div 
                className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Card */}
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            {t('projects.addProject')}
                        </h2>
                        <p className="mt-1 text-zinc-500 dark:text-zinc-400 text-xs">
                            {t('projects.createSubtitle', { defaultValue: 'Define project details and assign team members.' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form id="add-project-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-medium">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                            <Plus size={18} className="text-primary" />
                            <h3>{t('projects.basicInfo', { defaultValue: 'Basic Information' })}</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                                    {t('projects.labelName')}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t('projects.placeholderName')}
                                    required
                                    className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                                    {t('projects.labelDescription')}
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder={t('projects.placeholderDescription')}
                                    rows={3}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                {t('common.status')}
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer font-medium"
                            >
                                <option value="pending" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.pending')}</option>
                                <option value="running" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.running')}</option>
                                <option value="completed" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.completed')}</option>
                                <option value="on-hold" className="bg-white dark:bg-zinc-900">{t('common.projectStatus.on-hold')}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                {t('projects.labelPriority')}
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer font-medium"
                            >
                                <option value="low" className="bg-white dark:bg-zinc-900">{t('common.priority.low')}</option>
                                <option value="medium" className="bg-white dark:bg-zinc-900">{t('common.priority.medium')}</option>
                                <option value="high" className="bg-white dark:bg-zinc-900">{t('common.priority.high')}</option>
                                <option value="critical" className="bg-white dark:bg-zinc-900">{t('common.priority.critical')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                            <Calendar size={18} className="text-primary" />
                            <h3>{t('projects.timeline', { defaultValue: 'Timeline' })}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                                    {t('projects.labelStartDate')}
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium dark:[color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                                    {t('projects.labelEndDate')}
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                            <User size={18} className="text-primary" />
                            <h3>{t('projects.assignTeam', { defaultValue: 'Assign Team Members' })}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleUserToggle(user._id)}
                                    className={clsx(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                                        formData.assignedUsers.includes(user._id)
                                            ? "bg-primary/10 border-primary/30 shadow-sm"
                                            : "bg-black/5 dark:bg-white/5 border-transparent dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                        formData.assignedUsers.includes(user._id) ? "bg-primary text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                    )}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{user.username}</p>
                                        <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                                    </div>
                                    {formData.assignedUsers.includes(user._id) && (
                                        <Check size={14} className="text-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        disabled={loading}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        form="add-project-form"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 rounded-2xl border border-border/50 bg-secondary/20 text-foreground font-bold hover:bg-secondary/40 hover:border-primary/50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-wider text-xs flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4 text-primary stroke-[3]" />
                        {loading ? t('projects.creating') : t('projects.addProject')}
                    </button>
                </div>
            </div>
        </div>
    );
}
