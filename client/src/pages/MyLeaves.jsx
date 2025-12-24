import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import RequestLeaveModal from '../components/RequestLeaveModal';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

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
    const { t } = useTranslation();
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
            const res = await api.get('/leaves/my', {
                params: { company: user.company._id },
            });
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

    const [confirmationProps, setConfirmationProps] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const askForConfirmation = (props) => {
        setConfirmationProps({ isOpen: true, ...props });
    };

    const handleDeleteClick = (id) => {
        askForConfirmation({
            title: t('leaves.myLeaves.deleteConfirm'),
            message: t('leaves.myLeaves.deleteConfirmMessage'),
            confirmText: t('common.delete'),
            confirmVariant: 'danger',
            onConfirm: () => handleDelete(id),
        });
    };

    const handleDelete = async (id) => {
        if (!user || !user.company) return;

        try {
            await api.delete(`/leaves/${id}`, {
                params: { company: user.company._id },
            });
            fetchLeaves();
        } catch (err) {
            console.error('Error deleting leave:', err);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };

        const labels = {
            pending: t('common.leaveStatus.pending'),
            approved: t('common.leaveStatus.approved'),
            rejected: t('common.leaveStatus.rejected'),
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
        return t(`common.leaveType.${type}`) || type;
    };

    if (loading) {
        return <LoadingScreen message={t('leaves.myLeaves.loading')} />;
    }

    return (
        <div className="min-h-screen select-none bg-gray-100">
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
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
                                <span>{t('dashboard.sidebar.dashboard')}</span>
                            </button>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {t('leaves.myLeaves.title')}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {t('leaves.myLeaves.subtitle')}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                            <Icon.Plus />
                            <span>{t('leaves.myLeaves.newRequest')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-8 py-8">
                {/* Stats */}
                <div className="mb-8 grid grid-cols-4 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            {t('common.leaveStatus.pending')}
                        </div>
                        <div className="mt-2 text-2xl font-bold text-yellow-600">
                            {stats.pending}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            {t('common.leaveStatus.approved')}
                        </div>
                        <div className="mt-2 text-2xl font-bold text-green-600">
                            {stats.approved}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            {t('common.leaveStatus.rejected')}
                        </div>
                        <div className="mt-2 text-2xl font-bold text-red-600">
                            {stats.rejected}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase text-gray-500">
                            {t('leaves.myLeaves.stats.usedDays')}
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
                                    {t('common.type')}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    {t('common.dates')}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    {t('common.days')}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    {t('common.status')}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                    {t('common.reason')}
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-600">
                                    {t('common.actions')}
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
                                                title={t('common.delete')}
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
                                {t('leaves.myLeaves.noLeaves')}
                            </div>
                            <div className="mt-2 text-sm">
                                {t('leaves.myLeaves.clickToAdd')}
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
