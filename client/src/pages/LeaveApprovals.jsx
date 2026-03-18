import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import CalendarComponent from '../components/CalendarComponent';
import {
    ArrowLeft,
    Check,
    Calendar,
    List,
    X,
    Eye,
    Menu,
    Search,
    Filter,
    Clock,
    UserCheck,
    UserX,
    MoreHorizontal,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function LeaveApprovals() {
    const { t, i18n } = useTranslation();
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
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
                console.error(t('leaves.approvals.authError'), err);
                navigate('/login');
            }
        };
        checkUserAccess();
        return () => {
            if (window.searchTimeout) clearTimeout(window.searchTimeout);
        };
    }, [navigate, t]);

    const fetchLeaves = useCallback(
        async (showLoader = false, searchQuery = '') => {
            if (!currentUser || !currentUser.company) return;
            try {
                if (showLoader) setLoading(true);
                const params = {
                    company: currentUser.company._id,
                    ...(filter !== 'all' && { status: filter }),
                    ...(searchQuery && { search: searchQuery }),
                };
                const res = await api.get('/leaves', { params });
                setLeaves(res.data.leaves);
            } catch (err) {
                console.error(t('leaves.approvals.fetchError'), err);
                if (err.response?.status === 401) navigate('/login');
            } finally {
                if (showLoader) setLoading(false);
            }
        },
        [filter, navigate, currentUser, t],
    );

    useEffect(() => {
        if (!currentUser) return;
        if (currentUser.role === 'admin' || currentUser.role === 'hr') {
            fetchLeaves(true);
        } else {
            setError(t('leaves.approvals.noPermissions'));
        }
    }, [currentUser, fetchLeaves, t]);

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
            await api.patch(`/leaves/${leaveToApprove}/approve`, {
                company: currentUser.company._id,
            });
            fetchLeaves();
            setShowApproveModal(false);
            setLeaveToApprove(null);
        } catch (err) {
            console.error(t('leaves.approvals.approveError'), err);
            showNotification(
                err.response?.data?.message ||
                    t('leaves.approvals.approveError'),
                'error',
            );
        }
    };

    const handleReject = async () => {
        if (!rejectNote.trim()) {
            showNotification(
                t('leaves.approvals.rejectReasonRequired'),
                'error',
            );
            return;
        }
        try {
            await api.patch(`/leaves/${selectedLeave}/reject`, {
                reviewNote: rejectNote,
                company: currentUser.company._id,
            });
            fetchLeaves();
            setShowRejectModal(false);
            setRejectNote('');
            setSelectedLeave(null);
            showNotification(t('leaves.approvals.rejectSuccess'));
        } catch (err) {
            console.error(t('leaves.approvals.rejectError'), err);
            showNotification(
                err.response?.data?.message ||
                    t('leaves.approvals.rejectError'),
                'error',
            );
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            approved:
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        };
        const labels = {
            pending: t('common.leaveStatus.pending'),
            approved: t('common.leaveStatus.approved'),
            rejected: t('common.leaveStatus.rejected'),
        };
        return (
            <span
                className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest',
                    styles[status],
                )}
            >
                <div
                    className={clsx(
                        'h-1 w-1 rounded-full bg-current',
                        status === 'pending' && 'animate-pulse',
                    )}
                />
                {labels[status]}
            </span>
        );
    };

    const getLeaveTypeLabel = (type) => {
        return t(`common.leaveType.${type}`);
    };

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans">
                <div className="border-rose-500/20 bg-rose-500/10 w-full max-w-md rounded-[2rem] border px-6 py-6 text-rose-500 shadow-sm">
                    <div className="mb-2 text-lg font-semibold">
                        {t('common.error')}
                    </div>
                    <div className="text-sm">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="hover:bg-destructive/90 mt-4 w-full rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-colors sm:w-auto"
                    >
                        {t('leaves.approvals.backToDashboard')}
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen message={t('leaves.approvals.loading')} />;
    }

    const stats = {
        pending: leaves.filter((l) => l.status === 'pending').length,
        approved: leaves.filter((l) => l.status === 'approved').length,
        rejected: leaves.filter((l) => l.status === 'rejected').length,
        total: leaves.length,
    };

    const filterTabs = [
        {
            value: 'pending',
            label: t('leaves.approvals.pending'),
            shortLabel: t('leaves.approvals.pendingShort'),
        },
        {
            value: 'approved',
            label: t('common.leaveStatus.approved'),
            shortLabel: t('leaves.approvals.approvedShort'),
        },
        {
            value: 'rejected',
            label: t('common.leaveStatus.rejected'),
            shortLabel: t('leaves.approvals.rejectedShort'),
        },
        {
            value: 'all',
            label: t('leaves.approvals.all'),
            shortLabel: t('leaves.approvals.allShort'),
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-white transition-colors duration-300">
            {/* Ambient Background */}
            <div className="bg-primary/20 fixed -left-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-50 dark:opacity-100" />
            <div className="bg-primary/10 fixed -bottom-20 -right-20 h-96 w-96 rounded-full blur-[120px] opacity-30 dark:opacity-100" />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
                {notification && (
                    <div
                        className={clsx(
                            'absolute left-1/2 top-4 z-[100] -translate-x-1/2 rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest shadow-2xl transition-all duration-500',
                            notification.type === 'success'
                                ? 'bg-primary text-black'
                                : 'bg-rose-500 text-white',
                        )}
                    >
                        {notification.message}
                    </div>
                )}
                <div
                    className={clsx(
                        'mx-auto py-4 transition-all duration-500',
                        viewMode === 'calendar'
                            ? 'max-w-none px-4 lg:px-8'
                            : 'max-w-7xl px-6 lg:px-10',
                    )}
                >
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                            >
                                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            </button>
                            <div className="hidden h-8 w-px bg-black/10 dark:bg-white/10 md:block" />
                            <div>
                                <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white md:text-2xl">
                                    {t('leaves.approvals.title')}
                                </h1>
                                <p className="hidden text-[10px] font-black uppercase tracking-widest text-zinc-500 md:block">
                                    {t('leaves.approvals.subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Desktop Actions */}
                            <div className="hidden items-center gap-4 lg:flex">
                                {/* Search Bar */}
                                <div className="group relative">
                                    <div className="bg-primary/20 absolute inset-0 rounded-xl opacity-0 blur transition-all group-focus-within:opacity-100" />
                                    <input
                                        type="text"
                                        placeholder={t(
                                            'leaves.approvals.searchPlaceholder',
                                        )}
                                        className="focus:border-primary/50 relative w-64 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-10 py-2.5 text-xs font-medium text-zinc-900 dark:text-white transition-all focus:outline-none focus:ring-0"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (window.searchTimeout)
                                                clearTimeout(
                                                    window.searchTimeout,
                                                );
                                            window.searchTimeout = setTimeout(
                                                () => {
                                                    fetchLeaves(false, val);
                                                },
                                                300,
                                            );
                                        }}
                                    />
                                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500 transition-colors group-focus-within:text-primary" />
                                </div>

                                {/* View Toggle */}
                                {filter !== 'rejected' && (
                                    <div className="flex rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 p-1">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={clsx(
                                                'rounded-lg p-2 transition-all',
                                                viewMode === 'list'
                                                    ? 'shadow-primary/20 bg-primary text-black shadow-lg'
                                                    : 'text-zinc-500 hover:text-zinc-200',
                                            )}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setViewMode('calendar')
                                            }
                                            className={clsx(
                                                'rounded-lg p-2 transition-all',
                                                viewMode === 'calendar'
                                                    ? 'shadow-primary/20 bg-primary text-black shadow-lg'
                                                    : 'text-zinc-500 hover:text-zinc-200',
                                            )}
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    setShowFilterMenu(!showFilterMenu)
                                }
                                className="rounded-xl bg-black/5 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 transition-all active:scale-95 lg:hidden"
                            >
                                <Filter className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs - Subheader style */}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setFilter(tab.value);
                                    if (tab.value === 'rejected')
                                        setViewMode('list');
                                }}
                                className={clsx(
                                    'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                                    filter === tab.value
                                        ? 'bg-primary/20 border-primary/30 border text-primary'
                                        : 'border border-transparent bg-black/5 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-300',
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div
                className={clsx(
                    'w-full py-6 transition-all duration-500 md:py-8',
                    viewMode === 'calendar'
                        ? 'max-w-none px-4 lg:px-8'
                        : 'mx-auto max-w-7xl px-4 md:px-8',
                )}
            >
                {viewMode === 'calendar' && filter !== 'rejected' ? (
                    <CalendarComponent
                        views={['month']}
                        leaves={leaves.filter((l) => l.status !== 'rejected')}
                        onEventClick={(event) => {
                            const leave = event.resource;
                            if (leave.status === 'pending') {
                                setLeaveToApprove(leave._id);
                                setShowApproveModal(true);
                            } else {
                                showNotification(
                                    t('leaves.approvals.leaveRequestStatus', {
                                        status: leave.status,
                                    }),
                                    'success',
                                );
                            }
                        }}
                    />
                ) : (
                    <>
                        {/* Stats */}
                        <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-4">
                            <div className="group relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-2xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                                <div className="bg-primary/10 dark:bg-primary/5 group-hover:bg-primary/20 dark:group-hover:bg-primary/10 absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl transition-all" />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                    {t('leaves.approvals.stats.all')}
                                </div>
                                <div className="mt-4 text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                    {stats.total}
                                </div>
                            </div>
                            <div className="group relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-2xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-2xl transition-all group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/10" />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                    {t('leaves.approvals.stats.pending')}
                                </div>
                                <div className="mt-4 text-3xl font-black tracking-tighter text-amber-500">
                                    {stats.pending}
                                </div>
                            </div>
                            <div className="group relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-2xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-2xl transition-all group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/10" />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                    {t('leaves.approvals.stats.approved')}
                                </div>
                                <div className="mt-4 text-3xl font-black tracking-tighter text-emerald-500">
                                    {stats.approved}
                                </div>
                            </div>
                            <div className="group relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-2xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-2xl transition-all group-hover:bg-rose-500/20 dark:group-hover:bg-rose-500/10" />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                    {t('leaves.approvals.stats.rejected')}
                                </div>
                                <div className="mt-4 text-3xl font-black tracking-tighter text-rose-500">
                                    {stats.rejected}
                                </div>
                            </div>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/30 shadow-2xl backdrop-blur-2xl md:block">
                            <table className="w-full">
                                <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                            {t('leaves.approvals.employee')}
                                        </th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                            {t('leaves.approvals.type')}
                                        </th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                            {t('leaves.approvals.dates')}
                                        </th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                            {t('leaves.approvals.days')}
                                        </th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                            {t('leaves.approvals.status')}
                                        </th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                            {t('leaves.approvals.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                    {leaves.map((leave) => (
                                        <tr
                                            key={leave._id}
                                            className="group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="from-primary/20 to-primary/5 border-primary/20 dark:border-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br font-black text-primary shadow-inner transition-transform group-hover:rotate-3 group-hover:scale-105">
                                                        {leave.user?.username
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-900 dark:text-white transition-colors group-hover:text-primary">
                                                            {leave.user
                                                                ?.username ||
                                                                t(
                                                                    'leaves.approvals.unknownUser',
                                                                )}
                                                        </div>
                                                        <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                                                            {leave.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                                    {getLeaveTypeLabel(
                                                        leave.leaveType,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                                        {new Date(
                                                            leave.startDate,
                                                        ).toLocaleDateString(
                                                            i18n.language,
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                                        {t(
                                                            'leaves.approvals.to',
                                                        )}{' '}
                                                        {new Date(
                                                            leave.endDate,
                                                        ).toLocaleDateString(
                                                            i18n.language,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                                    {leave.days}
                                                </span>
                                                <span className="ml-1 text-[8px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                                    {t('common.days')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {getStatusBadge(leave.status)}
                                            </td>
                                            <td className="px-8 py-6">
                                                {leave.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() =>
                                                                handleApproveClick(
                                                                    leave._id,
                                                                )
                                                            }
                                                            className="group/btn flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white dark:hover:text-black hover:shadow-lg hover:shadow-emerald-500/20 active:scale-90"
                                                        >
                                                            <Check className="h-4 w-4" />
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
                                                            className="group/btn flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 transition-all hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 active:scale-90"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                                        {leave.reviewedBy && (
                                                            <>
                                                                <span className="text-zinc-300 dark:text-zinc-600">
                                                                    Reviewed by
                                                                </span>
                                                                <span className="text-zinc-500 dark:text-zinc-400">
                                                                    {
                                                                        leave
                                                                            .reviewedBy
                                                                            .username
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {leaves.length === 0 && (
                                <div className="py-24 text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-300 dark:text-zinc-700">
                                        <Clock className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                                    </div>
                                    <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                                        {t('leaves.approvals.noRequests')}
                                    </h4>
                                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                        {t('leaves.approvals.noLeaveRequests')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Cards */}
                        <div className="space-y-6 md:hidden">
                            {leaves.map((leave) => (
                                <div
                                    key={leave._id}
                                    className="group overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-2xl"
                                >
                                    <div className="mb-6 flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="from-primary/20 to-primary/5 border-primary/20 dark:border-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br font-black text-primary shadow-inner">
                                                {leave.user?.username
                                                    ?.charAt(0)
                                                    .toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-white">
                                                    {leave.user?.username ||
                                                        t(
                                                            'leaves.approvals.unknownUser',
                                                        )}
                                                </div>
                                                <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                                                    {leave.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(leave.status)}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                                {t('common.type')}
                                            </span>
                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                {getLeaveTypeLabel(
                                                    leave.leaveType,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                                {t('common.dates')}
                                            </span>
                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                {new Date(
                                                    leave.startDate,
                                                ).toLocaleDateString(
                                                    i18n.language,
                                                )}{' '}
                                                -{' '}
                                                {new Date(
                                                    leave.endDate,
                                                ).toLocaleDateString(
                                                    i18n.language,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                                {t('common.days')}
                                            </span>
                                            <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                                {leave.days}
                                            </span>
                                        </div>

                                        <div className="rounded-[1.5rem] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/30 p-4">
                                            <span className="mb-2 block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                                                Reason
                                            </span>
                                            <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
                                                "{leave.reason}"
                                            </p>
                                        </div>

                                        {leave.status === 'pending' && (
                                            <div className="grid grid-cols-2 gap-3 pt-4">
                                                <button
                                                    onClick={() =>
                                                        handleApproveClick(
                                                            leave._id,
                                                        )
                                                    }
                                                    className="shadow-primary/20 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-black shadow-lg transition-all active:scale-95"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    {t(
                                                        'leaves.approvals.approve',
                                                    )}
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
                                                    className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white transition-all active:scale-95"
                                                >
                                                    <X className="h-4 w-4" />
                                                    {t(
                                                        'leaves.approvals.reject',
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Approve Confirmation Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl">
                        <div className="p-8">
                            <div className="bg-primary/10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-primary">
                                <UserCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                                {t('leaves.approvals.approveModalTitle')}
                            </h3>
                            <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {t('leaves.approvals.approveModalMessage')}
                            </p>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={confirmApprove}
                                    className="shadow-primary/20 w-full rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-[0.2em] text-black shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {t('leaves.approvals.confirm')}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setLeaveToApprove(null);
                                    }}
                                    className="w-full rounded-2xl bg-black/5 dark:bg-white/5 py-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                                >
                                    {t('leaves.approvals.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl">
                        <div className="p-8">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                                <UserX className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                                {t('leaves.approvals.rejectModalTitle')}
                            </h3>
                            <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {t('leaves.approvals.rejectModalMessage')}
                            </p>

                            <div className="mt-6">
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                    Reason for rejection
                                </label>
                                <textarea
                                    value={rejectNote}
                                    onChange={(e) =>
                                        setRejectNote(e.target.value)
                                    }
                                    rows="4"
                                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/50 p-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:border-rose-500/50 focus:outline-none"
                                    placeholder="Please provide a brief explanation..."
                                />
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={handleReject}
                                    className="w-full rounded-2xl bg-rose-500 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {t('leaves.approvals.reject')}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectNote('');
                                        setSelectedLeave(null);
                                    }}
                                    className="w-full rounded-2xl bg-black/5 dark:bg-white/5 py-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                                >
                                    {t('leaves.approvals.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
