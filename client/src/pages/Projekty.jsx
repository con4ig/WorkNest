import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Wystarczy zdefiniować ikony, które będą potrzebne na tej stronie
const Icon = {
    Search: () => (
        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" /></svg>
    ),
    Filter: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M7 12h10M10 18h4" /></svg>
    ),
    Sort: () => (
        <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 16l5-5 5 5" /></svg>
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

    // Pobycie projektów przy pierwszym renderowaniu i zmianie filtru
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
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Przegląd Projektów 📁</h1>
                <p className="text-gray-500 mt-1">Lista wszystkich projektów, do których masz dostęp.</p>
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
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 4v6h-6M1 20v-6h6M3.27 12a9 9 0 0 1 16.96 0" /></svg> Odśwież
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