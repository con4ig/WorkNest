import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

const Icon = {
    ArrowLeft: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    ),
    Search: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
        </svg>
    ),
    Check: () => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    X: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    ),
    Users: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
    ),
    Shield: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    Briefcase: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    AlertCircle: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
        </svg>
    ),
};

// Modal komponent do zmiany roli
const RoleChangeModal = ({ isOpen, onClose, user, currentRole, onConfirm, isChanging }) => {
    const [selectedRole, setSelectedRole] = useState(currentRole);

    useEffect(() => {
        setSelectedRole(currentRole);
    }, [currentRole, isOpen]);

    if (!isOpen) return null;

    const roles = [
        { value: 'employee', label: 'Pracownik', icon: <Icon.Briefcase />, color: 'gray', description: 'Podstawowe uprawnienia użytkownika' },
        { value: 'hr', label: 'HR Manager', icon: <Icon.Users />, color: 'blue', description: 'Zarządzanie pracownikami i urlopami' },
        { value: 'admin', label: 'Administrator', icon: <Icon.Shield />, color: 'purple', description: 'Pełen dostęp do systemu' },
    ];

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'border-purple-200 bg-purple-50 text-purple-700';
            case 'hr': return 'border-blue-200 bg-blue-50 text-blue-700';
            default: return 'border-gray-200 bg-gray-50 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Zmień rolę użytkownika</h3>
                        <p className="mt-1 text-sm text-gray-500">{user?.username}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <Icon.X />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="space-y-3">
                        {roles.map((role) => (
                            <button
                                key={role.value}
                                onClick={() => setSelectedRole(role.value)}
                                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                                    selectedRole === role.value
                                        ? getRoleColor(role.value) + ' ring-2 ring-offset-2 ' + (role.value === 'admin' ? 'ring-purple-500' : role.value === 'hr' ? 'ring-blue-500' : 'ring-gray-500')
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`rounded-lg p-2 ${selectedRole === role.value ? '' : 'bg-gray-100'}`}>
                                        {role.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{role.label}</span>
                                            {selectedRole === role.value && (
                                                <Icon.Check />
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs opacity-75">{role.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedRole !== currentRole && (
                        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            <Icon.AlertCircle />
                            <p>Ta zmiana zostanie zastosowana natychmiast i może wpłynąć na uprawnienia użytkownika.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-gray-100 p-6">
                    <button
                        onClick={onClose}
                        disabled={isChanging}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={() => onConfirm(selectedRole)}
                        disabled={isChanging || selectedRole === currentRole}
                        className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isChanging ? 'Zmieniam...' : 'Potwierdź zmianę'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Toast notification
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${
                type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}>
                <Icon.Check />
                <span className="font-medium">{message}</span>
            </div>
        </div>
    );
};

export default function EmployeeList() {
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
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        if (authLoading || !currentUser || !currentUser.company) {
            setLoading(false);
            return;
        }

        try {
            if (currentUser.role !== 'admin') {
                setError('Brak uprawnień do przeglądania tej strony');
                setLoading(false);
                return;
            }

            const usersRes = await axios.get('/api/users', {
                withCredentials: true,
            });
            setUsers(usersRes.data.users);
            setFilteredUsers(usersRes.data.users);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            if (err.response?.status === 403) {
                setError('Brak uprawnień do przeglądania tej strony');
            } else if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Błąd ładowania danych');
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
            await axios.patch(
                `/api/users/${selectedUser._id}/role`,
                { role: newRole },
                { withCredentials: true },
            );
            await fetchData();
            setModalOpen(false);
            setToast({ message: 'Rola została pomyślnie zmieniona', type: 'success' });
        } catch (err) {
            console.error('Error changing role:', err);
            setToast({ message: err.response?.data?.message || 'Błąd zmiany roli', type: 'error' });
        } finally {
            setChangingRole(null);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
            case 'hr':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'employee':
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'hr':
                return 'HR Manager';
            case 'employee':
                return 'Pracownik';
            default:
                return role;
        }
    };

    if (loading) {
        return <LoadingScreen message="Ładowanie listy pracowników..." />;
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white px-6 py-8 shadow-xl">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-red-100 p-3">
                            <Icon.AlertCircle />
                        </div>
                    </div>
                    <div className="mb-2 text-center text-xl font-semibold text-gray-900">Wystąpił błąd</div>
                    <div className="mb-6 text-center text-sm text-gray-600">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 font-medium text-white shadow-sm transition-all hover:shadow-md"
                    >
                        Powrót do Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-white/50 bg-white/80 shadow-sm backdrop-blur-lg">
                <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-slate-600 transition-all hover:bg-slate-100"
                            >
                                <Icon.ArrowLeft />
                                <span className="font-medium">Powrót</span>
                            </button>
                            <div className="hidden h-8 w-px bg-slate-200 md:block"></div>
                            <div>
                                <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                                    <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 text-white shadow-sm">
                                        <Icon.Users />
                                    </div>
                                    Zarządzanie Zespołem
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    {filteredUsers.length} {filteredUsers.length === 1 ? 'użytkownik' : 'użytkowników'}
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 md:w-80"
                                placeholder="Szukaj użytkownika..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Icon.Search />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
                {/* Stats cards */}
                <div className="mb-8 grid grid-cols-3 gap-4">
                    <div className="group rounded-2xl border border-white bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-slate-100 p-2 transition-colors group-hover:bg-slate-200">
                                <Icon.Users />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{users.length}</div>
                        <div className="mt-1 text-sm text-slate-500">Wszyscy</div>
                    </div>
                    <div className="group rounded-2xl border border-white bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-blue-100 p-2 transition-colors group-hover:bg-blue-200">
                                <Icon.Briefcase />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{users.filter((u) => u.role === 'hr').length}</div>
                        <div className="mt-1 text-sm text-slate-500">HR Managers</div>
                    </div>
                    <div className="group rounded-2xl border border-white bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-purple-100 p-2 transition-colors group-hover:bg-purple-200">
                                <Icon.Shield />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-purple-600">{users.filter((u) => u.role === 'admin').length}</div>
                        <div className="mt-1 text-sm text-slate-500">Administratorzy</div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-hidden rounded-2xl border border-white bg-white shadow-sm md:block">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Użytkownik
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Rola
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Data utworzenia
                                </th>
                                {currentUser?.role === 'admin' && (
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                                        Akcje
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user._id}
                                    className="cursor-pointer transition-colors hover:bg-slate-50"
                                    onClick={() => navigate(`/employees/${user._id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-bold text-white shadow-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{user.username}</div>
                                                {user._id === currentUser?._id && (
                                                    <div className="text-xs font-medium text-emerald-600">To Ty</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString('pl-PL', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    {currentUser?.role === 'admin' && (
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            {user._id === currentUser?._id ? (
                                                <div className="text-xs text-slate-400">Nie możesz zmienić własnej roli</div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setModalOpen(true);
                                                    }}
                                                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-sm"
                                                >
                                                    Zmień rolę
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="mb-4 text-6xl">🔍</div>
                            <div className="text-lg font-semibold text-slate-900">Brak wyników</div>
                            <div className="mt-2 text-sm text-slate-500">Spróbuj zmienić zapytanie wyszukiwania</div>
                        </div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            className="cursor-pointer rounded-2xl border border-white bg-white p-5 shadow-sm transition-all hover:shadow-md"
                            onClick={() => navigate(`/employees/${user._id}`)}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-sm">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{user.username}</div>
                                        {user._id === currentUser?._id && (
                                            <div className="text-xs font-medium text-emerald-600">To Ty</div>
                                        )}
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>

                            <div className="space-y-2 border-t border-slate-100 pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Email:</span>
                                    <span className="ml-2 truncate font-medium text-slate-700">{user.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Utworzony:</span>
                                    <span className="font-medium text-slate-700">
                                        {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                    </span>
                                </div>
                            </div>

                            {currentUser?.role === 'admin' && user._id !== currentUser?._id && (
                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUser(user);
                                            setModalOpen(true);
                                        }}
                                        className="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100"
                                    >
                                        Zmień rolę
                                    </button>
                                </div>
                            )}

                            {currentUser?.role === 'admin' && user._id === currentUser?._id && (
                                <div className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
                                    Nie możesz zmienić własnej roli
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="mb-4 text-6xl">🔍</div>
                            <div className="text-lg font-semibold text-slate-900">Brak wyników</div>
                            <div className="mt-2 text-sm text-slate-500">Spróbuj zmienić zapytanie wyszukiwania</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
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

            {/* Toast */}
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
