import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
                const res = await axios.get('/api/auth/me', {
                    withCredentials: true,
                });
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
                withCredentials: true,
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
        if (!window.confirm('Czy na pewno chcesz zatwierdzić ten wniosek?'))
            return;
        try {
            await axios.patch(
                `/api/leaves/${id}/approve`,
                {},
                { withCredentials: true },
            );
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
                { withCredentials: true },
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
            sick: 'Zwolnienie lekarskie',
            personal: 'Urlop okolicznościowy',
            other: 'Inny',
        };
        return labels[type] || type;
    };

    if (Error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="rounded-xl border border-red-200 bg-red-50 px-8 py-6 text-red-700 shadow-sm">
                    <div className="mb-2 font-semibold">Błąd</div>
                    <div>{Error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                    >
                        Powrót do Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                    <div className="text-lg text-gray-600">Ładowanie...</div>
                </div>
            </div>
        );
    }

    const stats = {
        pending: leaves.filter((l) => l.status === 'pending').length,
        approved: leaves.filter((l) => l.status === 'approved').length,
        rejected: leaves.filter((l) => l.status === 'rejected').length,
        total: leaves.length,
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
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
                                    Zarządzanie Urlopami
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Przeglądaj i zatwierdzaj wnioski urlopowe
                                </p>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                            {[
                                { value: 'pending', label: 'Oczekujące' },
                                { value: 'approved', label: 'Zatwierdzone' },
                                { value: 'rejected', label: 'Odrzucone' },
                                { value: 'all', label: 'Wszystkie' },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilter(tab.value)}
                                    className={`rounded-md px-4 py-2 text-sm transition-colors ${
                                        filter === tab.value
                                            ? 'bg-white font-medium text-emerald-600 shadow-sm'
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
            <div className="mx-auto max-w-7xl px-8 py-8">
                {/* Stats */}
                <div className="mb-8 grid grid-cols-4 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            Wszystkie
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            {stats.total}
                        </div>
                    </div>
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
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
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
                                    {/* Pracownik */}
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

                                    {/* Typ */}
                                    <td className="px-6 py-4 text-sm">
                                        {getLeaveTypeLabel(leave.leaveType)}
                                    </td>

                                    {/* Daty */}
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

                                    {/* Dni */}
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {leave.days}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        {getStatusBadge(leave.status)}
                                    </td>

                                    {/* Powód */}
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

                                    {/* Akcje */}
                                    <td className="px-6 py-4">
                                        {leave.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleApprove(leave._id)
                                                    }
                                                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-green-700"
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
                                                    className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-700"
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
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white">
                        <div className="border-b p-6">
                            <h3 className="text-xl font-bold">
                                Odrzuć wniosek
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Podaj powód odrzucenia wniosku
                            </p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                rows="4"
                                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
                                placeholder="np. Brak dostępności personelu w tym okresie..."
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t p-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectNote('');
                                    setSelectedLeave(null);
                                }}
                                className="rounded-lg px-6 py-2 text-gray-600 transition-colors hover:bg-gray-100"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleReject}
                                className="rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
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
