import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Icon = {
    Close: () => (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>),
    Add: () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>),
    Remove: () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>),
};

export default function UserManagementModal({ project, onClose, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Funkcja do wyszukiwania użytkowników
    const handleSearch = async (term) => {
        if (term.trim().length < 2) {
            setAvailableUsers([]);
            return;
        }
        
        setLoadingSearch(true);
        setSearchError(null);
        
        try {
            const res = await axios.get('/api/users', { 
                params: { search: term.trim() },
                withCredentials: true 
            });
            
            // Filtruj użytkowników już przypisanych
            const assignedIds = project.assignedUsers.map(u => u._id);
            const filteredUsers = res.data.users.filter(user => 
                !assignedIds.includes(user._id)
            );
            
            setAvailableUsers(filteredUsers);
        } catch (err) {
            console.error("Błąd podczas wyszukiwania użytkowników:", err);
            setSearchError(err.response?.data?.message || "Błąd wyszukiwania użytkowników");
        } finally {
            setLoadingSearch(false);
        }
    };

    // Debouncing dla wyszukiwania
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm, project.assignedUsers]); // WAŻNE: dodaj project.assignedUsers jako dependency

    // Funkcja do dodawania/usuwania użytkownika
    const handleToggleUser = async (userId, action) => {
        setIsUpdating(true);
        try {
            const response = await axios.patch(
                `/api/projects/${project._id}/users`, 
                { userId, action },
                { withCredentials: true }
            );
            
            // Aktualizuj projekt
            if (response.data.project) {
                onUpdate(response.data.project);
            }
            
            // Wyczyść search po dodaniu
            if (action === 'add') {
                setSearchTerm('');
                setAvailableUsers([]);
            }
            
        } catch (err) {
            console.error(`Błąd podczas ${action === 'add' ? 'dodawania' : 'usuwania'} użytkownika:`, err);
            alert(err.response?.data?.message || 'Wystąpił błąd podczas aktualizacji użytkowników.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Zarządzanie Użytkownikami</h2>
                        <p className="text-sm text-gray-500 mt-1">Projekt: {project.name}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Icon.Close />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    
                    {/* Sekcja Obecnych Użytkowników */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">
                            Obecni Użytkownicy 
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({project.assignedUsers.length})
                            </span>
                        </h3>
                        
                        <div className="space-y-2">
                            {project.assignedUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                    Brak przypisanych użytkowników
                                </div>
                            ) : (
                                project.assignedUsers.map(user => {
                                    const isCreator = project.createdBy._id === user._id;
                                    
                                    return (
                                        <div 
                                            key={user._id} 
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    user.role === 'admin' ? 'bg-purple-600 text-white' : 
                                                    user.role === 'hr' ? 'bg-blue-600 text-white' :
                                                    'bg-emerald-600 text-white'
                                                }`}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 flex items-center gap-2">
                                                        {user.username}
                                                        {isCreator && (
                                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                                Twórca
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleUser(user._id, 'remove')}
                                                disabled={isUpdating || isCreator}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    isCreator 
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                                                }`}
                                                title={isCreator ? "Nie można usunąć twórcy projektu" : "Usuń z projektu"}
                                            >
                                                <Icon.Remove />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Sekcja Dodawania Użytkowników */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Dodaj Użytkownika</h3>
                        
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Szukaj po nazwie lub emailu (min. 2 znaki)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                            {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
                                <p className="text-xs text-gray-500 mt-1">Wpisz przynajmniej 2 znaki</p>
                            )}
                        </div>

                        {searchError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                {searchError}
                            </div>
                        )}

                        {loadingSearch && (
                            <div className="text-center py-8 text-gray-500">
                                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                Szukam...
                            </div>
                        )}

                        {/* Wyniki Wyszukiwania */}
                        {!loadingSearch && searchTerm.trim().length >= 2 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableUsers.length > 0 ? (
                                    availableUsers.map(user => (
                                        <div 
                                            key={user._id} 
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    user.role === 'admin' ? 'bg-purple-600 text-white' : 
                                                    user.role === 'hr' ? 'bg-blue-600 text-white' :
                                                    'bg-gray-400 text-white'
                                                }`}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{user.username}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleUser(user._id, 'add')}
                                                disabled={isUpdating}
                                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                <Icon.Add />
                                                <span>Dodaj</span>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        Brak wyników lub wszyscy użytkownicy już przypisani
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
}