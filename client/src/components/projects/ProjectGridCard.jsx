import React from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import clsx from 'clsx';

const statusStyles = {
    pending: {
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
    },
    running: {
        text: 'text-indigo-700',
        bg: 'bg-indigo-50',
    },
    completed: {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
    },
    'on-hold': {
        text: 'text-slate-700',
        bg: 'bg-slate-100',
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
                <div className="text-xs text-slate-400">
                    {t('projects.projectRow.none')}
                </div>
            );
        }

        return (
            <div className="flex -space-x-2">
                {users.slice(0, 3).map((user) => (
                    <div
                        key={user._id}
                        title={user.username}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-white"
                    >
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                ))}
                {users.length > 3 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-white">
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
                'group cursor-pointer p-5 transition-all hover:shadow-lg',
                isSelected
                    ? 'shadow-md ring-2 ring-indigo-500'
                    : 'hover:border-indigo-200',
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
                                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 transition-all focus:ring-indigo-500"
                            />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                            <h3
                                className="truncate pr-2 text-base font-bold text-slate-900 transition-colors hover:text-indigo-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCardClick(project._id);
                                }}
                            >
                                {project.name}
                            </h3>
                            {/* Actions visible on hover/selected */}
                            {(currentUserRole === 'admin' ||
                                currentUserRole === 'owner') && (
                                <div
                                    className={clsx(
                                        'flex gap-1 transition-opacity',
                                        isSelected
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-100',
                                    )}
                                >
                                    {!showArchived ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onArchive(project._id);
                                            }}
                                            title={t(
                                                'projects.projectGridCard.archiveTitle',
                                            )}
                                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                        >
                                            <Archive className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRestore(project._id);
                                                }}
                                                title={t(
                                                    'projects.projectGridCard.restoreTitle',
                                                )}
                                                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                            >
                                                <ArchiveRestore className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPermanentDelete(
                                                        project._id,
                                                    );
                                                }}
                                                title={t(
                                                    'projects.projectGridCard.deleteTitle',
                                                )}
                                                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">
                            {project.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
                <div>
                    <span
                        className={clsx(
                            'inline-flex rounded-md px-2.5 py-1 text-xs font-semibold leading-none',
                            statusInfo.bg,
                            statusInfo.text,
                        )}
                    >
                        {t(`common.projectStatus.${project.status}`)}
                    </span>
                </div>
                {/* Optional: Add priority or other tag here */}
            </div>

            <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {t('projects.projectGridCard.progress')}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                        {project.tasks?.filter((t) => t.status === 'completed')
                            .length || 0}
                        /{project.tasks?.length || 0} ({project.progress || 0}%)
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={clsx(
                            'h-full rounded-full transition-all duration-300',
                            (project.progress || 0) === 100
                                ? 'bg-emerald-500'
                                : 'bg-indigo-500',
                        )}
                        style={{ width: `${project.progress || 0}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {t('projects.projectGridCard.deadline')}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                        {formatDate(project.endDate)}
                    </div>
                </div>
                <div>
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {t('projects.projectGridCard.assigned')}
                    </div>
                    <AssignedUsersAvatarGroup users={project.assignedUsers} />
                </div>
            </div>
        </Card>
    );
};

export default ProjectGridCard;
