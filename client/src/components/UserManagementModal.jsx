import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useAuth } from '../context/useAuth';
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

    const handleSearch = useCallback(async (term) => {
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
            console.error('Error while searching users:', err);
            setSearchError(
                err.response?.data?.message || t('projects.details.userModal.errors.searchError'),
            );
        } finally {
            setLoadingSearch(false);
        }
    }, [companyId, project, t]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, handleSearch]);

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
                `Error while ${action === 'add' ? 'adding' : 'removing'} user:`,
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
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 p-4 border-b border-black/5 dark:border-white/5 sm:p-6">
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-foreground tracking-tight">
                            {t('projects.details.userModal.title')}
                        </h2>
                        <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs text-[10px] uppercase">
                            <span className="shrink-0 font-mono">{t('common.project')}</span>
                            <span className="truncate font-medium text-foreground">{project.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar sm:p-6">
                    {/* Current Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                                <User size={18} className="text-primary" />
                                <h3>{t('projects.details.userModal.currentUsers')}</h3>
                            </div>
                            <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                                {project.assignedUsers.length} {t('common.members', { defaultValue: 'MEMBERS' })}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {project.assignedUsers.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-8 text-center text-muted-foreground text-sm">
                                    {t('projects.details.userModal.noUsers')}
                                </div>
                            ) : (
                                project.assignedUsers.map((user) => {
                                    const isCreator = project.createdBy?._id === user._id;

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-all"
                                        >
                                            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg text-xs font-bold">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                                                    user.role === 'admin' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10" :
                                                    user.role === 'hr' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10" :
                                                    "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                                                )}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground truncate">{user.username}</span>
                                                    {isCreator && (
                                                        <div className="shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-500">
                                                            {t('common.creator')}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {user.email} • {t(`common.roles.${user.role}`)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleUser(user._id, 'remove')}
                                                disabled={isUpdating || isCreator}
                                                className={clsx(
                                                    "shrink-0 flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-all",
                                                    isCreator
                                                        ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                                                        : "text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10"
                                                )}
                                                title={isCreator ? t('projects.details.userModal.cannotRemoveCreator') : t('projects.details.userModal.removeUser')}
                                                aria-label={isCreator ? t('projects.details.userModal.cannotRemoveCreator') : t('projects.details.userModal.removeUser')}
                                            >
                                                <UserMinus size={15} aria-hidden="true" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Add Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                            <UserPlus size={18} className="text-primary" />
                            <h3>{t('projects.details.userModal.addUserTitle')}</h3>
                        </div>

                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl pl-12 pr-4 text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                            />
                        </div>

                        {searchError && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-medium">
                                {searchError}
                            </div>
                        )}

                        <div className="space-y-3">
                            {loadingSearch ? (
                                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.searching')}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-3">
                                        {displayedUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all"
                                            >
                                                <div className={clsx(
                                                    "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground bg-zinc-200 dark:bg-zinc-800",
                                                    user.role === 'admin' && "text-purple-600 dark:text-purple-400 bg-purple-500/10",
                                                    user.role === 'hr' && "text-blue-600 dark:text-blue-400 bg-blue-500/10"
                                                )}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-foreground truncate">{user.username}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {user.email} • {t(`common.roles.${user.role}`)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleUser(user._id, 'add')}
                                                    disabled={isUpdating}
                                                    className="shrink-0 flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                                                    title={t('projects.details.userModal.addUser')}
                                                    aria-label={t('projects.details.userModal.addUser')}
                                                >
                                                    <UserPlus size={15} aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {displayedUsers.length === 0 && !loadingSearch && (
                                        <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-8 text-center text-muted-foreground text-sm">
                                            {searchTerm ? t('common.noUsersFound') : t('projects.details.userModal.allAssigned')}
                                        </div>
                                    )}

                                    {hiddenCount > 0 && (
                                        <div className="p-3 text-center">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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
                <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-end sm:p-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 sm:py-2 min-h-[44px] bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-lg dark:shadow-white/10"
                    >
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
