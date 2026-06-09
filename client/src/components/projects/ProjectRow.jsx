import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Calendar,
    MoreVertical,
    Archive,
    Trash2,
    ArchiveRestore,
} from 'lucide-react';
import clsx from 'clsx';
import { translateProjectStatus } from '../../utils/translations';

const statusStyles = {
    pending: {
        text: 'text-amber-500',
        bg: 'bg-amber-500/10 border-amber-500/20',
        dot: 'bg-amber-500',
    },
    running: {
        text: 'text-blue-500',
        bg: 'bg-blue-500/10 border-blue-500/20',
        dot: 'bg-blue-500 animate-pulse',
    },
    completed: {
        text: 'text-primary',
        bg: 'bg-primary/10 border-primary/20',
        dot: 'bg-primary',
    },
    'on-hold': {
        text: 'text-destructive',
        bg: 'bg-destructive/10 border-destructive/20',
        dot: 'bg-destructive',
    },
};

const AssignedUsersAvatarGroup = ({ users }) => {
    const { t } = useTranslation();
    if (!users || users.length === 0) {
        return (
            <div className="text-xs font-medium italic text-muted-foreground/60">
                {t('projects.projectRow.none')}
            </div>
        );
    }

    return (
        <div className="flex -space-x-2.5">
            {users.slice(0, 3).map((user) => (
                <div
                    key={user._id}
                    title={user.username}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-card bg-primary/10 text-[11px] font-bold text-primary shadow-sm ring-1 ring-border transition-transform hover:z-10 hover:scale-110"
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
            ))}
            {users.length > 3 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-card bg-secondary text-[11px] font-bold text-muted-foreground shadow-sm ring-1 ring-border">
                    +{users.length - 3}
                </div>
            )}
        </div>
    );
};

const ProjectRow = ({
    project,
    currentUserRole,
    onArchive,
    onRestore,
    onPermanentDelete,
    onRowClick,
    isSelected,
    onToggleSelect,
}) => {
    const { t, i18n } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const statusInfo = statusStyles[project.status] || statusStyles['pending'];

    const formatDate = (dateString) => {
        if (!dateString) return t('projects.projectRow.na');
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    return (
        <tr
            className={clsx(
                'group h-16 cursor-pointer border-b border-border/50 font-medium transition-all duration-200 focus-within:bg-muted/30 hover:bg-muted/30',
                isSelected && 'bg-primary/5',
            )}
            onClick={() => onRowClick(project._id)}
        >
            {currentUserRole !== 'employee' && (
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(project._id)}
                        aria-label={t('common.select') || 'Select project'}
                        className="h-4.5 w-4.5 cursor-pointer rounded-md border-input bg-card text-primary transition-all focus:ring-primary focus:ring-offset-2"
                    />
                </td>
            )}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm transition-transform group-hover:scale-110">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {project.name}
                        </span>
                        <span className="hidden w-48 truncate text-[11px] font-medium text-muted-foreground/60 md:block">
                            {project.description ||
                                t('projects.projectRow.noDescription')}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div
                    className={clsx(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm',
                        statusInfo.bg,
                        statusInfo.text,
                    )}
                >
                    <div
                        className={clsx(
                            'h-1.5 w-1.5 rounded-full',
                            statusInfo.dot,
                        )}
                    />
                    {translateProjectStatus(project.status, i18n.language)}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary/50 shadow-inner">
                        <div
                            className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)] transition-all duration-700 ease-out"
                            style={{ width: `${project.progress || 0}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                        {project.progress || 0}%
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-xs font-bold text-foreground">
                    {formatDate(project.endDate)}
                </div>
            </td>
            <td className="px-6 py-4">
                <AssignedUsersAvatarGroup users={project.assignedUsers} />
            </td>

            {currentUserRole !== 'employee' && (
                <td className="px-6 py-4">
                    <div className="relative flex" ref={menuRef}>
                        <button
                            type="button"
                            onClick={handleMenuClick}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-90 sm:h-8 sm:w-8"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        project.isArchived
                                            ? onRestore(project._id)
                                            : onArchive(project._id);
                                        setShowMenu(false);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                                >
                                    {project.isArchived ? (
                                        <>
                                            <ArchiveRestore className="h-4 w-4" />
                                            {t('projects.projectRow.restore')}
                                        </>
                                    ) : (
                                        <>
                                            <Archive className="h-4 w-4 text-amber-500" />
                                            {t('projects.projectRow.archive')}
                                        </>
                                    )}
                                </button>
                                {(currentUserRole === 'admin' ||
                                    currentUserRole === 'owner') && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPermanentDelete(project._id);
                                            setShowMenu(false);
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {t('projects.projectRow.delete')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
};

export default ProjectRow;
