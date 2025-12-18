import React from 'react';
import TaskItem from './TaskItem.jsx';
import InlineCreateTask from './InlineCreateTask.jsx';

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
    const statusConfig = {
        todo: {
            title: 'Do zrobienia',
            color: 'bg-slate-200',
            textColor: 'text-slate-800',
        },
        'in-progress': {
            title: 'W trakcie',
            color: 'bg-sky-200',
            textColor: 'text-sky-800',
        },
        completed: {
            title: 'Ukończone',
            color: 'bg-green-200',
            textColor: 'text-green-800',
        },
    };

    const config = statusConfig[status];

    return (
        <div className="flex min-h-[200px] w-full min-w-[300px] flex-1 flex-col rounded-xl bg-gray-100 p-4 sm:min-w-[350px]">
            <div
                className={`mb-4 flex items-center justify-between rounded-lg px-4 py-2 ${config.color}`}
            >
                <h3 className={`text-lg font-bold ${config.textColor}`}>
                    {config.title}
                </h3>
                <span
                    className={`font-bold ${config.textColor}`}
                >{`${tasks.length}`}</span>
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
                    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-400">
                        <p>Brak zadań w tej kolumnie</p>
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
        <div className="flex gap-6 overflow-x-auto pb-4">
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
