import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserManagementModal from './UserManagementModal';

// Ustawienie domyślne dla Axios (jeśli jest potrzebne, zostawiamy)
axios.defaults.baseURL = 'http://localhost:5500';

// --- Pomocnicze funkcje formatowania dat ---
const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Nie określono';
    try {
        // Używamy toLocaleDateString dla czytelnego formatu
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return 'Nieprawidłowa data';
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        // Zapewnienie formatu YYYY-MM-DD dla input type="date"
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
};
// ---------------------------------------------


const Icon = {
 Calendar: () => (
 <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
 <line x1="16" y1="2" x2="16" y2="6"></line>
 <line x1="8" y1="2" x2="8" y2="6"></line>
 <line x1="3" y1="10" x2="21" y2="10"></line>
 </svg>
 ),
 User: ({ className = 'w-5 h-5 text-white' }) => (
 <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
 <circle cx="12" cy="7" r="4"></circle>
 </svg>
 ),
  Edit: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Save: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  Cancel: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
};

// Pomocnicza funkcja do renderowania statusu
const getStatusClasses = (status) => {
 switch (status) {
 case 'running': return 'bg-blue-100 text-blue-800 ring-blue-300/50';
 case 'completed': return 'bg-emerald-100 text-emerald-800 ring-emerald-300/50';
 case 'on-hold': return 'bg-yellow-100 text-yellow-800 ring-yellow-300/50';
 case 'pending':
default: return 'bg-gray-100 text-gray-800 ring-gray-300/50';
 }
};

// Pomocnicza funkcja do renderowania priorytetu
const getPriorityClasses = (priority) => {
 switch (priority) {
 case 'high': return 'bg-red-500';
 case 'medium': return 'bg-yellow-500';
 case 'low':
 default: return 'bg-green-500';
 }
};

// Dostępne role i statusy dla rozwijanych list
const AVAILABLE_STATUSES = ['pending', 'running', 'on-hold', 'completed'];
const AVAILABLE_PRIORITIES = ['low', 'medium', 'high'];


