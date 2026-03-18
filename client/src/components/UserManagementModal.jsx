import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { X, UserPlus, UserMinus, Search, Loader2, Shield, User, Star } from 'lucide-react';
import clsx from 'clsx';

export default function UserManagementModal({ project, onClose, onUpdate }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const companyId = user?.company?._id;

    const [searchTerm, setSearchTerm] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSearch = async (term) => {
        if (!companyId) return;
        
        if (term.trim().length === 1) {
            return;
        }

        setLoadingSearch(true);
        setSearchError(null);

        try {
            const res = await api.get('/users', { params: { search: term.trim() } });

            const assignedIds = project.assignedUsers.map((u) => u._id);
            const filteredUsers = res.data.users.filter(
                (user) => !assignedIds.includes(user._id),
            );

            setAvailableUsers(filteredUsers);
        } catch (err) {
            console.error('Błąd podczas wyszukiwania użytkowników:', err);
            setSearchError(
                err.response?.data?.message || t('projects.details.userModal.errors.searchError'),
            );
        } finally {
            setLoadingSearch(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, project, companyId]);

    const isSearchActive = searchTerm.trim().length >= 2;
    const displayedUsers = isSearchActive 
        ? availableUsers 
        : availableUsers.slice(0, 3);
    
    const hiddenCount = !isSearchActive ? Math.max(0, availableUsers.length - 3) : 0;

    const handleToggleUser = async (userId, action) => {
        if (!companyId) return;
        setIsUpdating(true);
        try {
            const response = await api.patch(`/projects/${project._id}/users`, { userId, action });

            if (response.data.project) {
                onUpdate(response.data.project);
            }

            if (action === 'add') {
                setSearchTerm('');
            }
        } catch (err) {
            console.error(
                `Błąd podczas ${action === 'add' ? 'dodawania' : 'usuwania'} użytkownika:`,
                err,
            );
        } finally {
            setIsUpdating(false);
        }
    };

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
                            {t('projects.details.userModal.title')}
                        </h2>
                        <div className="mt-1 flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs text-[10px] uppercase">
                            <span className="font-mono">{t('common.project')}</span>
                            <span className="truncate max-w-[300px] font-medium text-zinc-700 dark:text-zinc-300">{project.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Current Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                                <User size={18} className="text-primary" />
                                <h3>{t('projects.details.userModal.currentUsers')}</h3>
                            </div>
                            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                                {project.assignedUsers.length} {t('common.members', { defaultValue: 'MEMBERS' })}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {project.assignedUsers.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-8 text-center text-zinc-500 text-sm">
                                    {t('projects.details.userModal.noUsers')}
                                </div>
                            ) : (
                                project.assignedUsers.map((user) => {
                                    const isCreator = project.createdBy?._id === user._id;

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                                                    user.role === 'admin' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10" :
                                                    user.role === 'hr' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10" :
                                                    "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                                )}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user.username}</span>
                                                        {isCreator && (
                                                            <div className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-500">
                                                                {t('common.creator')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 truncate">
                                                        {user.email} • {t(`common.roles.${user.role}`)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleUser(user._id, 'remove')}
                                                disabled={isUpdating || isCreator}
                                                className={clsx(
                                                    "p-2 rounded-lg transition-all",
                                                    isCreator 
                                                        ? "text-zinc-300 dark:text-zinc-800 cursor-not-allowed" 
                                                        : "text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10"
                                                )}
                                                title={isCreator ? t('projects.details.userModal.cannotRemoveCreator') : t('projects.details.userModal.removeUser')}
                                            >
                                                <UserMinus size={18} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Add Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                            <UserPlus size={18} className="text-primary" />
                            <h3>{t('projects.details.userModal.addUserTitle')}</h3>
                        </div>

                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-600" />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl pl-12 pr-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                            />
                        </div>

                        {searchError && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-medium">
                                {searchError}
                            </div>
                        )}

                        <div className="space-y-3">
                            {loadingSearch ? (
                                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-600 gap-3">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.searching')}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-3">
                                        {displayedUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800",
                                                        user.role === 'admin' && "text-purple-600 dark:text-purple-400 bg-purple-500/10",
                                                        user.role === 'hr' && "text-blue-600 dark:text-blue-400 bg-blue-500/10"
                                                    )}>
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-900 dark:text-white">{user.username}</p>
                                                        <p className="text-[10px] text-zinc-500 truncate">
                                                            {user.email} • {t(`common.roles.${user.role}`)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleUser(user._id, 'add')}
                                                    disabled={isUpdating}
                                                    className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {displayedUsers.length === 0 && !loadingSearch && (
                                        <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-8 text-center text-zinc-500 text-sm">
                                            {searchTerm ? t('common.noUsersFound') : t('projects.details.userModal.allAssigned')}
                                        </div>
                                    )}

                                    {hiddenCount > 0 && (
                                        <div className="p-3 text-center">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                {t('projects.details.userModal.othersCount', { count: hiddenCount })} 
                                                <span className="text-primary ml-1">{t('projects.details.userModal.typeToSearch')}</span>
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-lg dark:shadow-white/10"
                    >
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
