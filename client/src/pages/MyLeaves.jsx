import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import RequestLeaveModal from '../components/RequestLeaveModal';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import Notification from '../components/Notification.jsx';

const Icon = {
    ArrowLeft: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    ),
    Plus: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    Calendar: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    Trash: () => (
        <svg
            className="h-4 w-4"
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
};

export default function MyLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        totalDays: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.company) {
            fetchLeaves();
        }
    }, [user]);

    const fetchLeaves = async () => {
        if (!user || !user.company) return;
        try {
            const res = await api.get('/leaves/my', { params: { company: user.company._id } });
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

    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [confirmationProps, setConfirmationProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification((prev) => ({ ...prev, visible: false }));
        }, 3000);
    };

    const clearNotification = () => {
        setNotification({ ...notification, visible: false });
    };

    const askForConfirmation = (props) => {
        setConfirmationProps({ isOpen: true, ...props });
    };

    const handleDeleteClick = (id) => {
        askForConfirmation({
            title: 'Usuwanie Wniosku',
            message: 'Czy na pewno chcesz usunąć ten wniosek? Ta operacja jest nieodwracalna.',
            confirmText: 'Usuń',
            confirmVariant: 'danger',
            onConfirm: () => handleDelete(id),
        });
    };

    const handleDelete = async (id) => {
        if (!user || !user.company) return;

        try {
            await api.delete(`/leaves/${id}`, { params: { company: user.company._id } });
            fetchLeaves();
            showNotification('Wniosek został usunięty', 'success');
        } catch (err) {
            console.error('Error deleting leave:', err);
            showNotification(err.response?.data?.message || 'Błąd usuwania wniosku', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };

        const labels = {
            pending: 'Oczekujący',
            approved: 'Zatwierdzony',
            rejected: 'Odrzucony',
        };

        return (
            <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
            >
                {labels[status]}
            </span>
        );
    };

    const getLeaveTypeLabel = (type) => {
        const labels = {
            vacation: 'Urlop wypoczynkowy',
            on_demand: 'Urlop na żądanie',
            unpaid: 'Urlop bezpłatny',
            occasional: 'Urlop okolicznościowy',
            maternity: 'Urlop macierzyński',
            paternity: 'Urlop ojcowski',
            parental: 'Urlop rodzicielski',
            childcare: 'Urlop wychowawczy',
            care: 'Urlop opiekuńczy',
            training: 'Urlop szkoleniowy',
            job_search: 'Urlop na poszukiwanie pracy',
            health: 'Urlop zdrowotny/rehabilitacyjny',
            sick: 'Zwolnienie lekarskie',
            personal: 'Urlop okolicznościowy (stary)',
            other: 'Inny',
        };
        return labels[type] || type;
    };

    if (loading) {
        return <LoadingScreen message="Ładowanie wniosków..." />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Notification notification={notification} onClear={clearNotification} />
            <ConfirmationModal
                {...confirmationProps}
                onClose={() => setConfirmationProps({ ...confirmationProps, isOpen: false })}
            />
            <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
                            >
                                <Icon.ArrowLeft />
                                <span>Dashboard</span>
                            </button>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Moje Urlopy
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Zarządzaj swoimi wnioskami urlopowymi
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                            <Icon.Plus />
                            <span>Nowy wniosek</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-8 py-8">
                {/* Stats */}
                <div className="mb-8 grid grid-cols-4 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            Oczekujące
                        </div>
                        <div className="mt-2 text-2xl font-bold text-yellow-600">
                            {stats.pending}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            Zatwierdzone
                        </div>
                        <div className="mt-2 text-2xl font-bold text-green-600">
                            {stats.approved}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            Odrzucone
                        </div>
                        <div className="mt-2 text-2xl font-bold text-red-600">
                            {stats.rejected}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            Wykorzystane dni
                        </div>
                        <div className="mt-2 text-2xl font-bold text-emerald-600">
                            {stats.totalDays}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    Typ
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    Daty
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    Dni
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    Powód
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-600">
                                    Akcje
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {leaves.map((leave) => (
                                <tr
                                    key={leave._id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 text-sm">
                                        {getLeaveTypeLabel(leave.leaveType)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(
                                            leave.startDate,
                                        ).toLocaleDateString('pl-PL')}{' '}
                                        -{' '}
                                        {new Date(
                                            leave.endDate,
                                        ).toLocaleDateString('pl-PL')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {leave.days}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(leave.status)}
                                    </td>
                                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-600">
                                        {leave.reason}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {leave.status === 'pending' && (
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(leave._id)
                                                }
                                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
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
                        <div className="py-16 text-center text-gray-500">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <Icon.Calendar />
                                </div>
                            </div>
                            <div className="text-lg font-medium">
                                Brak wniosków urlopowych
                            </div>
                            <div className="mt-2 text-sm">
                                Kliknij "Nowy wniosek" aby złożyć pierwszy
                                wniosek
                            </div>
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
