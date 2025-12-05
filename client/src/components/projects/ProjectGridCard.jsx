import React from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';

const statusStyles = {
    pending: {
        text: 'text-yellow-800',
        bg: 'bg-yellow-100',
        label: 'Oczekujący',
    },
    running: { text: 'text-sky-800', bg: 'bg-sky-100', label: 'W Trakcie' },
    completed: {
        text: 'text-emerald-800',
        bg: 'bg-emerald-100',
        label: 'Ukończony',
    },
    'on-hold': { text: 'text-red-800', bg: 'bg-red-100', label: 'Wstrzymany' },
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const AssignedUsersAvatarGroup = ({ users }) => {
    if (!users || users.length === 0) {
        return <div className="text-xs text-slate-400">Brak</div>;
    }

    return (
        <div className="flex -space-x-2">
            {users.slice(0, 3).map((user) => (
                <div
                    key={user._id}
                    title={user.username}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-xs font-bold text-sky-700"
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
            ))}
            {users.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-700">
                    +{users.length - 3}
                </div>
            )}
        </div>
    );
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
    const statusInfo = statusStyles[project.status] || statusStyles['pending'];

    return (
        <div
            className={`cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg ${
                isSelected ? 'ring-2 ring-emerald-500' : ''
            }`}
            onClick={() => onCardClick(project._id)}
        >
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(project._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                        <h3 className="text-base font-bold text-slate-800">
                            {project.name}
                        </h3>
                        <p className="max-w-[150px] truncate text-xs text-slate-500">
                            {project.description}
                        </p>
                    </div>
                </div>
                {currentUserRole === 'admin' && (
                    <div className="flex gap-1">
                        {!showArchived ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onArchive(project._id);
                                }}
                                title="Archiwizuj projekt"
                                className="-mt-2 rounded-full p-2 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
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
                                    title="Przywróć projekt"
                                    className="-mt-2 rounded-full p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                    <ArchiveRestore className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPermanentDelete(project._id);
                                    }}
                                    title="Usuń trwale"
                                    className="-mr-2 -mt-2 rounded-full p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <div className="mb-1 text-xs text-slate-500">Status</div>
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusInfo.bg} ${statusInfo.text}`}
                >
                    {statusInfo.label}
                </span>
            </div>

            <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                    <div className="text-xs text-slate-500">Postęp</div>
                    <span className="text-xs font-medium text-slate-700">
                        {project.progress || 0}%
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                        className="h-2 rounded-full bg-emerald-600"
                        style={{ width: `${project.progress || 0}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                    <div className="mb-1 text-xs text-slate-500">Termin</div>
                    <div className="text-sm font-medium text-slate-700">
                        {formatDate(project.endDate)}
                    </div>
                </div>
                <div>
                    <div className="mb-1 text-xs text-slate-500">
                        Przypisani
                    </div>
                    <AssignedUsersAvatarGroup users={project.assignedUsers} />
                </div>
            </div>
        </div>
    );
};

export default ProjectGridCard;
