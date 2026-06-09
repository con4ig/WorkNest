import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { useAuth } from '../context/useAuth';
import {
    X,
    UserPlus,
    UserMinus,
    Search,
    Loader2,
    Shield,
    User,
    Star,
} from 'lucide-react';
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

    const handleSearch = useCallback(
        async (term) => {
            if (!companyId) return;

            if (term.trim().length === 1) {
                return;
            }

            setLoadingSearch(true);
            setSearchError(null);

            try {
                const res = await api.get('/users', {
                    params: { search: term.trim() },
                });

                const assignedIds = project.assignedUsers.map((u) => u._id);
                const filteredUsers = res.data.users.filter(
                    (user) => !assignedIds.includes(user._id),
                );

                setAvailableUsers(filteredUsers);
            } catch (err) {
                console.error('Error while searching users:', err);
                setSearchError(
                    err.response?.data?.message ||
                        t('projects.details.userModal.errors.searchError'),
                );
            } finally {
                setLoadingSearch(false);
            }
        },
        [companyId, project, t],
    );

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

    const hiddenCount = !isSearchActive
        ? Math.max(0, availableUsers.length - 3)
        : 0;

    const handleToggleUser = async (userId, action) => {
        if (!companyId) return;
        setIsUpdating(true);
        try {
            const response = await api.patch(`/projects/${project._id}/users`, {
                userId,
                action,
            });

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
                className="animate-in fade-in fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl duration-300 dark:border-white/10 dark:bg-zinc-900">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-black/5 p-4 dark:border-white/5 sm:p-6">
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            {t('projects.details.userModal.title')}
                        </h2>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-xs uppercase text-muted-foreground">
                            <span className="shrink-0 font-mono">
                                {t('common.project')}
                            </span>
                            <span className="truncate font-medium text-foreground">
                                {project.name}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                        aria-label="Close modal"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-4 sm:p-6">
                    {/* Current Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                                <User size={18} className="text-primary" />
                                <h3>
                                    {t(
                                        'projects.details.userModal.currentUsers',
                                    )}
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {project.assignedUsers.length}{' '}
                                {t('common.members', {
                                    defaultValue: 'MEMBERS',
                                })}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {project.assignedUsers.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-muted-foreground dark:border-white/10">
                                    {t('projects.details.userModal.noUsers')}
                                </div>
                            ) : (
                                project.assignedUsers.map((user) => {
                                    const isCreator =
                                        project.createdBy?._id === user._id;

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-3 rounded-xl border border-black/5 bg-black/5 p-3 transition-all dark:border-white/5 dark:bg-white/5"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                                                <div
                                                    className={clsx(
                                                        'flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold',
                                                        user.role === 'admin'
                                                            ? 'border border-purple-500/10 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                                            : user.role === 'hr'
                                                              ? 'border border-blue-500/10 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                              : 'bg-zinc-200 text-muted-foreground dark:bg-zinc-800',
                                                    )}
                                                >
                                                    {user.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-semibold text-foreground">
                                                        {user.username}
                                                    </span>
                                                    {isCreator && (
                                                        <div className="shrink-0 rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-500">
                                                            {t(
                                                                'common.creator',
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="truncate text-[10px] text-muted-foreground">
                                                    {user.email} •{' '}
                                                    {t(
                                                        `common.roles.${user.role}`,
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleUser(
                                                        user._id,
                                                        'remove',
                                                    )
                                                }
                                                disabled={
                                                    isUpdating || isCreator
                                                }
                                                className={clsx(
                                                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all sm:h-8 sm:w-8',
                                                    isCreator
                                                        ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-700'
                                                        : 'text-red-500 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-400/10',
                                                )}
                                                title={
                                                    isCreator
                                                        ? t(
                                                              'projects.details.userModal.cannotRemoveCreator',
                                                          )
                                                        : t(
                                                              'projects.details.userModal.removeUser',
                                                          )
                                                }
                                                aria-label={
                                                    isCreator
                                                        ? t(
                                                              'projects.details.userModal.cannotRemoveCreator',
                                                          )
                                                        : t(
                                                              'projects.details.userModal.removeUser',
                                                          )
                                                }
                                            >
                                                <UserMinus
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Add Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <UserPlus size={18} className="text-primary" />
                            <h3>
                                {t('projects.details.userModal.addUserTitle')}
                            </h3>
                        </div>

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                aria-label={t('common.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 w-full rounded-xl border border-black/5 bg-black/5 pl-12 pr-4 font-medium text-foreground transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-white/5 dark:bg-white/5 dark:placeholder:text-zinc-600"
                            />
                        </div>

                        {searchError && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-500 dark:text-red-400">
                                {searchError}
                            </div>
                        )}

                        <div className="space-y-3">
                            {loadingSearch ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                                    <Loader2
                                        className="animate-spin text-primary"
                                        size={24}
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                        {t('common.searching')}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-3">
                                        {displayedUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className="flex items-center gap-3 rounded-xl border border-black/5 bg-black/5 p-3 transition-all hover:border-black/10 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10"
                                            >
                                                <div
                                                    className={clsx(
                                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-xs font-bold text-muted-foreground dark:bg-zinc-800',
                                                        user.role === 'admin' &&
                                                            'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                                                        user.role === 'hr' &&
                                                            'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                                                    )}
                                                >
                                                    {user.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-foreground">
                                                        {user.username}
                                                    </p>
                                                    <p className="truncate text-[10px] text-muted-foreground">
                                                        {user.email} •{' '}
                                                        {t(
                                                            `common.roles.${user.role}`,
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleUser(
                                                            user._id,
                                                            'add',
                                                        )
                                                    }
                                                    disabled={isUpdating}
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 sm:h-8 sm:w-8"
                                                    title={t(
                                                        'projects.details.userModal.addUser',
                                                    )}
                                                    aria-label={t(
                                                        'projects.details.userModal.addUser',
                                                    )}
                                                >
                                                    <UserPlus
                                                        size={15}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {displayedUsers.length === 0 &&
                                        !loadingSearch && (
                                            <div className="rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-muted-foreground dark:border-white/10">
                                                {searchTerm
                                                    ? t('common.noUsersFound')
                                                    : t(
                                                          'projects.details.userModal.allAssigned',
                                                      )}
                                            </div>
                                        )}

                                    {hiddenCount > 0 && (
                                        <div className="p-3 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                {t(
                                                    'projects.details.userModal.othersCount',
                                                    { count: hiddenCount },
                                                )}
                                                <span className="ml-1 text-primary">
                                                    {t(
                                                        'projects.details.userModal.typeToSearch',
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end border-t border-black/5 p-4 dark:border-white/5 sm:p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-[44px] rounded-xl bg-zinc-900 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-zinc-100 sm:py-2"
                    >
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
