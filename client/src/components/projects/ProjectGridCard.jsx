import React from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import clsx from 'clsx';
import { translateProjectStatus } from '../../utils/translations';

const statusStyles = {
    pending: {
        text: 'text-amber-500',
        bg: 'bg-amber-500/10 border-amber-500/20',
        dot: 'bg-amber-500'
    },
    running: {
        text: 'text-blue-500',
        bg: 'bg-blue-500/10 border-blue-500/20',
        dot: 'bg-blue-500 animate-pulse'
    },
    completed: {
        text: 'text-primary',
        bg: 'bg-primary/10 border-primary/20',
        dot: 'bg-primary'
    },
    'on-hold': {
        text: 'text-destructive',
        bg: 'bg-destructive/10 border-destructive/20',
        dot: 'bg-destructive'
    },
};

const ProjectGridCard = ({
    project,
    currentUserRole,
    onArchive,
    onRestore,
    onPermanentDelete,
    showArchived,
    onCardClick,
    isSelected,
    onToggleSelect,
}) => {
    const { t, i18n } = useTranslation();
    const statusInfo = statusStyles[project.status] || statusStyles['pending'];

    const formatDate = (dateString) => {
        if (!dateString) return t('projects.projectRow.na');
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const AssignedUsersAvatarGroup = ({ users }) => {
        if (!users || users.length === 0) {
            return (
                <div className="text-xs font-medium text-muted-foreground/60 italic">
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

    const handleCardClick = (e) => {
        if (currentUserRole !== 'employee') {
            onToggleSelect(project._id);
        } else {
            onCardClick(project._id);
        }
    };

    return (
        <Card
            className={clsx(
                'group relative cursor-pointer overflow-hidden p-6 transition-all duration-300 active:scale-[0.98]',
                isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:border-primary/40',
            )}
            onClick={handleCardClick}
        >
            <div className="mb-4 flex items-start justify-between">
                <div className="flex w-full items-center gap-3">
                    {currentUserRole !== 'employee' && (
                        <div
                            className="-ml-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(project._id);
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="h-4 w-4 cursor-pointer rounded border-input bg-card text-primary transition-all focus:ring-primary"
                            />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                            <h3
                                className="truncate pr-2 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCardClick(project._id);
                                }}
                            >
                                {project.name}
                            </h3>
                            <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                {(currentUserRole === 'admin' || currentUserRole === 'owner' || currentUserRole === 'hr') && (
                                    <>
                                        {!showArchived ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onArchive(project._id);
                                                }}
                                                title={t('common.archive')}
                                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                                            >
                                                <Archive className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRestore(project._id);
                                                }}
                                                title={t('common.restore')}
                                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                            >
                                                <ArchiveRestore className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPermanentDelete(project._id);
                                            }}
                                            title={t('common.delete')}
                                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                            <div
                                className={clsx(
                                    'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
                                    statusInfo.bg,
                                    statusInfo.text,
                                )}
                            >
                                <div className={clsx('h-1.5 w-1.5 rounded-full', statusInfo.dot)} />
                                {translateProjectStatus(project.status, i18n.language)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 space-y-4">
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
                    {project.description || t('projects.projectRow.noDescription')}
                </p>
                
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        <span>{t('projects.projectGridCard.progress')}</span>
                        <span className="text-foreground font-bold">{project.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
                        <div 
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${project.progress || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        {t('projects.projectRow.team')}
                    </span>
                    <AssignedUsersAvatarGroup users={project.assignedUsers} />
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        {t('projects.projectGridCard.deadline')}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                        {formatDate(project.endDate)}
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default ProjectGridCard;
