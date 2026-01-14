import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, Trash2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import clsx from 'clsx';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const AssignedUsersAvatarGroup = ({ users }) => {
    const { t } = useTranslation();

    if (!users || users.length === 0) {
        return <div className="text-xs text-slate-400">Brak</div>;
    }

    return (
        <div className="flex -space-x-2">
            {users.slice(0, 3).map((user) => (
                <div
                    key={user._id}
                    title={user.username}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-indigo-50 text-xs font-bold text-indigo-600 ring-1 ring-white"
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
            ))}
            {users.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-white">
                    +{users.length - 3}
                </div>
            )}
        </div>
    );
};

const ProjectCard = ({
    project,
    onCardClick,
    onArchive,
    onPermanentDelete,
    currentUserRole,
}) => {
    const { t } = useTranslation();

    const priorityStyles = {
        low: {
            bg: 'bg-slate-100',
            text: 'text-slate-600',
            label: t('common.priority.low'),
        },
        medium: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            label: t('common.priority.medium'),
        },
        high: {
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            label: t('common.priority.high'),
        },
        critical: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            label: t('common.priority.critical'),
        },
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: project._id,
        disabled: currentUserRole === 'employee',
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: currentUserRole === 'employee' ? 'default' : 'grab',
    };

    const priorityInfo =
        priorityStyles[project.priority] || priorityStyles['medium'];

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(currentUserRole !== 'employee' ? listeners : {})}
            className={clsx(
                'group relative mb-3 cursor-grab p-4 transition-all hover:shadow-md active:cursor-grabbing',
                isDragging && 'rotate-2 shadow-lg ring-2 ring-indigo-500/20',
                currentUserRole === 'employee' && 'cursor-pointer',
            )}
            onClick={(e) => {
                if (!isDragging) {
                    onCardClick(project._id);
                }
            }}
        >
            <div className="mb-3 flex items-start justify-between">
                <h4 className="flex-1 text-sm font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
                    {project.name}
                </h4>
                {/* Actions */}
                {(currentUserRole === 'admin' ||
                    currentUserRole === 'owner') && (
                    <div className="ml-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                onCardClick(project._id);
                            }}
                            title="Szczegóły"
                            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                onArchive(project._id);
                            }}
                            title="Archiwizuj"
                            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-600"
                        >
                            <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                onPermanentDelete(project._id);
                            }}
                            title="Usuń trwale"
                            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            <p className="mb-4 line-clamp-2 text-xs font-medium text-slate-500">
                {project.description}
            </p>

            <div className="mb-4 flex items-center justify-between">
                <span
                    className={clsx(
                        'inline-flex rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider',
                        priorityInfo.bg,
                        priorityInfo.text,
                    )}
                >
                    {priorityInfo.label}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                    {formatDate(project.endDate)}
                </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {t('projects.card.progress')}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                        {project.progress || 0}%
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

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center text-xs text-slate-500">
                    {/* Placeholder for task count logic if needed */}
                </div>
                <AssignedUsersAvatarGroup users={project.assignedUsers} />
            </div>
        </Card>
    );
};

export default ProjectCard;
