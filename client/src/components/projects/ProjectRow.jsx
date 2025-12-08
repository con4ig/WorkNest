import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    MoreVertical,
    Archive,
    Trash2,
    ArchiveRestore,
} from 'lucide-react';

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
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-xs font-bold text-sky-700"
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
            ))}
            {users.length > 3 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-700">
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
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const statusInfo = statusStyles[project.status] || statusStyles['pending'];

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
            className={`cursor-pointer border-b border-slate-100 transition-colors last:border-0 ${
                isSelected
                    ? 'bg-emerald-50 hover:bg-emerald-100'
                    : 'hover:bg-slate-50'
            }`}
            onClick={() => onRowClick(project._id)}
        >
            {currentUserRole !== 'employee' && (
            <td className="w-4 px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <div
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded transition-transform active:scale-90"
                    onClick={() => onToggleSelect(project._id)}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Zmiana stanu w divie wyżej
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 transition-all checked:bg-emerald-600 hover:border-emerald-500 focus:ring-emerald-500"
                    />
                </div>
            </td>
            )}
            <td className="px-6 py-4">
                <div className="font-semibold text-slate-800">
                    {project.name}
                </div>
                {project.client && (
                    <div className="text-sm text-slate-500">
                        {project.client}
                    </div>
                )}
            </td>
            <td className="hidden px-6 py-4 md:table-cell">
                <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}
                >
                    {statusInfo.label}
                </span>
            </td>
            <td className="hidden px-6 py-4 md:table-cell">
                <div className="flex w-full min-w-[100px] flex-col gap-1">
                    <span className="text-xs font-medium text-slate-700">
                        {project.progress || 0}%
                    </span>
                    <div className="h-1.5 w-full rounded-full bg-slate-200">
                        <div
                            className="h-1.5 rounded-full bg-emerald-600"
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>
                </div>
            </td>
            <td className="hidden px-6 py-4 xl:table-cell">
                <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(project.endDate)}
                </div>
            </td>
            <td className="hidden px-6 py-4 lg:table-cell">
                <AssignedUsersAvatarGroup users={project.assignedUsers} />
            </td>
            {currentUserRole !== 'employee' && (
            <td className="px-6 py-4">
                <div className="relative flex" ref={menuRef}>
                    <button
                        onClick={handleMenuClick}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                                {project.isArchived ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRestore(project._id);
                                            setShowMenu(false);
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        <ArchiveRestore className="mr-2 h-4 w-4" />
                                        Przywróć
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onArchive(project._id);
                                            setShowMenu(false);
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        <Archive className="mr-2 h-4 w-4 text-orange-500" />
                                        <span className="text-orange-600">
                                            Archiwizuj
                                        </span>
                                    </button>
                                )}
                                {(currentUserRole === 'admin' || currentUserRole === 'owner') && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPermanentDelete(project._id);
                                            setShowMenu(false);
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Usuń trwale
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </td>
            )}
        </tr>
    );
};

export default ProjectRow;
