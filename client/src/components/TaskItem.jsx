import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import api from '../../src/services/api.js';

import DatePicker, { registerLocale } from 'react-datepicker';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import { enGB } from 'date-fns/locale/en-GB';

registerLocale('pl', pl);
registerLocale('en', enGB);
import { Select } from './ui/Select';

import {
    Icon,
    getStatusColor,
    getPriorityColor,
    formatDateForInput,
    AVAILABLE_PRIORITIES,
    TASK_STATUSES,
} from './projects/ProjectTaskShared.jsx';

// Custom Input for DatePicker - defined outside to avoid re-renders if possible,
// but it needs t() so let's move it into the component or pass t as prop
const CustomDateInput = ({ value, onClick, placeholder, ref }) => (
    <button
        type="button"
        className="flex min-w-0 max-w-[160px] items-center gap-1.5 truncate rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground hover:bg-secondary"
        onClick={onClick}
        ref={ref}
    >
        <Icon.Calendar size={12} className="shrink-0" />
        <span className="truncate">{value || placeholder}</span>
    </button>
);
CustomDateInput.displayName = 'CustomDateInput';

const CUSTOM_DATE_INPUT = <CustomDateInput />;

const TaskItem = ({
    task,
    onUpdate,
    onDelete,
    projectUsers,
    isAdmin,
    isProjectEditing: _isProjectEditing,
}) => {
    const { t, i18n } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || '',
        dueDate: formatDateForInput(task.dueDate),
    });

    useEffect(() => {
        // handled dynamically by date-fns locale
    }, [i18n.language]);

    // removed sync effect

    const handleSave = async () => {
        const payload = {
            ...editData,
            assignedTo: editData.assignedTo || null,
        };

        try {
            await api.patch(`/tasks/${task._id}`, payload);
            setIsEditing(false);
            onUpdate();
        } catch (err) {
            alert(`${t('common.error')}: ${err.message}`);
        }
    };

    // Data mapping for CustomSelect
    const statusOptions = TASK_STATUSES.map((s) => ({
        id: s,
        name: t(`common.taskStatus.${s}`),
    }));
    const priorityOptions = AVAILABLE_PRIORITIES.map((p) => ({
        id: p,
        name: t(`common.priority.${p}`),
    }));
    const userOptions = [
        { id: '', name: t('common.unassigned') },
        ...projectUsers.map((u) => ({ id: u._id, name: u.username })),
    ];

    return (
        <div
            className={`group flex items-start gap-3 rounded-lg border bg-card p-4 transition-all duration-200 ease-in-out ${
                isEditing
                    ? 'border-primary/50 shadow-lg ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:shadow-md'
            }`}
        >
            <div className="flex-1">
                {isEditing ? (
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={editData.title}
                            aria-label={t(
                                'projects.details.kanban.taskTitlePlaceholder',
                            )}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    title: e.target.value,
                                })
                            }
                            className="mb-1 w-full rounded-md border border-input bg-muted px-2 py-1 text-base font-semibold text-foreground focus:border-primary focus:ring-primary/20"
                            placeholder={t(
                                'projects.details.kanban.taskTitlePlaceholder',
                            )}
                        />
                        <textarea
                            value={editData.description}
                            aria-label={t(
                                'projects.details.addDescriptionPlaceholder',
                            )}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    description: e.target.value,
                                })
                            }
                            className="w-full rounded-md border border-input bg-muted px-2 py-1 text-sm text-muted-foreground focus:border-primary focus:ring-primary/20"
                            rows="2"
                            placeholder={t(
                                'projects.details.addDescriptionPlaceholder',
                            )}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div
                                    className={clsx(
                                        'h-2 w-2 flex-shrink-0 rounded-full',
                                        getStatusColor(task.status),
                                    )}
                                />
                                <h4
                                    className={clsx(
                                        'truncate text-sm font-semibold tracking-tight transition-colors',
                                        task.status === 'completed'
                                            ? 'text-muted-foreground/60 line-through'
                                            : 'text-foreground',
                                    )}
                                >
                                    {task.title}
                                </h4>
                            </div>
                            <div
                                className={clsx(
                                    'mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full',
                                    getPriorityColor(task.priority),
                                )}
                                title={t(`common.priority.${task.priority}`)}
                            />
                        </div>

                        {task.description && (
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/70">
                                {task.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-3 flex flex-col gap-2 text-xs">
                    {isEditing ? (
                        <>
                            {/* Row 1: Status + Priority — full width each on mobile */}
                            <div className="grid grid-cols-2 gap-2">
                                <Select
                                    value={editData.status}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.name}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    value={editData.priority}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            priority: e.target.value,
                                        })
                                    }
                                >
                                    {priorityOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Row 2: Assignee (full width) + DatePicker */}
                            <div className="flex flex-col gap-2">
                                <Select
                                    value={editData.assignedTo}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            assignedTo: e.target.value,
                                        })
                                    }
                                >
                                    {userOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.name}
                                        </option>
                                    ))}
                                </Select>

                                <DatePicker
                                    selected={
                                        editData.dueDate
                                            ? new Date(editData.dueDate)
                                            : null
                                    }
                                    onChange={(date) => {
                                        const formattedDate = date
                                            ? formatDateForInput(date)
                                            : '';
                                        setEditData({
                                            ...editData,
                                            dueDate: formattedDate,
                                        });
                                    }}
                                    dateFormat="dd MMM yyyy"
                                    locale={i18n.language}
                                    isClearable
                                    placeholderText={t('common.selectDate')}
                                    customInput={CUSTOM_DATE_INPUT}
                                    popperPlacement="top-start"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-3">
                                <div className="flex items-center gap-2">
                                    {task.assignedTo ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">
                                                {task.assignedTo.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="text-[10px] font-medium text-muted-foreground/80">
                                                {task.assignedTo.username}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] italic text-muted-foreground/40">
                                            {t('common.unassigned')}
                                        </span>
                                    )}
                                </div>

                                {task.dueDate && (
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/80">
                                        <Icon.Calendar
                                            size={10}
                                            className="text-muted-foreground/40"
                                        />
                                        {format(
                                            new Date(task.dueDate),
                                            'dd MMM',
                                            {
                                                locale:
                                                    i18n.language === 'pl'
                                                        ? pl
                                                        : enGB,
                                            },
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {isAdmin && (
                    <div
                        className={`flex items-center ${
                            isEditing ? 'justify-start' : 'justify-end'
                        } mt-4`}
                    >
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    <Icon.Save size={14} /> {t('common.save')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-secondary/80"
                                >
                                    <Icon.Cancel size={14} />{' '}
                                    {t('common.cancel')}
                                </button>
                            </div>
                        ) : (
                            /* Always visible on touch (mobile), hover-only on sm+ */
                            <div className="flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditData({
                                            title: task.title,
                                            description: task.description,
                                            status: task.status,
                                            priority: task.priority,
                                            assignedTo:
                                                task.assignedTo?._id || '',
                                            dueDate: formatDateForInput(
                                                task.dueDate,
                                            ),
                                        });
                                        setIsEditing(true);
                                    }}
                                    className="rounded p-1.5 text-muted-foreground transition-transform hover:bg-secondary hover:text-primary active:scale-90"
                                >
                                    <Icon.Edit3 />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(task._id)}
                                    className="rounded p-1.5 text-muted-foreground transition-transform hover:bg-destructive/10 hover:text-destructive active:scale-90"
                                >
                                    <Icon.Trash />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskItem;