export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Nowe stany dla trybu edycji
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);


  // Funkcja pobierająca szczegóły projektu i dane użytkownika
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Pobierz zalogowanego usera
      const meRes = await axios.get('/api/auth/me', { withCredentials: true });
      setCurrentUser(meRes.data);

      // Pobierz szczegóły projektu
      const res = await axios.get(`/api/projects/${id}`, { withCredentials: true });
      setProject(res.data);
      // Ustaw dane edycji na podstawie danych projektu, używając nowej funkcji formatDateForInput
      setEditData({
        name: res.data.name,
        description: res.data.description,
        status: res.data.status,
        priority: res.data.priority,
        progress: res.data.progress || 0,
        startDate: formatDateForInput(res.data.startDate),
        endDate: formatDateForInput(res.data.endDate),
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response && (err.response.status === 404 || err.response.status === 403 || err.response.status === 401)) {
        setError(err.response.data.message || 'Projekt nie znaleziony lub brak dostępu. Zaloguj się ponownie.');
      } else {
        setError('Wystąpił błąd podczas ładowania szczegółów projektu.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  // Obsługa zmian w polach edycji
  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    // Specjalna obsługa pola progress (ograniczenie do 0-100)
    if (name === 'progress' && type === 'number') {
        newValue = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
    }

    setEditData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Obsługa zapisu zmian (PATCH/PUT)
  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);

    try {
        // Konwersja dat na format ISO lub null/undefined, jeśli puste. 
        // Wysłanie daty w formacie YYYY-MM-DD jest zwykle wystarczające, 
        // ale backend powinien być przygotowany na ISO lub puste ciągi.
        const payload = {
            ...editData,
            // Ustawienie na null, jeśli pole jest puste, aby uniknąć błędów parsowania na backendzie
            startDate: editData.startDate || null,
            endDate: editData.endDate || null,
        };

        // Tutaj zakłada się, że masz zaimplementowany endpoint PATCH /api/projects/:id
        await axios.patch(`/api/projects/${id}`, payload, { withCredentials: true });

        // Po zapisie, odśwież dane i wyłącz tryb edycji
        await fetchData();
        setIsEditing(false);

    } catch (err) {
      console.error('Error saving project:', err);
      alert(err.response?.data?.message || 'Błąd podczas zapisywania zmian.'); // Używamy alert, jeśli nie mamy dedykowanego modala
    } finally {
      setIsSaving(false);
    }
  };

  // Dodajemy funkcję do obsługi aktualizacji projektu (np. po zmianie użytkowników)
  const handleProjectUpdate = useCallback((updatedProject) => {
    if (updatedProject) {
        // If we received an updated project, use it directly
        setProject(updatedProject);
    } else {
        // Otherwise, fetch fresh data
        fetchData();
    }
}, [fetchData]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen bg-gray-100">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Ładowanie szczegółów projektu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-red-50 border border-red-400 text-red-700 px-8 py-6 rounded-xl shadow-lg w-full max-w-lg">
          <strong className="font-bold">Błąd: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => navigate('/projekty')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
          >
            Powrót do listy projektów
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8">Brak danych projektu.</div>;
  }

  // Warunek sprawdzający, czy użytkownik jest administratorem
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
            <div>
                {/* Tytuł i przyciski akcji */}
                {isEditing ? (
                    <input 
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="text-3xl font-bold text-gray-900 border-b-2 border-emerald-500 focus:outline-none w-full bg-gray-50 rounded px-2 py-1 transition-colors"
                        disabled={isSaving}
                    />
                ) : (
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                )}
                
                <p className="text-sm text-gray-500">
                    Utworzono przez: <span className="font-medium">{project.createdBy.username}</span> | 
                    Dnia: {formatDateForDisplay(project.createdAt)}
                </p>
            </div>
            
            {/* Akcje Admina */}
            {isAdmin && (
                <div className="flex gap-3 mt-1 flex-shrink-0">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md disabled:bg-gray-400"
                            >
                                {isSaving ? 'Zapisywanie...' : (<><Icon.Save /> Zapisz</>)}
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); fetchData(); }} // Anuluj i odśwież dane
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                <Icon.Cancel /> Anuluj
                            </button>
                        </>
                    ) : (
                        <>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <Icon.Edit /> Edytuj Projekt
                        </button>
                        <button
                            onClick={() => setShowUserModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                        >
                            <Icon.User className="w-5 h-5" /> Zarządzaj Użytkownikami
                        </button>
                        </>
                    )}
                </div>
            )}
        </div>

        {/* Status and Priority Badges / Inputs */}
        <div className="flex items-center flex-wrap gap-4 mb-6">
            {isEditing ? (
                <>
                    {/* Status Select */}
                    <select
                        name="status"
                        value={editData.status}
                        onChange={handleEditChange}
                        className={`px-3 py-1 text-sm font-semibold rounded-lg border-2 focus:border-emerald-500 focus:outline-none ${getStatusClasses(editData.status)}`}
                        disabled={isSaving}
                    >
                        {AVAILABLE_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace('-', ' ')}</option>
                        ))}
                    </select>

                    {/* Priority Select */}
                    <div className="flex items-center gap-2 border bg-white rounded-lg p-1.5 shadow-sm">
                         <label className="text-sm text-gray-600 font-medium ml-1">Priorytet:</label>
                        <select
                            name="priority"
                            value={editData.priority}
                            onChange={handleEditChange}
                            className={`p-1 text-sm rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none capitalize`}
                            disabled={isSaving}
                        >
                            {AVAILABLE_PRIORITIES.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <span className={`w-3 h-3 rounded-full mr-1 ${getPriorityClasses(editData.priority)}`}></span>
                    </div>

                    <button onClick={() => setShowUserModal(true)}>Zarządzaj Użytkownikami</button>

                </>
            ) : (
                <>
                    {/* Read-Only View */}
                    <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ring-1 ${getStatusClasses(project.status)}`}
                    >
                        {project.status.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1.5 shadow-sm bg-white">
                        <span className={`w-3 h-3 rounded-full ml-1 ${getPriorityClasses(project.priority)}`}></span>
                        <span className="text-sm text-gray-600 capitalize font-medium mr-1">{project.priority}</span>
                    </div>
                </>
            )}
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Opis Projektu</h2>
            {isEditing ? (
                <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    rows="5"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Wprowadź szczegółowy opis projektu..."
                    disabled={isSaving}
                />
            ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{project.description || "Brak szczegółowego opisu."}</p>
            )}
        </div>

        {/* Key Information & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Daty</h2>
            <div className="space-y-3">
                {/* Start Date */}
                <div className="flex items-center gap-3">
                    <Icon.Calendar />
                    <div className="text-sm flex flex-col sm:flex-row sm:items-center w-full">
                        <span className="font-medium w-20 text-gray-600">Start:</span>
                        {isEditing ? (
                            <input
                                type="date"
                                name="startDate"
                                value={editData.startDate}
                                onChange={handleEditChange}
                                className="border border-gray-300 rounded-md p-1.5 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors"
                                disabled={isSaving}
                            />
                        ) : (
                            <span className="text-gray-700">
                                {formatDateForDisplay(project.startDate)}
                            </span>
                        )}
                    </div>
                </div>
                {/* End Date */}
                <div className="flex items-center gap-3">
                    <Icon.Calendar />
                    <div className="text-sm flex flex-col sm:flex-row sm:items-center w-full">
                        <span className="font-medium w-20 text-gray-600">Koniec:</span>
                        {isEditing ? (
                            <input
                                type="date"
                                name="endDate"
                                value={editData.endDate}
                                onChange={handleEditChange}
                                className="border border-gray-300 rounded-md p-1.5 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors"
                                disabled={isSaving}
                            />
                        ) : (
                            <span className="text-gray-700">
                                {formatDateForDisplay(project.endDate)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {/* Progress Bar / Input */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Postęp (%)</h2>
            
            {isEditing ? (
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        name="progress"
                        value={editData.progress}
                        onChange={handleEditChange}
                        min="0"
                        max="100"
                        className="text-3xl font-bold text-emerald-600 w-24 border border-gray-300 rounded-lg p-2 text-center focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors"
                        disabled={isSaving}
                    />
                    <span className="text-3xl font-bold text-emerald-600">%</span>
                </div>
            ) : (
                <div className="text-3xl font-bold mb-2 text-emerald-600">{project.progress || 0}%</div>
            )}
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div
                className="bg-emerald-600 h-2.5 rounded-full shadow-inner"
                style={{ width: `${isEditing ? editData.progress : project.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Assigned Users (Widok tylko do odczytu, ponieważ edycja przypisań jest zazwyczaj bardziej złożona) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Przypisani Użytkownicy ({project.assignedUsers.length})</h2>
          <div className="flex flex-wrap gap-4">
            {project.assignedUsers.map(user => (
              <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-inner flex-shrink-0 ${user.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ring-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 ring-purple-300/50' : user.role === 'hr' ? 'bg-blue-100 text-blue-700 ring-blue-300/50' : 'bg-gray-100 text-gray-700 ring-gray-300/50'}`}>
                  {user.role}
                </span>
              </div>
            ))}
            {project.assignedUsers.length === 0 && (
              <p className="text-gray-500">Brak przypisanych użytkowników.</p>
            )}
          </div>
        {showUserModal && (
            <UserManagementModal
              project={project}
              onClose={() => setShowUserModal(false)}
              onUpdate={handleProjectUpdate}
            />
        )}   
        </div>

 {/* Back Button */}
 <button
 onClick={() => navigate('/projekty')}
className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
 >
 &larr; Powrót do listy projektów
 </button>
 </div>
 </div>
 );
}
