import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import { Plus, X } from 'lucide-react';

const InlineCreateTask = ({ projectId, onTaskCreated }) => {
    const { t } = useTranslation();
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTask = async () => {
        if (!title.trim()) {
            setIsCreating(false);
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/tasks', {
                title: title.trim(),
                project: projectId,
                // Status defaults to 'todo' on the backend
            });
            setTitle('');
            setIsCreating(false);
            onTaskCreated(); // Notify parent to refetch tasks
        } catch (err) {
            alert(`${t('projects.details.kanban.errors.addError')}: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isCreating) {
        return (
            <button
                onClick={() => setIsCreating(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
                <Plus size={18} className="font-bold" />
                {t('projects.details.kanban.addNewTask')}
            </button>
        );
    }

    return (
        <div className="rounded-lg border border-border/50 bg-secondary/10 p-2 shadow-sm backdrop-blur-sm">
            <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('projects.details.kanban.taskTitlePlaceholder')}
                className="w-full resize-none border-none bg-transparent p-1 text-sm placeholder:text-muted-foreground focus:ring-0"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddTask();
                    }
                    if (e.key === 'Escape') {
                        setIsCreating(false);
                        setTitle('');
                    }
                }}
            />
            <div className="mt-2 flex items-center justify-between">
                {/* Placeholder for future controls e.g., assign user */}
                <div></div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setIsCreating(false);
                            setTitle('');
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={handleAddTask}
                        disabled={isSubmitting || !title.trim()}
                        className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? t('projects.details.kanban.adding') : t('common.add')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InlineCreateTask;
