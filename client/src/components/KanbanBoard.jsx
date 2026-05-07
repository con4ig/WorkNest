import React from 'react';
import { useTranslation } from 'react-i18next';
import TaskItem from './TaskItem.jsx';
import InlineCreateTask from './InlineCreateTask.jsx';
import clsx from 'clsx';

const KanbanColumn = ({
    status,
    tasks,
    onUpdate,
    onDelete,
    projectUsers,
    isAdmin,
    projectId,
    onTaskCreated,
    isProjectEditing,
}) => {
    const { t } = useTranslation();
    const statusConfig = {
        todo: {
            title: t('common.taskStatus.todo'),
            dotColor: 'bg-muted-foreground/30',
        },
        'in-progress': {
            title: t('common.taskStatus.in-progress'),
            dotColor: 'bg-primary',
        },
        completed: {
            title: t('common.taskStatus.completed'),
            dotColor: 'bg-green-500',
        },
    };

    const config = statusConfig[status];

    return (
        <div className="flex min-h-[250px] w-full min-w-[280px] max-w-[400px] flex-1 flex-col rounded-xl border border-border/40 bg-secondary/10 p-3 shadow-sm transition-all duration-300 backdrop-blur-sm hover:bg-secondary/20 sm:min-h-[300px] sm:min-w-[320px] sm:p-5">
            <div className="mb-4 flex items-center justify-between px-1 sm:mb-6">
                <div className="flex items-center gap-2.5">
                    <div className={clsx("h-2 w-2 rounded-full", config.dotColor)} />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                        {config.title}
                    </h3>
                    <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground/60">
                        {tasks.length}
                    </span>
                </div>
            </div>
            <div className="custom-scrollbar max-h-[600px] flex-grow space-y-3 overflow-y-auto pr-2">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            projectUsers={projectUsers}
                            isAdmin={isAdmin}
                            isProjectEditing={isProjectEditing}
                        />
                    ))
                ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-border/40 bg-secondary/5 text-center text-sm text-muted-foreground/60 transition-colors group-hover:bg-secondary/10">
                        <p>{t('projects.details.kanban.noTasksInColumn')}</p>
                    </div>
                )}
            </div>
            {status === 'todo' && isAdmin && (
                <div className="mt-auto pt-2">
                    <InlineCreateTask
                        projectId={projectId}
                        onTaskCreated={onTaskCreated}
                    />
                </div>
            )}
        </div>
    );
};


const KanbanBoard = ({ tasks, onUpdate, onDelete, projectUsers, isAdmin, projectId, onTaskCreated, isProjectEditing }) => {
    const groupedTasks = {
        todo: tasks.filter((t) => t.status === 'todo'),
        'in-progress': tasks.filter((t) => t.status === 'in-progress'),
        completed: tasks.filter((t) => t.status === 'completed'),
    };

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 sm:gap-6">
            {Object.keys(groupedTasks).map((status) => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={groupedTasks[status]}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    projectUsers={projectUsers}
                    isAdmin={isAdmin}
                    projectId={projectId}
                    onTaskCreated={onTaskCreated}
                    isProjectEditing={isProjectEditing}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;
