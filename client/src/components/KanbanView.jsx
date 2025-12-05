import React from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, Trash2 } from 'lucide-react';

const priorityStyles = {
    low: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Niski' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Średni' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Wysoki' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Krytyczny' },
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

// Komponent pojedynczej karty projektu (draggable)
const ProjectCard = ({
    project,
    onCardClick,
    onArchive,
    onPermanentDelete,
    currentUserRole,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityInfo =
        priorityStyles[project.priority] || priorityStyles['medium'];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative mb-3 cursor-move rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
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
                {currentUserRole === 'admin' && (
                    <div className="ml-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                    <span className="text-xs text-slate-500">Postęp</span>
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

// Komponent droppable area dla pustej kolumny
const DroppableArea = ({ status }) => {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={`flex h-32 items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isOver
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                    : 'border-slate-300 text-slate-400'
            }`}
        >
            {isOver ? 'Upuść tutaj' : 'Brak projektów'}
        </div>
    );
};

// Komponent kolumny Kanban
const KanbanColumn = ({
    status,
    title,
    projects,
    onCardClick,
    color,
    onArchive,
    onPermanentDelete,
    currentUserRole,
}) => {
    return (
        <div className="flex min-h-[500px] w-full min-w-[280px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-4 lg:w-1/4">
            {/* Header kolumny */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">{title}</h3>
                <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}
                >
                    {projects.length}
                </span>
            </div>

            {/* Lista projektów */}
            <SortableContext
                items={projects.map((p) => p._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 space-y-2">
                    {projects.length === 0 ? (
                        <DroppableArea status={status} />
                    ) : (
                        projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onCardClick={onCardClick}
                                onArchive={onArchive}
                                onPermanentDelete={onPermanentDelete}
                                currentUserRole={currentUserRole}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

// Główny komponent Kanban
const KanbanView = ({
    projects,
    onStatusChange,
    onCardClick,
    onArchive,
    onPermanentDelete,
    currentUserRole,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor),
    );

    const columns = [
        { status: 'pending', title: 'Oczekujące', color: 'bg-yellow-500' },
        { status: 'running', title: 'W Trakcie', color: 'bg-sky-500' },
        { status: 'completed', title: 'Ukończone', color: 'bg-emerald-500' },
        { status: 'on-hold', title: 'Wstrzymane', color: 'bg-red-500' },
    ];

    // Grupowanie projektów po statusie
    const projectsByStatus = columns.reduce((acc, col) => {
        acc[col.status] = projects.filter((p) => p.status === col.status);
        return acc;
    }, {});

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeProject = projects.find((p) => p._id === active.id);
        if (!activeProject) return;

        let targetStatus = null;

        // 1. Najpierw sprawdź czy over.id to status kolumny (dla pustych kolumn z DroppableArea)
        const column = columns.find((c) => c.status === over.id);
        if (column) {
            targetStatus = column.status;
        }

        // 2. Jeśli nie, sprawdź czy upuszczono na inny projekt
        if (!targetStatus) {
            const overProject = projects.find((p) => p._id === over.id);
            if (overProject) {
                targetStatus = overProject.status;
            }
        }

        // 3. Jeśli status się zmienił, wywołaj callback
        if (targetStatus && activeProject.status !== targetStatus) {
            onStatusChange(activeProject._id, targetStatus);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.status}
                        status={col.status}
                        title={col.title}
                        projects={projectsByStatus[col.status] || []}
                        onCardClick={onCardClick}
                        color={col.color}
                        onArchive={onArchive}
                        onPermanentDelete={onPermanentDelete}
                        currentUserRole={currentUserRole}
                    />
                ))}
            </div>
        </DndContext>
    );
};

export default KanbanView;
