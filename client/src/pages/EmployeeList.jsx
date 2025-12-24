import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

const Icon = {
    ArrowLeft: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    ),
    Search: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
        </svg>
    ),
    Check: () => (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
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
    Users: ({ className }) => (
        <svg
            className={`h-5 w-5 ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
    ),
    Shield: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    Briefcase: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    AlertCircle: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
        </svg>
    ),
    Upload: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    Download: ({ size = 20, className = "" }) => (
        <svg
            className={`${className}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
};

const RoleChangeModal = ({
    isOpen,
    onClose,
    user,
    currentRole,
    onConfirm,
    isChanging,
}) => {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState(currentRole);

    useEffect(() => {
        setSelectedRole(currentRole);
    }, [currentRole, isOpen]);

    if (!isOpen) return null;

    const roles = [
        {
            value: 'employee',
            label: t('common.roles.employee'),
            icon: <Icon.Briefcase />,
            color: 'gray',
            description: t('employees.list.roleModal.employeeDesc'),
        },
        {
            value: 'hr',
            label: t('common.roles.hr'),
            icon: <Icon.Users />,
            color: 'blue',
            description: t('employees.list.roleModal.hrDesc'),
        },
        {
            value: 'admin',
            label: t('common.roles.admin'),
            icon: <Icon.Shield />,
            color: 'purple',
            description: t('employees.list.roleModal.adminDesc'),
        },
    ];

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'border-purple-500/20 bg-purple-50 text-purple-700';
            case 'hr':
                return 'border-blue-500/20 bg-blue-50 text-blue-700';
            default:
                return 'border-slate-300/50 bg-slate-50 text-slate-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-slate-200/50 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 p-5">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                            {t('employees.list.roleModal.title')}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                            {user?.username}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="-mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <Icon.X />
                    </button>
                </div>

                <div className="p-5">
                    <div className="space-y-2.5">
                        {roles.map((role) => (
                            <button
                                key={role.value}
                                onClick={() => setSelectedRole(role.value)}
                                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                                    selectedRole === role.value
                                        ? getRoleColor(role.value) +
                                          ' shadow-sm ring-2 ring-offset-1 ring-offset-white ' +
                                          (role.value === 'admin'
                                              ? 'ring-purple-400'
                                              : role.value === 'hr'
                                                ? 'ring-blue-400'
                                                : 'ring-slate-400')
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`rounded-lg p-2 ${
                                            selectedRole === role.value
                                                ? role.value === 'admin'
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : role.value === 'hr'
                                                      ? 'bg-blue-100 text-blue-600'
                                                      : 'bg-slate-200 text-slate-600'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {role.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900">
                                                {t(`common.roles.${role.value}`)}
                                            </span>
                                            {selectedRole === role.value && (
                                                <div
                                                    className={`${role.value === 'admin' ? 'text-purple-600' : role.value === 'hr' ? 'text-blue-600' : 'text-slate-600'}`}
                                                >
                                                    <Icon.Check />
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {t(`employees.list.roleModal.${role.value}Desc`)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedRole !== currentRole && (
                        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200/50 bg-amber-50 p-3 text-sm text-amber-800">
                            <div className="mt-0.5 flex-shrink-0 text-amber-600">
                                <Icon.AlertCircle />
                            </div>
                            <p className="leading-relaxed">
                                {t('employees.list.roleModal.warning')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 border-t border-slate-100 p-4">
                    <button
                        onClick={onClose}
                        disabled={isChanging}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={() => onConfirm(selectedRole)}
                        disabled={isChanging || selectedRole === currentRole}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isChanging ? t('employees.list.roleModal.submitting') : t('employees.list.roleModal.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Nowe okno importu - prosi o plik hasło
const ImportModal = ({ isOpen, onClose, onImport, isLoading }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [tempPassword, setTempPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!file) {
            setError(t('employees.list.importModal.fileRequired') || 'Wybierz plik CSV');
            return;
        }
        if (!tempPassword || tempPassword.length < 6) {
            setError(t('auth.validation.passwordMin') || 'Hasło tymczasowe musi mieć min. 6 znaków');
            return;
        }
        onImport(file, tempPassword);
    };

    const handleDownloadTemplate = () => {
        const headers = [
            'email',
            'username',
            'firstName',
            'lastName',
            'position',
            'department',
            'salary',
            'role',
        ];
        const exampleRows = [
            [
                'jan.kowalski@firma.pl',
                'janek',
                'Jan',
                'Kowalski',
                'Programista',
                'IT',
                '8000',
                'employee',
            ],
            [
                'anna.nowak@firma.pl',
                'anowak',
                'Anna',
                'Nowak',
                'HR Manager',
                'HR',
                '9500',
                'hr',
            ],
        ];

        const csvContent = [
            headers.join(','),
            ...exampleRows.map((row) => row.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'szablon_pracownikow.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200/50 bg-white p-5 shadow-2xl sm:p-6">
                <div className="mb-6 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                        {t('employees.list.importModal.title')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="-mt-1 text-slate-400 hover:text-slate-600"
                    >
                        <Icon.X />
                    </button>
                </div>

                <div className="mb-6 space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    <div>
                        <p className="mb-2 font-semibold text-slate-800">
                            {t('employees.list.importModal.instructions')}
                        </p>
                        <ul className="ml-1 list-disc list-inside space-y-1 text-slate-600">
                            <li dangerouslySetInnerHTML={{ __html: t('employees.list.importModal.instruction1') }}>
                            </li>
                            <li>
                                {t('employees.list.importModal.instruction2')}
                            </li>
                            <li>
                                {t('employees.list.importModal.instruction3')}
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-2 font-semibold text-slate-800">
                            {t('employees.list.importModal.rolesTitle')}
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 font-semibold text-slate-700">
                                    <tr>
                                        <th className="border-r border-slate-200 px-3 py-2">
                                            {t('employees.list.importModal.csvValue')}
                                        </th>
                                        <th className="px-3 py-2">
                                            {t('employees.list.importModal.systemRole')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    <tr>
                                        <td className="border-r border-slate-200 px-3 py-2 font-mono text-emerald-600">
                                            employee
                                        </td>
                                        <td className="px-3 py-2">
                                            {t('common.roles.employee')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-r border-slate-200 px-3 py-2 font-mono text-blue-600">
                                            hr
                                        </td>
                                        <td className="px-3 py-2">
                                            {t('common.roles.hr')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-r border-slate-200 px-3 py-2 font-mono text-purple-600">
                                            admin
                                        </td>
                                        <td className="px-3 py-2">
                                            {t('common.roles.admin')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="mt-2 flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                    >
                        <Icon.Download size={16} /> {t('employees.list.importModal.downloadTemplate')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('employees.list.importModal.fileLabel')}
                        </label>
                        <div className="relative flex items-center gap-3">
                            <label className="flex cursor-pointer items-center justify-center rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                                <span>{t('employees.list.importModal.chooseFile')}</span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="sr-only"
                                />
                            </label>
                            <span className="truncate text-sm text-slate-500">
                                {file ? file.name : t('employees.list.importModal.noFileSelected')}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('employees.list.importModal.tempPasswordLabel')}
                        </label>
                        <input
                            type="text"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-emerald-500 md:text-sm"
                            placeholder={t('employees.list.importModal.tempPasswordPlaceholder')}
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            {t('employees.list.importModal.tempPasswordHint')}
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {isLoading ? t('employees.list.importModal.loading') : t('employees.list.importModal.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ImportResultModal = ({ isOpen, onClose, results }) => {
    const { t } = useTranslation();
    if (!isOpen || !results) return null;

    const hasErrors = results.failedCount > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-2xl">
                <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                                {t('employees.list.importResult.title')}
                            </h3>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {t('employees.list.importResult.subtitle')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="-mr-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <Icon.X />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-5 sm:p-6">
                    <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-800">
                        <div className="flex items-start gap-3">
                            <Icon.AlertCircle className="flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">
                                    {t('employees.list.importResult.infoTitle')}
                                </h4>
                                <p className="mt-1 text-sm">
                                    {t('employees.list.importResult.infoText')}{' '}
                                    <code className="rounded bg-blue-100 px-1 py-0.5 font-mono font-bold">
                                        WorkNest123!
                                    </code>
                                </p>
                                <p className="mt-1 text-xs text-blue-600">
                                    {t('employees.list.importResult.infoHint')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                            <div className="text-2xl font-bold text-slate-700">
                                {results.processed}
                            </div>
                            <div className="text-xs font-semibold uppercase text-slate-500">
                                {t('employees.list.importResult.processed')}
                            </div>
                        </div>
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-600">
                                {results.created}
                            </div>
                            <div className="text-xs font-semibold uppercase text-emerald-600">
                                {t('employees.list.importResult.created')}
                            </div>
                        </div>
                        <div
                            className={`rounded-lg border p-4 text-center ${
                                hasErrors
                                    ? 'border-red-100 bg-red-50'
                                    : 'border-slate-100 bg-slate-50'
                            }`}
                        >
                            <div
                                className={`text-2xl font-bold ${
                                    hasErrors
                                        ? 'text-red-600'
                                        : 'text-slate-700'
                                }`}
                            >
                                {results.failedCount}
                            </div>
                            <div
                                className={`text-xs font-semibold uppercase ${
                                    hasErrors
                                        ? 'text-red-600'
                                        : 'text-slate-500'
                                }`}
                            >
                                {t('employees.list.importResult.errors')}
                            </div>
                        </div>
                    </div>

                    {hasErrors && (
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 font-semibold text-slate-800">
                                <Icon.AlertCircle /> {t('employees.list.importResult.errorDetails')}
                            </h4>
                            <div className="overflow-x-auto rounded-lg border border-red-100 bg-red-50">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-red-100/50 font-semibold text-red-800">
                                        <tr>
                                            <th className="px-4 py-2">
                                                {t('employees.list.importResult.row')}
                                            </th>
                                            <th className="px-4 py-2">
                                                {t('employees.list.importResult.email')}
                                            </th>
                                            <th className="px-4 py-2">{t('employees.list.importResult.error')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-100 text-red-700">
                                        {results.failedSamples.map(
                                            (fail, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2">
                                                        {fail.row}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {fail.email || '-'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {fail.message}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                                {results.failedCount >
                                    results.failedSamples.length && (
                                    <div className="bg-red-100/30 px-4 py-2 text-center text-xs italic text-red-600">
                                        {t('employees.list.importResult.moreErrors', { count: results.failedCount - results.failedSamples.length })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-100 p-4 sm:flex sm:justify-end">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto"
                    >
                        {t('employees.list.importResult.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="animate-slide-up fixed bottom-6 right-6 z-50">
            <div
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
                    type === 'success'
                        ? 'border-emerald-500/20 bg-emerald-600 text-white'
                        : 'border-red-500/20 bg-red-600 text-white'
                }`}
            >
                <Icon.Check />
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

export default function EmployeeList() {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { user: currentUser, loading: authLoading } = useAuth();
    const [changingRole, setChangingRole] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [toast, setToast] = useState(null);
    const [importModalOpen, setImportModalOpen] = useState(false); // Used for RESULTS
    const [importFormOpen, setImportFormOpen] = useState(false); // Used for FORM
    const [importResults, setImportResults] = useState(null);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        if (authLoading || !currentUser || !currentUser.company) {
            setLoading(false);
            return;
        }

        try {
            if (currentUser.role !== 'admin') {
                setError(t('employees.list.noPermissions'));
                setLoading(false);
                return;
            }

            const usersRes = await api.get('/users');
            setUsers(usersRes.data.users);
            setFilteredUsers(usersRes.data.users);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            if (err.response?.status === 403) {
                setError(t('employees.list.noPermissions'));
            } else if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(t('employees.list.error'));
            }
            setLoading(false);
        }
    }, [authLoading, currentUser, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (u) =>
                        u.username.toLowerCase().includes(query) ||
                        u.email.toLowerCase().includes(query) ||
                        u.role.toLowerCase().includes(query),
                ),
            );
        }
    }, [searchQuery, users]);

    const handleRoleChange = async (newRole) => {
        if (!selectedUser) return;

        setChangingRole(selectedUser._id);
        try {
            await api.patch(`/users/${selectedUser._id}/role`, {
                role: newRole,
            });
            await fetchData();
            setModalOpen(false);
            setToast({
                message: t('employees.list.toasts.roleSuccess'),
                type: 'success',
            });
        } catch (err) {
            console.error('Error changing role:', err);
            setToast({
                message: err.response?.data?.message || t('employees.list.toasts.roleError'),
                type: 'error',
            });
        } finally {
            setChangingRole(null);
        }
    };



    const handleImportSubmit = async (file, password) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        try {
            setLoading(true);
            const res = await api.post('/users/import-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setImportResults(res.data);
            setImportFormOpen(false);
            setImportModalOpen(true);
            
            if (res.data.created > 0) {
                 fetchData();
            }

        } catch (err) {
            console.error('CSV Import error:', err);
            const msg = err.response?.data?.message || t('employees.list.toasts.importError');
            setToast({
                message: msg,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-600 text-white border border-purple-700/20';
            case 'hr':
                return 'bg-blue-600 text-white border border-blue-700/20';
            case 'employee':
                return 'bg-slate-600 text-white border border-slate-700/20';
            default:
                return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    const getRoleLabel = (role) => {
        return t(`common.roles.${role}`);
    };

    if (loading) {
        return <LoadingScreen message={t('employees.loadingDetails')} />;
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md rounded-xl border border-red-200/50 bg-white px-6 py-8 shadow-lg">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-red-50 p-3 text-red-600">
                            <Icon.AlertCircle />
                        </div>
                    </div>
                    <div className="mb-2 text-center text-xl font-semibold text-slate-900">
                        {t('common.errorOccurred')}
                    </div>
                    <div className="mb-6 text-center text-sm text-slate-600">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
                    >
                        {t('employees.list.backToDashboard')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 select-none">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <Icon.ArrowLeft />
                            </button>
                            <div className="h-7 w-px bg-slate-200"></div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">
                                    {t('employees.list.title')}
                                </h1>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {t('employees.list.userCount', { count: filteredUsers.length })}
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                            {currentUser?.role === 'admin' && (
                                <button
                                    onClick={() => setImportFormOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 sm:w-auto"
                                >
                                    <Icon.Upload />
                                    <span>{t('employees.list.importButton')}</span>
                                </button>
                            )}
                            <div className="relative w-full sm:w-auto">
                                <input
                                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-base shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 md:w-72 md:text-sm"
                                    placeholder={t('employees.list.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Icon.Search />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                <Icon.Users />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                            {users.length}
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-500">
                            {t('employees.list.stats.all')}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                <Icon.Briefcase />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-blue-600 sm:text-3xl">
                            {users.filter((u) => u.role === 'hr').length}
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-500">
                            {t('employees.list.stats.hr')}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                                <Icon.Shield />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-purple-600 sm:text-3xl">
                            {users.filter((u) => u.role === 'admin').length}
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-500">
                            {t('employees.list.stats.admin')}
                        </div>
                    </div>
                </div>

                <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
                    <table className="w-full">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    {t('employees.list.table.user')}
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    {t('employees.list.table.email')}
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    {t('employees.list.table.role')}
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    {t('employees.list.table.createdAt')}
                                </th>
                                {currentUser?.role === 'admin' && (
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                                        {t('employees.list.table.actions')}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user._id}
                                    className="cursor-pointer transition-colors hover:bg-slate-50"
                                    onClick={() =>
                                        navigate(`/employees/${user._id}`)
                                    }
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-base font-semibold text-white">
                                                {user.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">
                                                    {user.username}
                                                </div>
                                                {user._id ===
                                                    currentUser?._id && (
                                                    <div className="text-xs font-medium text-emerald-600">
                                                        {t('common.itIsYou')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                                        >
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(
                                            user.createdAt,
                                        ).toLocaleDateString(i18n.language === 'pl' ? 'pl-PL' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    {currentUser?.role === 'admin' && (
                                        <td
                                            className="px-6 py-4 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {user._id === currentUser?._id ? (
                                                <div className="text-xs text-slate-400">
                                                    {t('employees.list.cannotChangeOwnRole')}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setModalOpen(true);
                                                    }}
                                                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                                                >
                                                    {t('employees.list.changeRole')}
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="mb-3 text-5xl">🔍</div>
                            <div className="text-base font-semibold text-slate-900">
                                {t('common.noResults')}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                                {t('common.tryDifferentSearch')}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 md:hidden">
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                            onClick={() => navigate(`/employees/${user._id}`)}
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-base font-semibold text-white">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {user.username}
                                        </div>
                                        {user._id === currentUser?._id && (
                                            <div className="text-xs font-medium text-emerald-600">
                                                {t('common.itIsYou')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                                >
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>

                            <div className="space-y-2 border-t border-slate-100 pt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        {t('common.email')}:
                                    </span>
                                    <span className="ml-2 truncate font-medium text-slate-700 max-w-48">
                                        {user.email}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        {t('employees.list.table.createdAt')}:
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {new Date(
                                            user.createdAt,
                                        ).toLocaleDateString(i18n.language === 'pl' ? 'pl-PL' : 'en-US')}
                                    </span>
                                </div>
                            </div>

                            {currentUser?.role === 'admin' &&
                                user._id !== currentUser?._id && (
                                    <div className="mt-3 border-t border-slate-100 pt-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUser(user);
                                                setModalOpen(true);
                                            }}
                                            className="w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                                        >
                                            {t('employees.list.changeRole')}
                                        </button>
                                    </div>
                                )}

                            {currentUser?.role === 'admin' &&
                                user._id === currentUser?._id && (
                                    <div className="mt-3 border-t border-slate-100 pt-3 text-center text-xs text-slate-400">
                                        {t('employees.list.cannotChangeOwnRole')}
                                    </div>
                                )}
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white py-16 text-center">
                            <div className="mb-3 text-5xl">🔍</div>
                            <div className="text-base font-semibold text-slate-900">
                                {t('common.noResults')}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                                {t('common.tryDifferentSearch')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RoleChangeModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                currentRole={selectedUser?.role}
                onConfirm={handleRoleChange}
                isChanging={changingRole === selectedUser?._id}
            />

            <ImportModal
                isOpen={importFormOpen}
                onClose={() => setImportFormOpen(false)}
                onImport={handleImportSubmit}
                isLoading={loading}
            />

            <ImportResultModal 
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                results={importResults}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <style>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}