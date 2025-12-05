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

import ProjectCard from './projects/ProjectCard';

// Komponent droppable area dla pustej kolumny

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
