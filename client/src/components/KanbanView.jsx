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

const DroppableArea = ({ status }) => {
    const { t } = useTranslation();
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                'flex h-32 items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300',
                isOver
                    ? 'border-primary bg-primary/10 text-primary scale-[0.98] shadow-inner'
                    : 'border-border/50 bg-muted/20 text-muted-foreground/40 hover:border-border hover:bg-muted/30',
            )}
        >
            <span className="text-[10px] font-bold uppercase tracking-widest">
                {isOver
                    ? t('projects.kanban.dropHere')
                    : t('projects.kanban.noProjects')}
            </span>
        </div>
    );
};

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
        <div className="flex w-full flex-col rounded-2xl border border-border/40 bg-secondary/10 p-4 shadow-sm backdrop-blur-sm lg:max-h-[calc(100vh-220px)] lg:w-1/4 lg:min-w-[280px]">
            {/* Header kolumny */}
            <div className="mb-5 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <div
                        className={clsx('h-2 w-2 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]', color)}
                    ></div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">
                        {title}
                    </h3>
                </div>
                <span className="flex h-5 min-w-[24px] items-center justify-center rounded-lg border border-border bg-card px-1.5 text-[10px] font-bold text-primary shadow-sm ring-1 ring-black/5">
                    {projects.length}
                </span>
            </div>

            {/* Lista projektów */}
            <SortableContext
                items={projects.map((p) => p._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="custom-scrollbar space-y-3 lg:flex-1 lg:overflow-y-auto lg:pr-1">
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
            color: 'bg-yellow-500',
        },
        {
            status: 'running',
            title: t('common.projectStatus.running'),
            color: 'bg-blue-500',
        },
        {
            status: 'completed',
            title: t('common.projectStatus.completed'),
            color: 'bg-primary',
        },
        {
            status: 'on-hold',
            title: t('common.projectStatus.on-hold'),
            color: 'bg-destructive',
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
            <div className="flex flex-col gap-4 pb-4 lg:h-full lg:flex-row lg:items-start lg:overflow-x-auto">
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
