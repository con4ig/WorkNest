import React, { useState, forwardRef } from 'react';
import api from '../../src/services/api.js';
import moment from 'moment';
import 'moment/locale/pl';
import DatePicker from 'react-datepicker';

import { translateTaskStatus, translatePriority } from '../utils/translations';
import {
    Icon,
    getStatusClasses,
    getPriorityClasses,
    formatDateForInput,
    AVAILABLE_PRIORITIES,
    TASK_STATUSES,
} from './projects/ProjectTaskShared.jsx';
import CustomSelect from './common/CustomSelect.jsx';

moment.locale('pl');

// Custom Input for DatePicker
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <button
        type="button"
        className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
        onClick={onClick}
        ref={ref}
    >
        <Icon.Calendar size={12} />
        {value || 'Wybierz datę'}
    </button>
));
CustomDateInput.displayName = 'CustomDateInput';


const TaskItem = ({ task, onUpdate, onDelete, projectUsers, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || '',
        dueDate: formatDateForInput(task.dueDate),
    });

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
            alert(`Błąd: ${err.message}`);
        }
    };

    const toggleStatus = async () => {
        const statuses = ['todo', 'in-progress', 'completed'];
        const currentIndex = statuses.indexOf(task.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        try {
            await api.patch(`/tasks/${task._id}`, { status: nextStatus });
            onUpdate();
        } catch (err) {
            alert(`Błąd: ${err.message}`);
        }
    };

    // Data mapping for CustomSelect
    const statusOptions = TASK_STATUSES.map(s => ({ id: s, name: translateTaskStatus(s) }));
    const priorityOptions = AVAILABLE_PRIORITIES.map(p => ({ id: p, name: translatePriority(p) }));
    const userOptions = [
        { id: '', name: 'Nie przypisano' },
        ...projectUsers.map(u => ({ id: u._id, name: u.username }))
    ];


    const StatusIcon = () => {
        switch (task.status) {
            case 'completed':
                return <Icon.CheckCircle className="text-green-600" />;
            case 'in-progress':
                return <Icon.Clock className="text-sky-600" />;
            default:
                return <Icon.Circle className="text-slate-400" />;
        }
    };

    return (
        <div
            className={`group flex items-start gap-3 rounded-lg border bg-white p-4 transition-all duration-200 ease-in-out ${
                isEditing
                    ? 'border-emerald-400 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
            }`}
        >
            <button
                onClick={!isEditing ? toggleStatus : () => {}}
                disabled={isEditing}
                className="mt-0.5 transition-transform duration-200 ease-in-out enabled:hover:scale-110 disabled:cursor-not-allowed"
            >
                <StatusIcon />
            </button>

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
                            placeholder="Tytuł zadania"
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
                            placeholder="Dodaj opis..."
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

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {isEditing ? (
                        <>
                            <CustomSelect
                                selected={editData.status}
                                onChange={(value) => setEditData({ ...editData, status: value })}
                                options={statusOptions}
                            />
                            <CustomSelect
                                selected={editData.priority}
                                onChange={(value) => setEditData({ ...editData, priority: value })}
                                options={priorityOptions}
                            />
                            <CustomSelect
                                selected={editData.assignedTo}
                                onChange={(value) => setEditData({ ...editData, assignedTo: value })}
                                options={userOptions}
                                placeholder="Przypisz osobę"
                            />
                            
                            <DatePicker
                                selected={editData.dueDate ? new Date(editData.dueDate) : null}
                                onChange={(date) => {
                                    const formattedDate = date ? formatDateForInput(date) : '';
                                    setEditData({ ...editData, dueDate: formattedDate });
                                }}
                                dateFormat="dd MMM yyyy"
                                isClearable
                                customInput={<CustomDateInput />}
                            />
                        </>
                    ) : (
                        <>
                            <span
                                className={`rounded-full px-2 py-1 ${getStatusClasses(
                                    task.status,
                                )}`}
                            >
                                {translateTaskStatus(task.status)}
                            </span>
                            <span
                                className={`rounded-full px-2 py-1 ${getPriorityClasses(
                                    task.priority,
                                )}`}
                            >
                                {translatePriority(task.priority)}
                            </span>
                            {task.assignedTo && (
                                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                    <Icon.User size={12} /> {task.assignedTo.username}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                    <Icon.Calendar size={12} />{' '}
                                    {moment(task.dueDate).format('DD MMM YYYY')}
                                </span>
                            )}
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
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                                >
                                    <Icon.Save size={14} /> Zapisz
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-1.5 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                                >
                                    <Icon.Cancel size={14} /> Anuluj
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                                >
                                    <Icon.Edit3 />
                                </button>
                                <button
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Czy na pewno usunąć to zadanie?',
                                            )
                                        ) {
                                            onDelete(task._id);
                                        }
                                    }}
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


