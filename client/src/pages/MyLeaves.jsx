import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import RequestLeaveModal from '../components/RequestLeaveModal';
import { useAuth } from '../context/useAuth';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import { Button } from '../components/ui/Button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '../components/ui/Card';
import AnimatedNumber from '../components/ui/AnimatedNumber';

import {
    ArrowLeft,
    Plus,
    Calendar,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    CalendarDays,
    Info,
    Search,
    Filter,
    ChevronRight,
    ArrowUpRight,
} from 'lucide-react';
import { clsx } from 'clsx';

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

    const fetchLeaves = useCallback(async () => {
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
    }, [user, navigate]);

    useEffect(() => {
        if (user && user.company) {
            fetchLeaves();
        }
    }, [user, fetchLeaves]);

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
        const configs = {
            pending: {
                className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                label: t('common.leaveStatus.pending'),
                icon: Clock,
            },
            approved: {
                className:
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                label: t('common.leaveStatus.approved'),
                icon: CheckCircle2,
            },
            rejected: {
                className: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                label: t('common.leaveStatus.rejected'),
                icon: XCircle,
            },
        };

        const config = configs[status] || configs.pending;
        const StatusIcon = config.icon;

        return (
            <span
                className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider',
                    config.className,
                )}
            >
                <StatusIcon className="h-3.5 w-3.5" />
                {config.label}
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
        <div className="flex h-full select-none flex-col space-y-6 p-6 md:p-8">
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
            />
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="mr-2 md:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {t('leaves.myLeaves.title')}
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('leaves.myLeaves.subtitle')}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                    <Button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="w-full gap-2 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        {t('leaves.myLeaves.newRequest')}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: t('common.leaveStatus.pending'),
                            value: stats.pending,
                            color: 'text-amber-500',
                            icon: Clock,
                        },
                        {
                            label: t('common.leaveStatus.approved'),
                            value: stats.approved,
                            color: 'text-emerald-500',
                            icon: CheckCircle2,
                        },
                        {
                            label: t('common.leaveStatus.rejected'),
                            value: stats.rejected,
                            color: 'text-rose-500',
                            icon: XCircle,
                        },
                        {
                            label: t('leaves.myLeaves.stats.usedDays'),
                            value: stats.totalDays,
                            color: 'text-primary',
                            icon: CalendarDays,
                        },
                    ].map((stat, i) => (
                        <Card
                            key={stat.label}
                            className="border-border bg-card shadow-sm transition-all hover:shadow-md"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon
                                    className={`h-4 w-4 ${stat.color}`}
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2 text-2xl font-bold text-foreground">
                                    <AnimatedNumber value={stat.value} />
                                    {i === 3 && (
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {t('common.days')}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Content Container */}
                <div className="relative overflow-hidden rounded-md border border-border bg-card">
                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-muted/40">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('common.type')}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('common.dates')}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('common.days')}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('common.status')}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('common.reason')}
                                    </th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {leaves.map((leave) => (
                                    <tr
                                        key={leave._id}
                                        className="group transition-all hover:bg-muted/30"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-foreground">
                                                {getLeaveTypeLabel(
                                                    leave.leaveType,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 font-medium text-muted-foreground">
                                                <span>
                                                    {new Date(
                                                        leave.startDate,
                                                    ).toLocaleDateString(
                                                        'pl-PL',
                                                    )}
                                                </span>
                                                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                                                <span>
                                                    {new Date(
                                                        leave.endDate,
                                                    ).toLocaleDateString(
                                                        'pl-PL',
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1 font-bold text-foreground">
                                                {leave.days}
                                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                    {t('common.days')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(leave.status)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div
                                                className="max-w-[200px] truncate text-sm font-medium text-muted-foreground"
                                                title={leave.reason}
                                            >
                                                {leave.reason || (
                                                    <span className="italic opacity-30">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {leave.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            leave._id,
                                                        )
                                                    }
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block md:hidden">
                        <div className="divide-y divide-border">
                            {leaves.map((leave) => (
                                <div
                                    key={leave._id}
                                    className="p-4 text-left transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {getLeaveTypeLabel(
                                                    leave.leaveType,
                                                )}
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {new Date(
                                                    leave.startDate,
                                                ).toLocaleDateString(
                                                    'pl-PL',
                                                )}{' '}
                                                -{' '}
                                                {new Date(
                                                    leave.endDate,
                                                ).toLocaleDateString('pl-PL')}
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {leave.days} {t('common.days')}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(leave.status)}
                                            {leave.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(
                                                            leave._id,
                                                        );
                                                    }}
                                                    className="inline-flex items-center p-1 text-rose-500 hover:text-rose-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {leaves.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="mb-3 text-4xl">🏝️</div>
                            <div className="text-base font-medium text-foreground">
                                {t('leaves.myLeaves.noLeaves')}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                {t('leaves.myLeaves.clickToAdd')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RequestLeaveModal
                key={showModal ? 'open' : 'closed'}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchLeaves}
            />
        </div>
    );
}
