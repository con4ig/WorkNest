import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Icon = {
    Close: () => (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    ),
    Add: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
        </svg>
    ),
    Remove: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 12H4"
            />
        </svg>
    ),
};

export default function UserManagementModal({ project, onClose, onUpdate }) {
    const { user } = useAuth();
    const companyId = user?.company?._id;

    const [searchTerm, setSearchTerm] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Funkcja do wyszukiwania użytkowników
    const handleSearch = async (term) => {
        if (!companyId) return; // Nie wyszukuj, jeśli companyId nie jest dostępne
        if (term.trim().length < 2) {
            setAvailableUsers([]);
            return;
        }

        setLoadingSearch(true);
        setSearchError(null);

        try {
            const res = await axios.get('/api/users', {
                params: { search: term.trim() },
                withCredentials: true,
            });

            // Filtruj użytkowników już przypisanych
            const assignedIds = project.assignedUsers.map((u) => u._id);
            const filteredUsers = res.data.users.filter(
                (user) => !assignedIds.includes(user._id),
            );

            setAvailableUsers(filteredUsers);
        } catch (err) {
            console.error('Błąd podczas wyszukiwania użytkowników:', err);
            setSearchError(
                err.response?.data?.message || 'Błąd wyszukiwania użytkowników',
            );
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
    }, [searchTerm, project.assignedUsers, companyId]); // WAŻNE: dodaj companyId jako dependency

    // Funkcja do dodawania/usuwania użytkownika
    const handleToggleUser = async (userId, action) => {
        if (!companyId) return; // Nie wykonuj akcji, jeśli companyId nie jest dostępne
        setIsUpdating(true);
        try {
            const response = await axios.patch(
                `/api/projects/${project._id}/users`,
                { userId, action },
                { withCredentials: true },
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
            console.error(
                `Błąd podczas ${action === 'add' ? 'dodawania' : 'usuwania'} użytkownika:`,
                err,
            );
            alert(
                err.response?.data?.message ||
                    'Wystąpił błąd podczas aktualizacji użytkowników.',
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-2xl transform rounded-xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Zarządzanie Użytkownikami
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Projekt: {project.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <Icon.Close />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6">
                    {/* Sekcja Obecnych Użytkowników */}
                    <div className="mb-8">
                        <h3 className="mb-3 text-lg font-semibold text-gray-700">
                            Obecni Użytkownicy
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({project.assignedUsers.length})
                            </span>
                        </h3>

                        <div className="space-y-2">
                            {project.assignedUsers.length === 0 ? (
                                <div className="rounded-lg bg-gray-50 py-8 text-center text-gray-500">
                                    Brak przypisanych użytkowników
                                </div>
                            ) : (
                                project.assignedUsers.map((user) => {
                                    const isCreator =
                                        project.createdBy._id === user._id;

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between rounded-lg border bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                                                        user.role === 'admin'
                                                            ? 'bg-purple-600 text-white'
                                                            : user.role === 'hr'
                                                              ? 'bg-blue-600 text-white'
                                                              : 'bg-emerald-600 text-white'
                                                    }`}
                                                >
                                                    {user.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 font-medium text-gray-800">
                                                        {user.username}
                                                        {isCreator && (
                                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                                                                Twórca
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleToggleUser(
                                                        user._id,
                                                        'remove',
                                                    )
                                                }
                                                disabled={
                                                    isUpdating || isCreator
                                                }
                                                className={`rounded-lg p-2 transition-colors ${
                                                    isCreator
                                                        ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                                title={
                                                    isCreator
                                                        ? 'Nie można usunąć twórcy projektu'
                                                        : 'Usuń z projektu'
                                                }
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
                        <h3 className="mb-3 text-lg font-semibold text-gray-700">
                            Dodaj Użytkownika
                        </h3>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Szukaj po nazwie lub emailu (min. 2 znaki)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                            />
                            {searchTerm.trim().length > 0 &&
                                searchTerm.trim().length < 2 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Wpisz przynajmniej 2 znaki
                                    </p>
                                )}
                        </div>

                        {searchError && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {searchError}
                            </div>
                        )}

                        {loadingSearch && (
                            <div className="py-8 text-center text-gray-500">
                                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                                Szukam...
                            </div>
                        )}

                        {/* Wyniki Wyszukiwania */}
                        {!loadingSearch && searchTerm.trim().length >= 2 && (
                            <div className="max-h-64 space-y-2 overflow-y-auto">
                                {availableUsers.length > 0 ? (
                                    availableUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                                                        user.role === 'admin'
                                                            ? 'bg-purple-600 text-white'
                                                            : user.role === 'hr'
                                                              ? 'bg-blue-600 text-white'
                                                              : 'bg-gray-400 text-white'
                                                    }`}
                                                >
                                                    {user.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleToggleUser(
                                                        user._id,
                                                        'add',
                                                    )
                                                }
                                                disabled={isUpdating}
                                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Icon.Add />
                                                <span>Dodaj</span>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg bg-gray-50 py-8 text-center text-gray-500">
                                        Brak wyników lub wszyscy użytkownicy już
                                        przypisani
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 p-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
}
