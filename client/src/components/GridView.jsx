import React from 'react';
import { Trash2, Archive, ArchiveRestore } from 'lucide-react';

const priorityStyles = {
    low: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Niski' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Średni' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Wysoki' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Krytyczny' },
};

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

const GridView = ({
    projects,
    currentUserRole,
    onDelete,
    onArchive,
    onRestore,
    onCardClick,
    showArchived,
    selectedProjects = [], // Dodano
    onToggleSelect, // Dodano
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => {
                const statusInfo =
                    statusStyles[project.status] || statusStyles['pending'];
                const priorityInfo =
                    priorityStyles[project.priority] ||
                    priorityStyles['medium'];

                const isSelected = selectedProjects.includes(project._id);

                return (
                    <div
                        key={project._id}
                        className={`cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-md transition-all hover:shadow-lg ${
                            project.isArchived ? 'opacity-60' : ''
                        } ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
                        onClick={() => onCardClick(project._id)}
                    >
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between">
                            {/* Checkbox */}
                            <div className="mr-3 pt-1">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleSelect(project._id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-800">
                                    {project.name}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                    {project.description}
                                </p>
                            </div>
                            {currentUserRole === 'admin' && (
                                <div className="flex gap-1">
                                    {showArchived ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRestore(project._id);
                                            }}
                                            title="Przywróć projekt"
                                            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                        >
                                            <ArchiveRestore className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onArchive(project._id);
                                            }}
                                            title="Archiwizuj projekt"
                                            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-yellow-50 hover:text-yellow-600"
                                        >
                                            <Archive className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(project._id);
                                        }}
                                        title="Usuń projekt"
                                        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}
                            >
                                {statusInfo.label}
                            </span>
                            <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${priorityInfo.bg} ${priorityInfo.text}`}
                            >
                                {priorityInfo.label}
                            </span>
                            {project.isArchived && (
                                <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                                    Archiwum
                                </span>
                            )}
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="mb-1 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    Postęp
                                </div>
                                <span className="text-xs font-medium text-slate-700">
                                    {project.progress || 0}%
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200">
                                <div
                                    className="h-2 rounded-full bg-emerald-600 transition-all"
                                    style={{
                                        width: `${project.progress || 0}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                            <div>
                                <div className="mb-1 text-xs text-slate-500">
                                    Termin
                                </div>
                                <div className="text-sm font-medium text-slate-700">
                                    {formatDate(project.endDate)}
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 text-xs text-slate-500">
                                    Przypisani
                                </div>
                                <AssignedUsersAvatarGroup
                                    users={project.assignedUsers}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GridView;
