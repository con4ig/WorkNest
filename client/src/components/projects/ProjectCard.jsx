import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, Trash2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

    // Zabezpieczenie przed undefined
    if (!users || users.length === 0) {
        return <div className="text-xs text-slate-400">Brak</div>;
    }

    return (
        <div className="flex -space-x-2">
            {users.slice(0, 3).map((user) => (
                <div
                    key={user._id}
                    title={user.username}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-xs font-bold text-sky-700"
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
            ))}
            {users.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-700">
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
        low: { bg: 'bg-slate-100', text: 'text-slate-700', label: t('common.priority.low') },
        medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: t('common.priority.medium') },
        high: { bg: 'bg-orange-100', text: 'text-orange-700', label: t('common.priority.high') },
        critical: { bg: 'bg-red-100', text: 'text-red-700', label: t('common.priority.critical') },
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project._id, disabled: currentUserRole === 'employee' });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: currentUserRole === 'employee' ? 'default' : 'move',
    };

    const priorityInfo =
        priorityStyles[project.priority] || priorityStyles['medium'];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(currentUserRole !== 'employee' ? listeners : {})}
            className="group relative mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
            onClick={(e) => {
                // Tylko jeśli nie przeciągamy
                if (!isDragging) {
                    onCardClick(project._id);
                }
            }}
        >
            <div className="mb-2 flex items-start justify-between">
                <h4 className="flex-1 text-sm font-semibold text-slate-800">
                    {project.name}
                </h4>
                {/* Actions - visible on hover or if forced */}
                {(currentUserRole === 'admin' || currentUserRole === 'owner') && (
                    <div className="ml-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                // We don't need onCardClick here if we have a click handler on the main div,
                                // but for clarity and safety let's call it direct
                                onCardClick(project._id);
                            }}
                            title="Szczegóły"
                            className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation(); // Stop drag start
                                onArchive(project._id);
                            }}
                            title="Archiwizuj"
                            className="rounded p-1 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                        >
                            <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation(); // Stop drag start
                                onPermanentDelete(project._id);
                            }}
                            title="Usuń trwale"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            <p className="mb-3 line-clamp-2 text-xs text-slate-500">
                {project.description}
            </p>

            {/* Priority badge */}
            <div className="mb-3">
                <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${priorityInfo.bg} ${priorityInfo.text}`}
                >
                    {priorityInfo.label}
                </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{t('projects.card.progress')}</span>
                    <span className="text-xs font-medium text-slate-700">
                        {project.progress || 0}%
                    </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200">
                    <div
                        className="h-1.5 rounded-full bg-emerald-600"
                        style={{ width: `${project.progress || 0}%` }}
                    ></div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-xs text-slate-500">
                    {formatDate(project.endDate)}
                </div>
                <AssignedUsersAvatarGroup users={project.assignedUsers} />
            </div>
        </div>
    );
};

export default ProjectCard;
