import { useState, useEffect } from 'react';
import api from '../services/api.js'; // ZMIANA: Importujemy naszą instancję api
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

const Icon = {
    X: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    ),
};

export default function AddProjectModal({ isOpen, onClose, onSuccess }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const companyId = user?.company?._id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        startDate: '',
        endDate: '',
        assignedUsers: [],
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && companyId) {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, companyId]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users', {
                params: { company: companyId },
            }); // ZMIANA: Używamy 'api'
            setUsers(res.data.users || []); // ZABEZPIECZENIE: Upewnij się, że users jest zawsze tablicą
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUserToggle = (userId) => {
        setFormData((prev) => ({
            ...prev,
            assignedUsers: prev.assignedUsers.includes(userId)
                ? prev.assignedUsers.filter((id) => id !== userId)
                : [...prev.assignedUsers, userId],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... walidacja ...

        setLoading(true);
        setError('');

        try {
            const response = await api.post(
                // ZMIANA: Używamy 'api'
                '/projects',
                { ...formData, company: companyId },
            );

            const newProject = response.data.project;

            onSuccess(newProject);

            onClose();
        } catch (err) {
            console.error('Error creating project:', err);
            // ... obsługa błędu ...
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
                    <h2 className="text-2xl font-bold">{t('projects.addProject')}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                        <Icon.X />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            {t('projects.labelName')}{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            placeholder={t('projects.placeholderName')}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            {t('projects.labelDescription')}
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            placeholder={t('projects.placeholderDescription')}
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {t('common.status')}
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="pending">{t('common.projectStatus.pending')}</option>
                                <option value="running">{t('common.projectStatus.running')}</option>
                                <option value="completed">{t('common.projectStatus.completed')}</option>
                                <option value="on-hold">{t('common.projectStatus.on-hold')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {t('projects.labelPriority')}
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="low">🟢 {t('common.priority.low')}</option>
                                <option value="medium">🔵 {t('common.priority.medium')}</option>
                                <option value="high">🟠 {t('common.priority.high')}</option>
                                <option value="critical">🔴 {t('common.priority.critical')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {t('projects.labelStartDate')}
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {t('projects.labelEndDate')}
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Assigned Users */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            {t('projects.labelAssignedUsers')}
                        </label>
                        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-300 p-4">
                            {users.map((user) => (
                                <label
                                    key={user._id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.assignedUsers.includes(
                                            user._id,
                                        )}
                                        onChange={() =>
                                            handleUserToggle(user._id)
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="truncate text-sm font-medium">
                                            {user.username}
                                        </div>
                                        <div className="truncate text-xs text-gray-500 max-w-48">
                                            {user.email}
                                        </div>
                                    </div>
                                    <span className="ml-auto flex-shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        {t(`common.roles.${user.role}`)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-6 py-2 text-gray-600 transition-colors hover:bg-gray-100"
                            disabled={loading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? t('projects.creating') : t('projects.addProject')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
