import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Search,
    Users,
    Briefcase,
    Shield,
    Upload,
    AlertCircle,
    Check,
} from 'lucide-react';
import api from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/ui/Toast';
import RoleChangeModal from '../components/employees/RoleChangeModal';
import ImportModal from '../components/employees/ImportModal';
import ImportResultModal from '../components/employees/ImportResultModal';

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
    }, [authLoading, currentUser, navigate, t]);

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
                message:
                    err.response?.data?.message ||
                    t('employees.list.toasts.roleError'),
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
                await fetchData();
            }
        } catch (err) {
            console.error('CSV Import error:', err);
            const msg =
                err.response?.data?.message ||
                t('employees.list.toasts.importError');
            setToast({
                message: msg,
                type: 'error',
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
                            <AlertCircle className="h-6 w-6" />
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
        <div className="min-h-screen select-none bg-slate-50">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="h-7 w-px bg-slate-200"></div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">
                                    {t('employees.list.title')}
                                </h1>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {t('employees.list.userCount', {
                                        count: filteredUsers.length,
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                            {currentUser?.role === 'admin' && (
                                <button
                                    onClick={() => setImportFormOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-slate-50 hover:text-emerald-600 sm:w-auto"
                                >
                                    <Upload className="h-5 w-5" />
                                    <span>
                                        {t('employees.list.importButton')}
                                    </span>
                                </button>
                            )}
                            <div className="relative w-full sm:w-auto">
                                <input
                                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-base shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 md:w-72 md:text-sm"
                                    placeholder={t(
                                        'employees.list.searchPlaceholder',
                                    )}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search className="h-5 w-5" />
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
                                <Users className="h-5 w-5" />
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
                                <Briefcase className="h-5 w-5" />
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
                                <Shield className="h-5 w-5" />
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
                                    <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-600">
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
                                        ).toLocaleDateString(
                                            i18n.language === 'pl'
                                                ? 'pl-PL'
                                                : 'en-US',
                                            {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            },
                                        )}
                                    </td>
                                    {currentUser?.role === 'admin' && (
                                        <td
                                            className="px-6 py-4 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {user._id === currentUser?._id ? (
                                                <div className="text-xs text-slate-400">
                                                    {t(
                                                        'employees.list.cannotChangeOwnRole',
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setModalOpen(true);
                                                    }}
                                                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                                                >
                                                    {t(
                                                        'employees.list.changeRole',
                                                    )}
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
                                    <span className="ml-2 max-w-48 truncate font-medium text-slate-700">
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
                                        ).toLocaleDateString(
                                            i18n.language === 'pl'
                                                ? 'pl-PL'
                                                : 'en-US',
                                        )}
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
                                        {t(
                                            'employees.list.cannotChangeOwnRole',
                                        )}
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
        </div>
    );
}
