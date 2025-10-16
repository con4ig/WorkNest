import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Icon = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
};

export default function LeaveApprovals() {
// === Twoje istniejące stany ===
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true); // Ustawiamy na true, bo zaczynamy od sprawdzania usera
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [Error, setError] = useState(null);
  const navigate = useNavigate();

  // === Nowy stan do przechowywania danych o zalogowanym użytkowniku ===
  const [currentUser, setCurrentUser] = useState(null);

  // ==========================================================
  // KROK 1: Sprawdź kim jest użytkownik ZANIM cokolwiek zrobisz
  // ==========================================================
  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        // Zapytaj backend "kim jestem?"
        const res = await axios.get('/api/auth/me', { withCredentials: true });
        // Zapisz dane użytkownika w stanie
        setCurrentUser(res.data); 
      } catch (err) {
        console.error('Błąd autoryzacji:', err);
        // Jeśli nie jesteś zalogowany (błąd 401), przenieś na stronę logowania
        navigate('/login');
      }
    };
    checkUserAccess();
  }, [navigate]); // navigate jest zależnością, bo używamy go w środku

  // =====================================================================
  // KROK 2: Pobierz dane (wnioski) TYLKO WTEDY, gdy użytkownik ma uprawnienia
  // =====================================================================
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true); // Ustaw ładowanie przed każdym pobraniem
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await axios.get('/api/leaves', { 
        params, 
        withCredentials: true 
      });
      setLeaves(res.data.leaves);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      // Obsługa błędów, które mogą się zdarzyć nawet adminowi
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false); // Zawsze wyłączaj ładowanie po zakończeniu
    }
  }, [filter, navigate]); // Ta funkcja zależy od filtra i nawigacji

  useEffect(() => {
    // Nie rób nic, dopóki nie znamy użytkownika
    if (!currentUser) {
      return; 
    }

    // Sprawdź rolę użytkownika
    if (currentUser.role === 'admin' || currentUser.role === 'hr') {
      // Jeśli ma uprawnienia, pobierz wnioski
      fetchLeaves();
    } else {
      // Jeśli to zwykły user, wyrzuć go stąd
      setError('Brak uprawnień do przeglądania tej strony');     
 
    }
  }, [currentUser, fetchLeaves]); // Uruchom ten efekt, gdy zmieni się user lub funkcja fetchLeaves


  // === Reszta Twojego kodu (bez zmian) ===
  const handleApprove = async (id) => {
    if (!window.confirm('Czy na pewno chcesz zatwierdzić ten wniosek?')) return;
    try {
      await axios.patch(`/api/leaves/${id}/approve`, {}, { withCredentials: true });
      fetchLeaves();
      alert('Wniosek zatwierdzony pomyślnie');
    } catch (err) {
      console.error('Error approving leave:', err);
      alert(err.response?.data?.message || 'Błąd zatwierdzania');
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      alert('Podaj powód odrzucenia');
      return;
    }
    try {
      await axios.patch(
        `/api/leaves/${selectedLeave}/reject`,
        { reviewNote: rejectNote },
        { withCredentials: true }
      );
      fetchLeaves();
      setShowRejectModal(false);
      setRejectNote('');
      setSelectedLeave(null);
      alert('Wniosek odrzucony');
    } catch (err) {
      console.error('Error rejecting leave:', err);
      alert(err.response?.data?.message || 'Błąd odrzucania');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    
    const labels = {
      pending: 'Oczekujący',
      approved: 'Zatwierdzony',
      rejected: 'Odrzucony'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      vacation: 'Urlop wypoczynkowy',
      sick: 'Zwolnienie lekarskie',
      personal: 'Urlop okolicznościowy',
      other: 'Inny'
    };
    return labels[type] || type;
  };

    if (Error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl shadow-sm">
          <div className="font-semibold mb-2">Błąd</div>
          <div>{Error}</div>
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

  const stats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    total: leaves.length
  };

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
                <span>Dashboard</span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div>
                <h1 className="text-2xl font-bold">Zarządzanie Urlopami</h1>
                <p className="text-sm text-gray-500">Przeglądaj i zatwierdzaj wnioski urlopowe</p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              {[
                { value: 'pending', label: 'Oczekujące' },
                { value: 'approved', label: 'Zatwierdzone' },
                { value: 'rejected', label: 'Odrzucone' },
                { value: 'all', label: 'Wszystkie' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    filter === tab.value 
                      ? 'bg-white text-emerald-600 font-medium shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">Wszystkie</div>
            <div className="text-2xl font-bold mt-2">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">Oczekujące</div>
            <div className="text-2xl font-bold mt-2 text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">Zatwierdzone</div>
            <div className="text-2xl font-bold mt-2 text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">Odrzucone</div>
            <div className="text-2xl font-bold mt-2 text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Pracownik</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Typ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Daty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dni</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Powód</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.map(leave => (
                <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                  {/* Pracownik */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {leave.user?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{leave.user?.username || 'Nieznany'}</div>
                        <div className="text-xs text-gray-500">{leave.user?.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Typ */}
                  <td className="px-6 py-4 text-sm">{getLeaveTypeLabel(leave.leaveType)}</td>

                  {/* Daty */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{new Date(leave.startDate).toLocaleDateString('pl-PL')}</div>
                    <div className="text-xs text-gray-400">do {new Date(leave.endDate).toLocaleDateString('pl-PL')}</div>
                  </td>

                  {/* Dni */}
                  <td className="px-6 py-4 text-sm font-medium">{leave.days}</td>

                  {/* Status */}
                  <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>

                  {/* Powód */}
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <div className="truncate" title={leave.reason}>{leave.reason}</div>
                    {leave.reviewNote && (
                      <div className="text-xs text-red-600 mt-1">Notatka: {leave.reviewNote}</div>
                    )}
                  </td>

                  {/* Akcje */}
                  <td className="px-6 py-4">
                    {leave.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(leave._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                          title="Zatwierdź"
                        >
                          <Icon.Check />
                          <span>Zatwierdź</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLeave(leave._id);
                            setShowRejectModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                          title="Odrzuć"
                        >
                          <Icon.X />
                          <span>Odrzuć</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-right">
                        {leave.reviewedBy && `Przez: ${leave.reviewedBy.username}`}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {leaves.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon.Eye />
                </div>
              </div>
              <div className="text-lg font-medium">Brak wniosków</div>
              <div className="text-sm mt-2">
                {filter === 'pending' && 'Nie ma oczekujących wniosków do zatwierdzenia'}
                {filter === 'approved' && 'Brak zatwierdzonych wniosków'}
                {filter === 'rejected' && 'Brak odrzuconych wniosków'}
                {filter === 'all' && 'Nie ma żadnych wniosków urlopowych'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Odrzuć wniosek</h3>
              <p className="text-sm text-gray-500 mt-1">Podaj powód odrzucenia wniosku</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                placeholder="np. Brak dostępności personelu w tym okresie..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectNote('');
                  setSelectedLeave(null);
                }}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Odrzuć wniosek
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}