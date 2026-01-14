import React from 'react';
import { useTranslation } from 'react-i18next';
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
import clsx from 'clsx';
import ProjectCard from './projects/ProjectCard';

// Komponent droppable area dla pustej kolumny
const DroppableArea = ({ status }) => {
    const { t } = useTranslation();
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                'flex h-32 items-center justify-center rounded-xl border-2 border-dashed transition-all',
                isOver
                    ? 'border-indigo-400 bg-indigo-50/50 text-indigo-600'
                    : 'border-slate-200 bg-slate-50/50 text-slate-400',
            )}
        >
            <span className="text-xs font-medium">
                {isOver
                    ? t('projects.kanban.dropHere')
                    : t('projects.kanban.noProjects')}
            </span>
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
    bgHeader,
    onArchive,
    onPermanentDelete,
    currentUserRole,
}) => {
    return (
        <div className="flex max-h-[calc(100vh-200px)] min-w-[300px] flex-col rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 lg:w-1/4">
            {/* Header kolumny */}
            <div className="mb-4 flex items-center justify-between px-1 pt-1">
                <div className="flex items-center gap-2">
                    <div
                        className={clsx('h-2.5 w-2.5 rounded-full', color)}
                    ></div>
                    <h3 className="text-sm font-bold leading-none text-slate-700">
                        {title}
                    </h3>
                </div>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border border-slate-100 bg-white px-1.5 text-[10px] font-bold text-slate-500 shadow-sm">
                    {projects.length}
                </span>
            </div>

            {/* Lista projektów */}
            <SortableContext
                items={projects.map((p) => p._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
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
    const { t } = useTranslation();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor),
    );

    const columns = [
        {
            status: 'pending',
            title: t('common.projectStatus.pending'),
            color: 'bg-yellow-400',
        },
        {
            status: 'running',
            title: t('common.projectStatus.running'),
            color: 'bg-indigo-500',
        },
        {
            status: 'completed',
            title: t('common.projectStatus.completed'),
            color: 'bg-emerald-500',
        },
        {
            status: 'on-hold',
            title: t('common.projectStatus.on-hold'),
            color: 'bg-slate-400',
        },
    ];

    // Grupowanie projektów po statusie
    const projectsByStatus = columns.reduce((acc, col) => {
        acc[col.status] = projects.filter((p) => p.status === col.status);
        return acc;
    }, {});

    const handleDragEnd = (event) => {
        if (currentUserRole === 'employee') return;
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
            <div className="flex h-full items-start gap-4 overflow-x-auto pb-4">
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
