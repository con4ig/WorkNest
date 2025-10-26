import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Icon = {
    ArrowLeft: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    ),
    Search: () => (
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
        </svg>
    ),
    Check: () => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    ChevronDown: () => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
        </svg>
    ),
};

export default function EmployeeList() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [changingRole, setChangingRole] = useState(null);
    const [showRoleMenu, setShowRoleMenu] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const meRes = await axios.get('/api/auth/me', { withCredentials: true });
            setCurrentUser(meRes.data);

            if (meRes.data.role !== 'admin') {
                setError('Brak uprawnień do przeglądania tej strony');
                setLoading(false);
                return;
            }

            const usersRes = await axios.get('/api/users', { withCredentials: true });
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
    };

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

    const handleRoleChange = async (userId, newRole) => {
        if (currentUser.role !== 'admin') {
            alert('Tylko administrator może zmieniać role');
            return;
        }

        if (window.confirm(`Czy na pewno chcesz zmienić rolę tego użytkownika na "${newRole}"?`)) {
            setChangingRole(userId);
            setShowRoleMenu(null);
            try {
                await axios.patch(`/api/users/${userId}/role`, { role: newRole }, { withCredentials: true });
                await fetchData();
                alert('Rola została zmieniona pomyślnie');
            } catch (err) {
                console.error('Error changing role:', err);
                alert(err.response?.data?.message || 'Błąd zmiany roli');
            } finally {
                setChangingRole(null);
            }
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700';
            case 'hr':
                return 'bg-blue-100 text-blue-700';
            case 'employee':
                return 'bg-gray-100 text-gray-700';
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
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                    <div className="text-lg text-gray-600">Ładowanie...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-6 py-6 text-red-700 shadow-sm">
                    <div className="mb-2 text-lg font-semibold">Błąd</div>
                    <div className="text-sm">{error}</div>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 sm:w-auto">
                        Powrót do Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-6">
            {/* Header - Responsywny */}
            <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="px-4 py-4 md:px-8 md:py-6">
                    {/* Mobile header */}
                    <div className="flex flex-col gap-3 md:hidden">
                        <div className="flex items-center justify-between">
                            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100">
                                <Icon.ArrowLeft />
                                <span className="font-medium">Powrót</span>
                            </button>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Zarządzanie Zespołem</h1>
                            <p className="text-sm text-gray-500">
                                {filteredUsers.length} {filteredUsers.length === 1 ? 'użytkownik' : 'użytkowników'}
                            </p>
                        </div>
                        {/* Mobile search */}
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                            <Icon.Search />
                            <input className="w-full bg-transparent text-sm outline-none" placeholder="Szukaj..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden md:flex md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100">
                                <Icon.ArrowLeft />
                                <span>Powrót</span>
                            </button>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                                <h1 className="text-2xl font-bold">Zarządzanie Zespołem</h1>
                                <p className="text-sm text-gray-500">
                                    {filteredUsers.length} {filteredUsers.length === 1 ? 'użytkownik' : 'użytkowników'}
                                </p>
                            </div>
                        </div>

                        {/* Desktop search */}
                        <div className="relative">
                            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
                                <Icon.Search />
                                <input className="w-64 bg-transparent text-sm outline-none" placeholder="Szukaj użytkownika..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6 md:mx-auto md:max-w-7xl md:px-8 md:py-8">
                {/* Stats cards - Responsywne */}
                <div className="mb-6 grid grid-cols-3 gap-3 md:mb-8 md:gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                        <div className="text-xs uppercase text-gray-500">Wszyscy</div>
                        <div className="mt-2 text-xl font-bold md:text-2xl">{users.length}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                        <div className="text-xs uppercase text-gray-500">HR</div>
                        <div className="mt-2 text-xl font-bold text-blue-600 md:text-2xl">{users.filter((u) => u.role === 'hr').length}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                        <div className="text-xs uppercase text-gray-500">Admini</div>
                        <div className="mt-2 text-xl font-bold text-purple-600 md:text-2xl">{users.filter((u) => u.role === 'admin').length}</div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden rounded-xl bg-white shadow-sm">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Użytkownik</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Rola</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Data utworzenia</th>
                                {currentUser?.role === 'admin' && (
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Akcje</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="transition-colors hover:bg-gray-50" onClick={() => navigate(`/employees/${user._id}`)} style={{ cursor: 'pointer' }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.username}</div>
                                                {user._id === currentUser?._id && (
                                                    <div className="text-xs font-medium text-emerald-600">To Ty</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    {currentUser?.role === 'admin' && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {changingRole === user._id ? (
                                                    <div className="text-xs text-gray-500">Zmiana...</div>
                                                ) : user._id === currentUser?._id ? (
                                                    <div className="text-xs text-gray-400">Nie możesz zmienić własnej roli</div>
                                                ) : (
                                                    <div className="group relative">
                                                        <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-600 hover:text-emerald-600">
                                                            Zmień rolę ▾
                                                        </button>
                                                        <div className="invisible absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                                                            <div className="py-1">
                                                                {['employee', 'hr', 'admin'].map((role) => (
                                                                    <button key={role} onClick={(e) => { e.stopPropagation(); handleRoleChange(user._id, role); }} disabled={user.role === role} className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${user.role === role ? 'cursor-not-allowed text-gray-400' : 'text-gray-700'}`}>
                                                                        <span>{getRoleLabel(role)}</span>
                                                                        {user.role === role && <Icon.Check />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="py-16 text-center text-gray-500">
                            <div className="mb-4 text-4xl">🔍</div>
                            <div className="text-lg font-medium">Brak wyników</div>
                            <div className="mt-2 text-sm">Spróbuj zmienić zapytanie wyszukiwania</div>
                        </div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {filteredUsers.map((user) => (
                        <div key={user._id} className="rounded-xl bg-white p-4 shadow-sm" onClick={() => navigate(`/employees/${user._id}`)}>
                            {/* Header karty */}
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-sm">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{user.username}</div>
                                        {user._id === currentUser?._id && (
                                            <div className="text-xs font-medium text-emerald-600">To Ty</div>
                                        )}
                                    </div>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>

                            {/* Szczegóły */}
                            <div className="space-y-2 border-t pt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Email:</span>
                                    <span className="font-medium text-gray-700 truncate ml-2">{user.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Utworzony:</span>
                                    <span className="font-medium text-gray-700">
                                        {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                    </span>
                                </div>
                            </div>

                            {/* Akcje - Mobile */}
                            {currentUser?.role === 'admin' && user._id !== currentUser?._id && (
                                <div className="mt-4 border-t pt-3">
                                    {changingRole === user._id ? (
                                        <div className="text-center text-sm text-gray-500">Zmiana roli...</div>
                                    ) : (
                                        <button onClick={(e) => { e.stopPropagation(); setShowRoleMenu(showRoleMenu === user._id ? null : user._id); }} className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-emerald-600 hover:text-emerald-600 flex items-center justify-between">
                                            <span>Zmień rolę</span>
                                            <Icon.ChevronDown />
                                        </button>
                                    )}

                                    {/* Dropdown menu mobile */}
                                    {showRoleMenu === user._id && (
                                        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                                            {['employee', 'hr', 'admin'].map((role) => (
                                                <button key={role} onClick={(e) => { e.stopPropagation(); handleRoleChange(user._id, role); }} disabled={user.role === role} className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors ${user.role === role ? 'cursor-not-allowed bg-white text-gray-400' : 'text-gray-700 hover:bg-white'}`}>
                                                    <span>{getRoleLabel(role)}</span>
                                                    {user.role === role && <Icon.Check />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentUser?.role === 'admin' && user._id === currentUser?._id && (
                                <div className="mt-4 border-t pt-3 text-center text-xs text-gray-400">
                                    Nie możesz zmienić własnej roli
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="py-16 text-center text-gray-500">
                            <div className="mb-4 text-4xl">🔍</div>
                            <div className="text-lg font-medium">Brak wyników</div>
                            <div className="mt-2 text-sm">Spróbuj zmienić zapytanie wyszukiwania</div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} WorkNest — All rights reserved
                </div>
            </div>
        </div>
    );
}