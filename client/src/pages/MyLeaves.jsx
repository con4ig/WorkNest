import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RequestLeaveModal from '../components/RequestLeaveModal';

const Icon = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
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
)
};

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves/my', { withCredentials: true });
      setLeaves(res.data.leaves);
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten wniosek?')) return;
    
    try {
      await axios.delete(`/api/leaves/${id}`, { withCredentials: true });
      fetchLeaves();
    } catch (err) {
      console.error('Error deleting leave:', err);
      alert(err.response?.data?.message || 'Błąd usuwania wniosku');
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

  return (
    <div className="min-h-screen bg-gray-100">
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
                <h1 className="text-2xl font-bold">Moje Urlopy</h1>
                <p className="text-sm text-gray-500">Zarządzaj swoimi wnioskami urlopowymi</p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Icon.Plus />
              <span>Nowy wniosek</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase">Wykorzystane dni</div>
            <div className="text-2xl font-bold mt-2 text-emerald-600">{stats.totalDays}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
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
                  <td className="px-6 py-4 text-sm">{getLeaveTypeLabel(leave.leaveType)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString('pl-PL')} - {new Date(leave.endDate).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{leave.days}</td>
                  <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                  <td className="px-6 py-4 text-right">
                    {leave.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(leave._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Usuń"
                      >
                        <Icon.Trash />
                      </button>
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
                <Icon.Calendar />
              </div>
            </div>
            <div className="text-lg font-medium">Brak wniosków urlopowych</div>
            <div className="text-sm mt-2">Kliknij "Nowy wniosek" aby złożyć pierwszy wniosek</div>
          </div>
        )}
        </div>
      </div>

      <RequestLeaveModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchLeaves}
      />
    </div>
  );
}