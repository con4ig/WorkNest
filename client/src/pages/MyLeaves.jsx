import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import RequestLeaveModal from '../components/RequestLeaveModal';
import { useAuth } from '../context/useAuth';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

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
        <div className="min-h-screen select-none bg-background pb-12 text-muted-foreground">
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
            <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-8 sm:py-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-sm transition-all hover:bg-muted/80 hover:text-foreground active:scale-95"
                            >
                                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                            </button>
                            <div className="h-8 w-px bg-border"></div>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl">
                                    {t('leaves.myLeaves.title')}
                                </h1>
                                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                                    {t('leaves.myLeaves.subtitle')}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
                        >
                            <Plus className="h-5 w-5 stroke-[3]" />
                            <span className="uppercase tracking-wide">
                                {t('leaves.myLeaves.newRequest')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-10">
                {/* Stats */}
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: t('common.leaveStatus.pending'),
                            value: stats.pending,
                            color: 'text-amber-500',
                            icon: Clock,
                            bg: 'bg-amber-500/5',
                        },
                        {
                            label: t('common.leaveStatus.approved'),
                            value: stats.approved,
                            color: 'text-emerald-500',
                            icon: CheckCircle2,
                            bg: 'bg-emerald-500/5',
                        },
                        {
                            label: t('common.leaveStatus.rejected'),
                            value: stats.rejected,
                            color: 'text-rose-500',
                            icon: XCircle,
                            bg: 'bg-rose-500/5',
                        },
                        {
                            label: t('leaves.myLeaves.stats.usedDays'),
                            value: stats.totalDays,
                            color: 'text-primary',
                            icon: CalendarDays,
                            bg: 'bg-primary/5',
                        },
                    ].map((stat, i) => (
                        <div
                            key={stat.label}
                            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
                        >
                            <div
                                className={clsx(
                                    'absolute -right-4 -top-4 rounded-full p-8 opacity-10',
                                    stat.bg,
                                )}
                            >
                                <stat.icon
                                    className={clsx('h-12 w-12', stat.color)}
                                />
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    {stat.label}
                                </span>
                                <div
                                    className={clsx(
                                        'mt-2 flex items-baseline gap-2 text-4xl font-black',
                                        stat.color,
                                    )}
                                >
                                    {stat.value}
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {i === 3
                                            ? t('common.days')
                                            : t('common.requests')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Container */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto lg:block">
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
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-foreground">
                                                    {getLeaveTypeLabel(
                                                        leave.leaveType,
                                                    )}
                                                </span>
                                            </div>
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
                    <div className="block divide-y divide-border lg:hidden">
                        {leaves.map((leave) => (
                            <div
                                key={leave._id}
                                className="space-y-4 p-6 transition-colors active:bg-white/[0.02]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold tracking-tight text-foreground">
                                                {getLeaveTypeLabel(
                                                    leave.leaveType,
                                                )}
                                            </div>
                                            <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                                {leave.days} {t('common.days')}
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(leave.status)}
                                </div>

                                <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Termin
                                        </span>
                                        <div className="flex items-center gap-2 font-bold text-foreground">
                                            <span>
                                                {new Date(
                                                    leave.startDate,
                                                ).toLocaleDateString('pl-PL')}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {new Date(
                                                    leave.endDate,
                                                ).toLocaleDateString('pl-PL')}
                                            </span>
                                        </div>
                                    </div>
                                    {leave.reason && (
                                        <div className="border-t border-border pt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {t('leaves.myLeaves.reason') ||
                                                    'Reason'}
                                            </span>
                                            <p className="mt-1 text-sm font-medium italic leading-relaxed text-muted-foreground">
                                                "{leave.reason}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {leave.status === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteClick(leave._id)
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 py-3 font-bold text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                        <span className="text-xs uppercase tracking-wider">
                                            {t('common.delete')}
                                        </span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {leaves.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-ping"></div>
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                                    <CalendarDays className="h-10 w-10" />
                                </div>
                            </div>
                            <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-foreground">
                                {t('leaves.myLeaves.noLeaves')}
                            </h3>
                            <p className="max-w-[280px] text-sm font-medium leading-relaxed text-muted-foreground">
                                {t('leaves.myLeaves.clickToAdd')}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="mt-8 flex items-center gap-2 rounded-2xl bg-muted px-6 py-3 font-black uppercase tracking-widest text-foreground transition-all hover:bg-muted/80"
                            >
                                <Plus className="h-4 w-4 stroke-[3]" />
                                {t('leaves.myLeaves.newRequest')}
                            </button>
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
