import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

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
    Check: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    X: () => (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    ),
    Eye: () => (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    Menu: () => (
        <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
};

export default function LeaveApprovals() {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null); // For rejection
    const [leaveToApprove, setLeaveToApprove] = useState(null); // For approval confirmation
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null); // { message, type: 'success'|'error' }
    const [currentUser, setCurrentUser] = useState(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserAccess = async () => {
            try {
                const res = await api.get('/users/me');
                setCurrentUser(res.data);
            } catch (err) {
                console.error('Błąd autoryzacji:', err);
                navigate('/login');
            }
        };
        checkUserAccess();
    }, [navigate]);

    const fetchLeaves = useCallback(async () => {
        if (!currentUser || !currentUser.company) return;
        try {
            setLoading(true);
            const params =
                filter !== 'all'
                    ? { status: filter, company: currentUser.company._id }
                    : { company: currentUser.company._id };
            const res = await api.get('/leaves', { params });
            setLeaves(res.data.leaves);
        } catch (err) {
            console.error('Error fetching leaves:', err);
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [filter, navigate, currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        if (currentUser.role === 'admin' || currentUser.role === 'hr') {
            fetchLeaves();
        } else {
            setError('Brak uprawnień do przeglądania tej strony');
        }
    }, [currentUser, fetchLeaves]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleApproveClick = (id) => {
        setLeaveToApprove(id);
        setShowApproveModal(true);
    };

    const confirmApprove = async () => {
        if (!leaveToApprove) return;
        try {
            await api.patch(`/leaves/${leaveToApprove}/approve`, { company: currentUser.company._id });
            fetchLeaves();
            setShowApproveModal(false);
            setLeaveToApprove(null);
        } catch (err) {
            console.error('Error approving leave:', err);
            showNotification(err.response?.data?.message || 'Błąd zatwierdzania', 'error');
        }
    };

    const handleReject = async () => {
        if (!rejectNote.trim()) {
            showNotification('Podaj powód odrzucenia', 'error');
            return;
        }
        try {
            await api.patch(`/leaves/${selectedLeave}/reject`, { reviewNote: rejectNote, company: currentUser.company._id });
            fetchLeaves();
            setShowRejectModal(false);
            setRejectNote('');
            setSelectedLeave(null);
            showNotification('Wniosek odrzucony pomyślnie');
        } catch (err) {
            console.error('Error rejecting leave:', err);
            showNotification(err.response?.data?.message || 'Błąd odrzucania', 'error');
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
                className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
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
            job_search: 'Na poszukiwanie pracy',
            health: 'Zdrowotny/Rehabilitacyjny',
            sick: 'Zwolnienie lekarskie',
            personal: 'Urlop okolicznościowy (stary)',
            other: 'Inny',
        };
        return labels[type] || type;
    };

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-6 py-6 text-red-700 shadow-sm">
                    <div className="mb-2 text-lg font-semibold">Błąd</div>
                    <div className="text-sm">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 sm:w-auto"
                    >
                        Powrót do Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen message="Ładowanie wniosków do zatwierdzenia..." />;
    }

    const stats = {
        pending: leaves.filter((l) => l.status === 'pending').length,
        approved: leaves.filter((l) => l.status === 'approved').length,
        rejected: leaves.filter((l) => l.status === 'rejected').length,
        total: leaves.length,
    };

    const filterTabs = [
        { value: 'pending', label: 'Oczekujące', shortLabel: 'Oczek.' },
        { value: 'approved', label: 'Zatwierdzone', shortLabel: 'Zatw.' },
        { value: 'rejected', label: 'Odrzucone', shortLabel: 'Odrz.' },
        { value: 'all', label: 'Wszystkie', shortLabel: 'Wsz.' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 pb-6">
            {/* Header - Responsywny */}
            <div className="sticky top-0 z-10 bg-white shadow-sm">
                {notification && (
                    <div className={`absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full px-6 py-2 shadow-lg transition-all ${
                        notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                        {notification.message}
                    </div>
                )}
                <div className="px-4 py-4 md:px-8 md:py-6">
                    {/* Mobile header */}
                    <div className="flex items-center justify-between md:hidden">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            <Icon.ArrowLeft />
                        </button>
                        <h1 className="text-lg font-bold">
                            Zarządzanie Urlopami
                        </h1>
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            <Icon.Menu />
                        </button>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden md:flex md:items-center md:justify-between">
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
                                    Zarządzanie Urlopami
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Przeglądaj i zatwierdzaj wnioski urlopowe
                                </p>
                            </div>
                        </div>

                        {/* Desktop filter tabs */}
                        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilter(tab.value)}
                                    className={`rounded-md px-4 py-2 text-sm transition-colors ${filter === tab.value ? 'bg-white font-medium text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile filter menu (dropdown) */}
                    {showFilterMenu && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-2 md:hidden">
                            <div className="grid grid-cols-2 gap-2">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => {
                                            setFilter(tab.value);
                                            setShowFilterMenu(false);
                                        }}
                                        className={`rounded-md px-3 py-2 text-sm transition-colors ${filter === tab.value ? 'bg-emerald-600 font-medium text-white shadow-sm' : 'bg-white text-gray-600'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6 md:mx-auto md:max-w-7xl md:px-8 md:py-8">
                {/* Stats - Responsywne */}
                <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                        <div className="text-xs uppercase text-gray-500">
                            Wszystkie
                        </div>
                        <div className="mt-2 text-xl font-bold md:text-2xl">
                            {stats.total}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                        <div className="text-xs uppercase text-gray-500">
                            Oczekujące
                        </div>
                        <div className="mt-2 text-xl font-bold text-yellow-600 md:text-2xl">
                            {stats.pending}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                        <div className="text-xs uppercase text-gray-500">
                            Zatwierdzone
                        </div>
                        <div className="mt-2 text-xl font-bold text-green-600 md:text-2xl">
                            {stats.approved}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
                        <div className="text-xs uppercase text-gray-500">
                            Odrzucone
                        </div>
                        <div className="mt-2 text-xl font-bold text-red-600 md:text-2xl">
                            {stats.rejected}
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    Pracownik
                                </th>
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-sm">
                                                {leave.user?.username
                                                    ?.charAt(0)
                                                    .toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {leave.user?.username ||
                                                        'Nieznany'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {leave.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {getLeaveTypeLabel(leave.leaveType)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>
                                            {new Date(
                                                leave.startDate,
                                            ).toLocaleDateString('pl-PL')}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            do{' '}
                                            {new Date(
                                                leave.endDate,
                                            ).toLocaleDateString('pl-PL')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {leave.days}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(leave.status)}
                                    </td>
                                    <td className="max-w-xs px-6 py-4 text-sm text-gray-600">
                                        <div
                                            className="truncate"
                                            title={leave.reason}
                                        >
                                            {leave.reason}
                                        </div>
                                        {leave.reviewNote && (
                                            <div className="mt-1 text-xs text-red-600">
                                                Notatka: {leave.reviewNote}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {leave.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleApproveClick(leave._id)
                                                    }
                                                    className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm"
                                                    title="Zatwierdź"
                                                >
                                                    <Icon.Check />
                                                    <span>Zatwierdź</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedLeave(
                                                            leave._id,
                                                        );
                                                        setShowRejectModal(
                                                            true,
                                                        );
                                                    }}
                                                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
                                                    title="Odrzuć"
                                                >
                                                    <Icon.X />
                                                    <span>Odrzuć</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-right text-xs text-gray-400">
                                                {leave.reviewedBy &&
                                                    `Przez: ${leave.reviewedBy.username}`}
                                            </div>
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
                                    <Icon.Eye />
                                </div>
                            </div>
                            <div className="text-lg font-medium">
                                Brak wniosków
                            </div>
                            <div className="mt-2 text-sm">
                                {filter === 'pending' &&
                                    'Nie ma oczekujących wniosków do zatwierdzenia'}
                                {filter === 'approved' &&
                                    'Brak zatwierdzonych wniosków'}
                                {filter === 'rejected' &&
                                    'Brak odrzuconych wniosków'}
                                {filter === 'all' &&
                                    'Nie ma żadnych wniosków urlopowych'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {leaves.map((leave) => (
                        <div
                            key={leave._id}
                            className="rounded-xl bg-white p-4 shadow-sm"
                        >
                            {/* Header karty */}
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-sm">
                                        {leave.user?.username
                                            ?.charAt(0)
                                            .toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {leave.user?.username || 'Nieznany'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {leave.user?.email}
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(leave.status)}
                            </div>

                            {/* Szczegóły */}
                            <div className="space-y-2 border-t pt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Typ:</span>
                                    <span className="font-medium">
                                        {getLeaveTypeLabel(leave.leaveType)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Od:</span>
                                    <span className="font-medium">
                                        {new Date(
                                            leave.startDate,
                                        ).toLocaleDateString('pl-PL')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Do:</span>
                                    <span className="font-medium">
                                        {new Date(
                                            leave.endDate,
                                        ).toLocaleDateString('pl-PL')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Dni:</span>
                                    <span className="font-medium">
                                        {leave.days}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-500">
                                        Powód:
                                    </span>
                                    <p className="mt-1 text-gray-700">
                                        {leave.reason}
                                    </p>
                                </div>
                                {leave.reviewNote && (
                                    <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600">
                                        <strong>Notatka:</strong>{' '}
                                        {leave.reviewNote}
                                    </div>
                                )}
                                {leave.reviewedBy &&
                                    leave.status !== 'pending' && (
                                        <div className="text-xs text-gray-400">
                                            Przez: {leave.reviewedBy.username}
                                        </div>
                                    )}
                            </div>

                            {/* Akcje */}
                            {leave.status === 'pending' && (
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => handleApproveClick(leave._id)}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                                    >
                                        <Icon.Check />
                                        Zatwierdź
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedLeave(leave._id);
                                            setShowRejectModal(true);
                                        }}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                                    >
                                        <Icon.X />
                                        Odrzuć
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {leaves.length === 0 && (
                        <div className="py-16 text-center text-gray-500">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <Icon.Eye />
                                </div>
                            </div>
                            <div className="text-lg font-medium">
                                Brak wniosków
                            </div>
                            <div className="mt-2 text-sm">
                                {filter === 'pending' &&
                                    'Nie ma oczekujących wniosków'}
                                {filter === 'approved' &&
                                    'Brak zatwierdzonych wniosków'}
                                {filter === 'rejected' &&
                                    'Brak odrzuconych wniosków'}
                                {filter === 'all' && 'Nie ma żadnych wniosków'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Approve Confirmation Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
                    <div className="w-full max-w-sm scale-100 rounded-2xl bg-white p-6 shadow-2xl transition-all">
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Icon.Check />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Zatwierdzić wniosek?</h3>
                                <p className="text-sm text-gray-500">Tej operacji nie można cofnąć.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setLeaveToApprove(null);
                                }}
                                className="flex-1 rounded-xl px-4 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-100"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={confirmApprove}
                                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:scale-[1.02]"
                            >
                                Potwierdź
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal - Responsywny */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white">
                        <div className="border-b p-4 md:p-6">
                            <h3 className="text-lg font-bold md:text-xl">
                                Odrzuć wniosek
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Podaj powód odrzucenia wniosku
                            </p>
                        </div>
                        <div className="p-4 md:p-6">
                            <textarea
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                rows="4"
                                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500 md:px-4"
                                placeholder="np. Brak dostępności personelu w tym okresie..."
                            />
                        </div>
                        <div className="flex flex-col gap-2 border-t p-4 md:flex-row md:items-center md:justify-end md:gap-3 md:p-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectNote('');
                                    setSelectedLeave(null);
                                }}
                                className="order-2 rounded-lg px-6 py-2 text-gray-600 transition-colors hover:bg-gray-100 md:order-1"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleReject}
                                className="order-1 rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700 md:order-2"
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
