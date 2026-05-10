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
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

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
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full"
                    >
                        {t('employees.list.backToDashboard')}
                    </Button>
                </div>
            </div>
        );
    }

    const stats = [
        {
            id: 1,
            title: t('employees.list.stats.all'),
            value: users.length,
            icon: Users,
            color: 'text-primary',
        },
        {
            id: 2,
            title: t('employees.list.stats.hr'),
            value: users.filter((u) => u.role === 'hr').length,
            icon: Briefcase,
            color: 'text-blue-500',
        },
        {
            id: 3,
            title: t('employees.list.stats.admin'),
            value: users.filter((u) => u.role === 'admin').length,
            icon: Shield,
            color: 'text-purple-500',
        },
    ];

    return (
        <div className="flex h-full select-none flex-col space-y-6 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2">
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="mr-2 md:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {t('employees.list.title')}
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('employees.list.userCount', {
                            count: filteredUsers.length,
                        })}
                    </p>
                </div>
                
                 <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                    {currentUser?.role === 'admin' && (
                        <Button
                            variant="outline"
                            onClick={() => setImportFormOpen(true)}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            <span>{t('employees.list.importButton')}</span>
                        </Button>
                    )}
                     <div className="relative w-full sm:w-auto">
                        <input
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[250px]"
                            placeholder={t('employees.list.searchPlaceholder')}
                            aria-label={t('employees.list.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {stats.map((stat) => (
                    <Card
                        key={stat.id}
                        className="border-border bg-card shadow-sm transition-all hover:shadow-md"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight text-foreground">
                                <AnimatedNumber value={stat.value} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Employees List */}
            <Card className="border-border bg-card shadow-sm">
                 <CardHeader>
                    <CardTitle className="font-semibold text-foreground">
                        {t('employees.list.table.user')}
                    </CardTitle>
                     <CardDescription className="text-xs tracking-wide text-muted-foreground">
                        {t('employees.list.userCount', { count: filteredUsers.length })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="hidden md:block md:overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead className="border-b border-border bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('employees.list.table.user')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('employees.list.table.email')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('employees.list.table.role')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('employees.list.table.createdAt')}
                                    </th>
                                    {currentUser?.role === 'admin' && (
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                                        onClick={() => navigate(`/employees/${user._id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary shadow-sm transition-transform group-hover:scale-110">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground">
                                                        {user.username}
                                                    </div>
                                                    {user._id === currentUser?._id && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
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
                                                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString(
                                                i18n.language === 'pl' ? 'pl-PL' : 'en-US',
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </td>
                                        {currentUser?.role === 'admin' && (
                                            <td
                                                className="px-6 py-4 text-right"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {user._id === currentUser?._id ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {t('employees.list.cannotChangeOwnRole')}
                                                    </span>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setModalOpen(true);
                                                        }}
                                                    >
                                                        {t('employees.list.changeRole')}
                                                    </Button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                             <div className="py-16 text-center">
                                <div className="mb-3 text-4xl">🔍</div>
                                <div className="text-base font-medium text-foreground">
                                    {t('common.noResults')}
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {t('common.tryDifferentSearch')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile View */}
                    <div className="block md:hidden">
                        <div className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="p-4 transition-colors hover:bg-muted/50"
                                    onClick={() => navigate(`/employees/${user._id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                             <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">
                                                    {user.username}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                         <span
                                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {getRoleLabel(user.role)}
                                        </span>
                                    </div>
                                    {currentUser?.role === 'admin' && user._id !== currentUser?._id && (
                                        <div className="mt-3 flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(user);
                                                    setModalOpen(true);
                                                }}
                                            >
                                                {t('employees.list.changeRole')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                         {filteredUsers.length === 0 && (
                             <div className="py-16 text-center">
                                <div className="mb-3 text-4xl">🔍</div>
                                <div className="text-base font-medium text-foreground">
                                    {t('common.noResults')}
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {t('common.tryDifferentSearch')}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

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
