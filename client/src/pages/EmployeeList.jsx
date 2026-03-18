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
                return 'bg-primary/10 text-primary border-primary/20';
            case 'hr':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'employee':
                return 'bg-muted text-muted-foreground border-border';
            default:
                return 'bg-muted/50 text-muted-foreground border-border/50';
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
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-xl border border-destructive/50 bg-card px-6 py-8 shadow-lg">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mb-2 text-center text-xl font-semibold text-foreground">
                        {t('common.errorOccurred')}
                    </div>
                    <div className="mb-6 text-center text-sm text-muted-foreground">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                        {t('employees.list.backToDashboard')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen select-none bg-background">
            <div className="sticky top-0 z-20 border-b border-border bg-background/80 shadow-sm backdrop-blur-xl transition-all">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="group flex items-center justify-center rounded-xl border border-border bg-card p-2.5 text-foreground shadow-sm transition-all hover:bg-secondary hover:shadow-md"
                            >
                                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            </button>
                            <div className="h-10 w-px bg-border/60"></div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {t('employees.list.title')}
                                </h1>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('employees.list.userCount', {
                                        count: filteredUsers.length,
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                            {currentUser?.role === 'admin' && (
                                <button
                                    onClick={() => setImportFormOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-secondary hover:text-primary active:scale-[0.98] sm:w-auto"
                                >
                                    <Upload className="h-5 w-5" />
                                    <span>
                                        {t('employees.list.importButton')}
                                    </span>
                                </button>
                            )}
                            <div className="relative w-full sm:w-auto">
                                <input
                                    className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-11 pr-4 text-base shadow-sm ring-offset-background transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 md:w-80 md:text-sm text-foreground placeholder:text-muted-foreground"
                                    placeholder={t(
                                        'employees.list.searchPlaceholder',
                                    )}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Search className="h-4.5 w-4.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shadow-inner">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{t('employees.list.stats.all')}</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {users.length}
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500 shadow-inner">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{t('employees.list.stats.hr')}</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-blue-500 sm:text-4xl">
                            {users.filter((u) => u.role === 'hr').length}
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(users.filter((u) => u.role === 'hr').length / users.length) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-500 shadow-inner">
                                <Shield className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{t('employees.list.stats.admin')}</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-purple-500 sm:text-4xl">
                            {users.filter((u) => u.role === 'admin').length}
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(users.filter((u) => u.role === 'admin').length / users.length) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
                    <table className="w-full">
                        <thead className="border-b border-border bg-muted/50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t('employees.list.table.user')}
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t('employees.list.table.email')}
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t('employees.list.table.role')}
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t('employees.list.table.createdAt')}
                                </th>
                                {currentUser?.role === 'admin' && (
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {t('employees.list.table.actions')}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user._id}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() =>
                                        navigate(`/employees/${user._id}`)
                                    }
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary shadow-sm transition-transform group-hover:scale-110">
                                                {user.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground">
                                                    {user.username}
                                                </div>
                                                {user._id ===
                                                    currentUser?._id && (
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                        <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
                                                        {t('common.itIsYou')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-xs truncate px-6 py-4 text-sm text-muted-foreground">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                                        >
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                        {new Date(
                                            user.createdAt,
                                        ).toLocaleDateString(
                                            i18n.language === 'pl'
                                                ? 'pl-PL'
                                                : 'en-US',
                                            {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            },
                                        )}
                                    </td>
                                        <td
                                            className="px-6 py-5 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {user._id === currentUser?._id ? (
                                                <div className="text-xs font-medium text-muted-foreground/60">
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
                                                    className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm ring-offset-background transition-all hover:bg-secondary hover:shadow-md active:scale-95"
                                                >
                                                    {t(
                                                        'employees.list.changeRole',
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="mb-3 text-5xl">🔍</div>
                            <div className="text-base font-semibold text-foreground">
                                {t('common.noResults')}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                {t('common.tryDifferentSearch')}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 md:hidden">
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
                            onClick={() => navigate(`/employees/${user._id}`)}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary shadow-sm transition-transform group-hover:scale-110">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-foreground">
                                            {user.username}
                                        </div>
                                        {user._id === currentUser?._id && (
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
                                                {t('common.itIsYou')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold tracking-tight shadow-sm ${getRoleBadgeColor(user.role)}`}
                                >
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>

                            <div className="space-y-2 border-t border-border/50 pt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('common.email')}:
                                    </span>
                                    <span className="ml-2 max-w-48 truncate font-medium text-foreground">
                                        {user.email}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('employees.list.table.createdAt')}:
                                    </span>
                                    <span className="font-medium text-foreground">
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
                                    <div className="mt-3 border-t border-border/50 pt-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUser(user);
                                                setModalOpen(true);
                                            }}
                                            className="w-full rounded-lg border border-border bg-card py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary"
                                        >
                                            {t('employees.list.changeRole')}
                                        </button>
                                    </div>
                                )}

                            {currentUser?.role === 'admin' &&
                                user._id === currentUser?._id && (
                                    <div className="mt-3 border-t border-border/50 pt-3 text-center text-xs text-muted-foreground">
                                        {t(
                                            'employees.list.cannotChangeOwnRole',
                                        )}
                                    </div>
                                )}
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="rounded-lg border-2 border-dashed border-border bg-card py-16 text-center">
                            <div className="mb-3 text-5xl">🔍</div>
                            <div className="text-base font-semibold text-foreground">
                                {t('common.noResults')}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
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
