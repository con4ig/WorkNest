import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, Trash2, Eye, Calendar } from 'lucide-react';
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
        return (
            <div className="text-[10px] font-medium italic text-muted-foreground/60">
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
                    className="flex h-7 w-7 items-center justify-center rounded-xl border-2 border-card bg-primary/10 text-[10px] font-bold text-primary shadow-sm ring-1 ring-border transition-transform hover:z-10 hover:scale-110"
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
            ))}
            {users.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-xl border-2 border-card bg-secondary text-[10px] font-bold text-muted-foreground shadow-sm ring-1 ring-border">
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
            bg: 'bg-muted/50 border-border',
            text: 'text-muted-foreground',
            label: t('common.priority.low'),
        },
        medium: {
            bg: 'bg-blue-500/10 border-blue-500/20',
            text: 'text-blue-500',
            label: t('common.priority.medium'),
        },
        high: {
            bg: 'bg-amber-500/10 border-amber-500/20',
            text: 'text-amber-500',
            label: t('common.priority.high'),
        },
        critical: {
            bg: 'bg-destructive/10 border-destructive/20',
            text: 'text-destructive',
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
            className={clsx(
                'group relative cursor-grab overflow-hidden p-4 ring-offset-background transition-all duration-200 hover:shadow-lg active:cursor-grabbing',
                isDragging
                    ? 'z-50 rotate-3 border-primary shadow-2xl ring-2 ring-primary ring-offset-4'
                    : 'hover:border-primary/40',
            )}
            onClick={() => onCardClick(project._id)}
            {...attributes}
            {...listeners}
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="line-clamp-2 text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {project.name}
                    </h4>

                    {(currentUserRole === 'admin' ||
                        currentUserRole === 'owner') && (
                        <div className="ml-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                                type="button"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    onCardClick(project._id);
                                }}
                                title="Details"
                                className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                            >
                                <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    onArchive(project._id);
                                }}
                                title="Archive"
                                className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-yellow-500"
                            >
                                <Archive className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    onPermanentDelete(project._id);
                                }}
                                title="Delete permanently"
                                className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span
                        className={clsx(
                            'shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm',
                            priorityInfo.bg,
                            priorityInfo.text,
                        )}
                    >
                        {priorityInfo.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 transition-colors group-hover:text-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(project.endDate)}</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-widest text-muted-foreground/50">
                            {t('projects.projectCard.progress')}
                        </span>
                        <span className="font-bold text-foreground">
                            {project.progress || 0}%
                        </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
                        <div
                            className="h-full bg-primary shadow-[0_0_4px_rgba(var(--primary),0.4)] transition-all duration-1000 ease-out"
                            style={{ width: `${project.progress || 0}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                    <AssignedUsersAvatarGroup users={project.assignedUsers} />
                </div>
            </div>
        </Card>
    );
};

export default ProjectCard;
