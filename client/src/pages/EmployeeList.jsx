import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Icon = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/>
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )
};

export default function EmployeeList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [changingRole, setChangingRole] = useState(null); // ID usera którego role zmieniamy
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Pobierz zalogowanego usera
      const meRes = await axios.get('/api/auth/me', { withCredentials: true });
      setCurrentUser(meRes.data);

      // Pobierz listę wszystkich userów
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

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          u => 
            u.username.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query) ||
            u.role.toLowerCase().includes(query)
        )
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
      try {
        await axios.patch(
          `/api/users/${userId}/role`,
          { role: newRole },
          { withCredentials: true }
        );
        
        // Refresh list
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
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'hr': return 'bg-blue-100 text-blue-700';
      case 'employee': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Administrator';
      case 'hr': return 'HR Manager';
      case 'employee': return 'Pracownik';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Ładowanie...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl shadow-sm">
          <div className="font-semibold mb-2">Błąd</div>
          <div>{error}</div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Powrót do Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
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

            {/* Search */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 gap-2">
                <Icon.Search />
                <input 
                  className="bg-transparent outline-none text-sm w-64" 
                  placeholder="Szukaj użytkownika..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">Wszyscy</div>
            <div className="text-2xl font-bold mt-2">{users.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">HR Managers</div>
            <div className="text-2xl font-bold mt-2 text-blue-600">
              {users.filter(u => u.role === 'hr').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">Administratorzy</div>
            <div className="text-2xl font-bold mt-2 text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Użytkownik
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rola
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data utworzenia
                </th>
                {currentUser?.role === 'admin' && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Akcje
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  {/* User info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        {user._id === currentUser?.id && (
                          <div className="text-xs text-emerald-600 font-medium">To Ty</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>

                  {/* Role badge */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  {/* Created at */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>

                  {/* Actions (only for admin) */}
                  {currentUser?.role === 'admin' && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {changingRole === user._id ? (
                          <div className="text-xs text-gray-500">Zmiana...</div>
                        ) : user._id === currentUser?.id ? (
                          <div className="text-xs text-gray-400">Nie możesz zmienić własnej roli</div>
                        ) : (
                          <div className="relative group">
                            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-emerald-600 border border-gray-200 hover:border-emerald-600 rounded-lg transition-colors">
                              Zmień rolę ▾
                            </button>
                            
                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                {['employee', 'hr', 'admin'].map(role => (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleChange(user._id, role)}
                                    disabled={user.role === role}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                      user.role === role ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                                    }`}
                                  >
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
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg font-medium">Brak wyników</div>
              <div className="text-sm mt-2">Spróbuj zmienić zapytanie wyszukiwania</div>
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