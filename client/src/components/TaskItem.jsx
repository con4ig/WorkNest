import React, { useState, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../src/services/api.js';
import moment from 'moment';
import 'moment/locale/pl';
import DatePicker, { registerLocale } from 'react-datepicker';
import { pl } from 'date-fns/locale/pl';
import { enGB } from 'date-fns/locale/en-GB';

registerLocale('pl', pl);
registerLocale('en', enGB);

import { translateTaskStatus, translatePriority } from '../utils/translations';
import {
    Icon,
    getStatusClasses,
    getPriorityClasses,
    formatDateForInput,
    AVAILABLE_PRIORITIES,
    TASK_STATUSES,
} from './projects/ProjectTaskShared.jsx';

// Custom Input for DatePicker - defined outside to avoid re-renders if possible, 
// but it needs t() so let's move it into the component or pass t as prop
const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <button
        type="button"
        className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 w-40"
        onClick={onClick}
        ref={ref}
    >
        <Icon.Calendar size={12} />
        {value || placeholder}
    </button>
));
CustomDateInput.displayName = 'CustomDateInput';


const TaskItem = ({ task, onUpdate, onDelete, projectUsers, isAdmin, isProjectEditing }) => {
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
        moment.locale(i18n.language);
    }, [i18n.language]);

    useEffect(() => {
        if (!isEditing) {
            setEditData({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                assignedTo: task.assignedTo?._id || '',
                dueDate: formatDateForInput(task.dueDate),
            });
        }
    }, [task, isEditing]);

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
    const statusOptions = TASK_STATUSES.map(s => ({ 
        id: s, 
        name: t(`common.taskStatus.${s}`) 
    }));
    const priorityOptions = AVAILABLE_PRIORITIES.map(p => ({ 
        id: p, 
        name: t(`common.priority.${p}`) 
    }));
    const userOptions = [
        { id: '', name: t('common.unassigned') },
        ...projectUsers.map(u => ({ id: u._id, name: u.username }))
    ];

    return (
        <div
            className={`group flex items-start gap-3 rounded-lg border bg-white p-4 transition-all duration-200 ease-in-out ${
                isEditing
                    ? 'border-emerald-400 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
            }`}
        >
            <div className="flex-1">
                {isEditing ? (
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) =>
                                setEditData({ ...editData, title: e.target.value })
                            }
                            className="mb-1 w-full rounded-md border-gray-300 bg-gray-50 px-2 py-1 text-base font-semibold text-gray-800 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder={t('projects.details.kanban.taskTitlePlaceholder')}
                        />
                        <textarea
                            value={editData.description}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    description: e.target.value,
                                })
                            }
                            className="w-full rounded-md border-gray-300 bg-gray-50 px-2 py-1 text-sm text-gray-600 focus:border-emerald-500 focus:ring-emerald-500"
                            rows="2"
                            placeholder={t('projects.details.addDescriptionPlaceholder')}
                        />
                    </div>
                ) : (
                    <div>
                        <h4
                            className={`font-semibold ${
                                task.status === 'completed'
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-800'
                            }`}
                        >
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="mt-1 text-sm text-gray-600">
                                {task.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-3 flex flex-col gap-2 text-xs">
                    {isEditing ? (
                        <>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={editData.status}
                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                    className="rounded-full border border-gray-300 bg-gray-50 py-1 pl-3 pr-10 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={editData.priority}
                                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                                    className="rounded-full border border-gray-300 bg-gray-50 py-1 pl-3 pr-10 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {priorityOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={editData.assignedTo}
                                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                                    className="rounded-full border border-gray-300 bg-gray-50 py-1 pl-3 pr-10 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {userOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                
                                <DatePicker
                                    selected={editData.dueDate ? new Date(editData.dueDate) : null}
                                    onChange={(date) => {
                                        const formattedDate = date ? formatDateForInput(date) : '';
                                        setEditData({ ...editData, dueDate: formattedDate });
                                    }}
                                    dateFormat="dd MMM yyyy"
                                    locale={i18n.language}
                                    isClearable
                                    placeholderText={t('common.selectDate')}
                                    customInput={<CustomDateInput />}
                                    popperPlacement="top-start"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`rounded-full px-2 py-1 ${getStatusClasses(
                                        task.status,
                                    )}`}
                                >
                                    {t(`common.taskStatus.${task.status}`)}
                                </span>
                                <span
                                    className={`rounded-full px-2 py-1 ${getPriorityClasses(
                                        task.priority,
                                    )}`}
                                >
                                    {t(`common.priority.${task.priority}`)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {task.assignedTo && (
                                    <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 w-fit">
                                        <Icon.User size={12} /> {task.assignedTo.username}
                                    </span>
                                )}
                                {task.dueDate && (
                                    <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 w-fit">
                                        <Icon.Calendar size={12} />{' '}
                                        {moment(task.dueDate).format('DD MMM YYYY')}
                                    </span>
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
                                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                                >
                                    <Icon.Save size={14} /> {t('common.save')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-1.5 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                                >
                                    <Icon.Cancel size={14} /> {t('common.cancel')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                                >
                                    <Icon.Edit3 />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(task._id)}
                                    className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
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
