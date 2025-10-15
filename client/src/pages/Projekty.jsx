import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ListFilter, RefreshCcw} from 'lucide-react';

// Wystarczy zdefiniować ikony, które będą potrzebne na tej stronie
const Icon = {
    Search: () => (
       <Search className="w-5 h-5 text-gray-400" />
    ),
    Filter: () => (
        <ListFilter className="w-5 h-5 text-gray-400" />
    ),
    Refresh: () => (
        <RefreshCcw className="w-5 h-5 text-gray-400" />
    ),
    Trash: () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
),
  ArrowLeft: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  )
};

// Mapowanie statusów na kolory dla spójności wizualnej
const statusStyles = {
    pending: { text: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Oczekujący' },
    running: { text: 'text-blue-600', bg: 'bg-blue-100', label: 'W Trakcie' },
    completed: { text: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Ukończony' },
    'on-hold': { text: 'text-red-600', bg: 'bg-red-100', label: 'Wstrzymany' },
};

// Pomocnicza funkcja formatująca datę
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const API_BASE_URL = 'http://localhost:5500/api'; // Upewnij się, że URL jest poprawny

function Projekty() {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState(''); // Stan dla filtru statusu
    const [searchTerm, setSearchTerm] = useState(''); // Stan dla wyszukiwania
    const navigate = useNavigate();

    // Główna funkcja do ładowania projektów z backendu
    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Dodajemy filtr statusu do query stringa, jeśli jest ustawiony
            const statusQuery = filterStatus ? `status=${filterStatus}` : '';
            
            const response = await axios.get(`${API_BASE_URL}/projects?${statusQuery}`, {
                withCredentials: true,
            });
            setProjects(response.data.projects);
        } catch (err) {
            console.error('Błąd ładowania projektów:', err);
            // Przekierowanie do logowania, jeśli błąd to 401/403 (brak autoryzacji)
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            } else {
                setError('Nie udało się załadować listy projektów.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [role, setRole] = useState(null);
    useEffect(() => {
        const checkAuth = async () => {
        const res = await axios.get('/api/auth/me', { withCredentials: true });
        const { role } = res.data;

            setRole(role);
        };

  checkAuth();
}, [navigate]);

    const handleDelete = async (projectId) => {
  const confirm = window.confirm('Czy na pewno chcesz usunąć ten projekt?');
  if (!confirm) return;

  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Odśwież listę projektów lub usuń lokalnie
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } else {
      const data = await response.json();
      alert(`Błąd: ${data.message}`);
    }
  } catch (error) {
    alert('Wystąpił błąd podczas usuwania projektu');
    console.error(error);
  }
};

    // Pobieranie projektów przy pierwszym renderowaniu i zmianie filtru
    useEffect(() => {
        fetchProjects();
    }, [filterStatus]); // Zależność: uruchom ponownie, gdy zmieni się filtr statusu

    // Filtrowanie projektów po nazwie (na froncie)
    const filteredAndSearchedProjects = projects.filter(project => {
        // Filtr wyszukiwania
        const searchMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return searchMatch;
    });

    if (isLoading) {
        return <div className="p-8 text-center text-lg text-gray-500">Ładowanie projektów...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-lg text-red-600">Błąd: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 ">
<header className="bg-white shadow-sm sticky top-0 z-10 mb-8 rounded-2xl">
  <div className="max-w-8xl mx-auto px-8 py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon.ArrowLeft />
          <span>Dashboard</span>
        </button>
        <div className="h-8 w-px bg-gray-200"></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Przegląd Projektów 📁</h1>
          <p className="text-sm text-gray-500">Lista wszystkich projektów, do których masz dostęp.</p>
        </div>
      </div>
    </div>
  </div>
</header>

            <div className="bg-white rounded-xl shadow-lg p-6">
                
                {/* Panel kontrolny: Wyszukiwanie i Filtrowanie */}
                <div className="flex justify-between items-center mb-6 gap-4">
                    
                    {/* Wyszukiwanie */}
                    <div className="relative flex-grow max-w-sm">
                        <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 gap-2 border border-gray-200">
                            <Icon.Search />
                            <input 
                                className="bg-transparent outline-none text-sm w-full" 
                                placeholder="Wyszukaj po nazwie projektu..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Filtr statusu */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon.Filter />
                        <label htmlFor="filterStatus" className="font-medium">Status:</label>
                        <select
                            id="filterStatus"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer"
                        >
                            <option value="">Wszystkie</option>
                            <option value="pending">Oczekujący</option>
                            <option value="running">W Trakcie</option>
                            <option value="completed">Ukończony</option>
                            <option value="on-hold">Wstrzymany</option>
                        </select>
                    </div>

                    {/* Przycisk odświeżania */}
                    <button 
                        onClick={fetchProjects}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                         <RefreshCcw className="w-4 h-4" /> Odśwież
                    </button>

                </div>

                {/* Tabela Projektów */}
                <div className="overflow-x-auto">
                    {filteredAndSearchedProjects.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nazwa Projektu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Postęp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Termin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Przypisani
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Akcje
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAndSearchedProjects.map((project) => {
                                    const statusInfo = statusStyles[project.status] || statusStyles['pending'];
                                    
                                    // Pobieramy maksymalnie 3 przypisanych użytkowników do wyświetlenia
                                    const assignedDisplay = project.assignedUsers.slice(0, 3);
                                    const assignedCount = project.assignedUsers.length;

                                    return (
                                        <tr 
                                            key={project._id} 
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/projects/${project._id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{project.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                                        <div 
                                                            className="bg-emerald-600 h-2.5 rounded-full" 
                                                            style={{ width: `${project.progress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-900">{project.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(project.endDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex -space-x-2">
                                                    {assignedDisplay.map((user, index) => (
                                                        <div 
                                                            key={user._id} 
                                                            className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 border-2 border-white"
                                                            title={user.username}
                                                            style={{ zIndex: assignedCount - index }}
                                                        >
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {assignedCount > 3 && (
                                                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 border-2 border-white">
                                                            +{assignedCount - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        {(role === 'admin') && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // zapobiega przejściu do strony projektu
                                                        handleDelete(project._id);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Usuń projekt"
                                                >
                                                    <Icon.Trash />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                         <div className="text-center py-10 text-gray-500">
                            Nie znaleziono projektów spełniających kryteria.
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-8 pb-8 text-sm text-gray-400 text-center"> © {new Date().getFullYear()} WorkNest — All rights reserved </footer>
        </div>
    );
}

export default Projekty;