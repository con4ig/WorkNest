import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Używamy prostych ikon
const Icon = {
    Close: () => (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>),
    Add: () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>),
    Remove: () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>),
};

// Komponent Modala
export default function UserManagementModal({ project, onClose, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Lista ID użytkowników aktualnie przypisanych do projektu
    const assignedUserIds = project.assignedUsers.map(u => u._id);

    // Funkcja do wyszukiwania dostępnych użytkowników na backendzie
    const handleSearch = async () => {
        if (searchTerm.trim().length < 2) return;
        setLoadingSearch(true);
        setSearchError(null);
        try {
            const res = await axios.get(`/api/users?search=${searchTerm}`, { 
                withCredentials: true 
            });
            
            // Filtrujemy, aby nie pokazywać użytkowników już przypisanych
            const filteredUsers = res.data.users.filter(user => 
                !assignedUserIds.includes(user._id)
            );
            
            setAvailableUsers(filteredUsers);
        } catch (err) {
            console.error("Błąd podczas wyszukiwania użytkowników:", err);
            setSearchError("Błąd wyszukiwania użytkowników");
        } finally {
            setLoadingSearch(false);
        }
    };

    // Funkcja do dodawania/usuwania użytkownika z projektu
    const handleToggleUser = async (userId, action) => {
        setIsUpdating(true);
        try {
            const response = await axios.patch(`/api/projects/${project._id}/users`, {
                userId,
                action
            }, { 
                withCredentials: true 
            });
            
            // Call onUpdate with the updated project if available
            if (response.data.project) {
                onUpdate(response.data.project);
            } else {
                onUpdate(); // Fallback to regular update
            }
            
            // Clear search results if adding user
            if (action === 'add') {
                setAvailableUsers(prev => prev.filter(u => u._id !== userId));
            }
            
            // Clear search term after successful action
            setSearchTerm('');
            
        } catch (err) {
            console.error(`Błąd podczas ${action === 'add' ? 'dodawania' : 'usuwania'} użytkownika:`, err);
            alert(err.response?.data?.message || 'Wystąpił błąd podczas aktualizacji użytkowników.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Dodajemy debouncing dla wyszukiwania
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                handleSearch();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);


    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Zarządzanie Użytkownikami Projektu: {project.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Icon.Close />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    
                    {/* Sekcja Obecnych Użytkowników */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-700">Obecni Użytkownicy ({project.assignedUsers.length})</h3>
                        <div className="space-y-3">
                            {project.assignedUsers.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-800">{user.username}</span>
                                        <span className="text-xs text-gray-500">({user.email})</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggleUser(user._id, 'remove')}
                                        disabled={isUpdating || project.createdBy._id === user._id} // Nie usuń twórcy projektu
                                        className={`p-2 rounded-full transition-colors ${project.createdBy._id === user._id ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                        title={project.createdBy._id === user._id ? "Nie można usunąć twórcy projektu" : "Usuń z projektu"}
                                    >
                                        <Icon.Remove />
                                    </button>
                                </div>
                            ))}
                            {project.assignedUsers.length === 0 && <p className="text-gray-500">Brak przypisanych użytkowników.</p>}
                        </div>
                    </div>

                    {/* Sekcja Dodawania Użytkowników */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-700">Dodaj Użytkownika</h3>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Szukaj po nazwie lub emailu (min. 2 znaki)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loadingSearch || searchTerm.trim().length < 2}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {loadingSearch ? 'Szukam...' : 'Szukaj'}
                            </button>
                        </div>

                        {searchError && <p className="text-red-500 text-sm mb-3">{searchError}</p>}

                        {/* Wyniki Wyszukiwania */}
                        <div className="space-y-3 mt-4 max-h-40 overflow-y-auto">
                            {availableUsers.length > 0 ? (
                                availableUsers.map(user => (
                                    <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-400 text-white'}`}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800">{user.username}</span>
                                            <span className="text-xs text-gray-500">({user.email})</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleUser(user._id, 'add')}
                                            disabled={isUpdating}
                                            className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1"
                                        >
                                            <Icon.Add /> Dodaj
                                        </button>
                                    </div>
                                ))
                            ) : (
                                searchTerm.trim().length >= 2 && !loadingSearch && <p className="text-gray-500">Brak wyników lub użytkownik już przypisany.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
}
