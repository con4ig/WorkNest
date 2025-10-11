import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment'; // Do formatowania dat

// Używam prostych ikon, ponieważ nie mam dostępu do Twoich własnych Icon.X()
const Icon = {
  Calendar: () => (
    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
};

// Pomocnicza funkcja do renderowania statusu
const getStatusClasses = (status) => {
  switch (status) {
    case 'running': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-emerald-100 text-emerald-800';
    case 'on-hold': return 'bg-yellow-100 text-yellow-800';
    case 'pending':
    default: return 'bg-gray-100 text-gray-800';
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

export default function ProjectDetails() {
  const { id } = useParams(); // Pobiera ID z URL, np. /projects/12345
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/projects/${id}`, { withCredentials: true });
        setProject(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching project details:', err);
        // Sprawdzanie, czy błąd jest 404 lub 403 (brak dostępu)
        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
          setError(err.response.data.message || 'Projekt nie znaleziony lub brak dostępu.');
        } else {
          setError('Wystąpił błąd podczas ładowania szczegółów projektu.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        Ładowanie szczegółów projektu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Błąd: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate('/projekty')}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Powrót do listy projektów
        </button>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8">Brak danych projektu.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Utworzono przez: <span className="font-medium">{project.createdBy.username}</span> | 
          Dnia: {moment(project.createdAt).format('YYYY-MM-DD')}
        </p>

        {/* Status and Priority Badges */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClasses(project.status)}`}
          >
            {project.status.replace('-', ' ')}
          </span>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getPriorityClasses(project.priority)}`}></span>
            <span className="text-sm text-gray-600 capitalize">{project.priority}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Opis Projektu</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{project.description || "Brak szczegółowego opisu."}</p>
        </div>

        {/* Key Information & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Daty</h2>
            <div className="flex items-center gap-3 mb-2">
              <Icon.Calendar />
              <div className="text-sm">
                <span className="font-medium">Start:</span> {project.startDate ? moment(project.startDate).format('YYYY-MM-DD') : 'Nie określono'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon.Calendar />
              <div className="text-sm">
                <span className="font-medium">Koniec:</span> {project.endDate ? moment(project.endDate).format('YYYY-MM-DD') : 'Nie określono'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Postęp</h2>
            <div className="text-3xl font-bold mb-2 text-emerald-600">{project.progress || 0}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-emerald-600 h-2.5 rounded-full"
                style={{ width: `${project.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Assigned Users */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Przypisani Użytkownicy ({project.assignedUsers.length})</h2>
          <div className="flex flex-wrap gap-4">
            {project.assignedUsers.map(user => (
              <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.role === 'admin' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'hr' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {user.role}
                </span>
              </div>
            ))}
            {project.assignedUsers.length === 0 && (
              <p className="text-gray-500">Brak przypisanych użytkowników.</p>
            )}
          </div>
        </div>
 
        {/* Back Button */}
        <button
          onClick={() => navigate('/projekty')}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          &larr; Powrót do listy projektów
        </button>
      </div>
    </div>
  );
}