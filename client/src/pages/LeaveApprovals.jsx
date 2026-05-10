import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import CalendarComponent from '../components/CalendarComponent';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    Check,
    Calendar,
    List,
    X,
    Search,
    Clock,
    UserCheck,
    UserX,
    Briefcase,
    AlertCircle,
    Eye,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

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
    const navigate = useNavigate();
    const { user: currentUser, loading: authLoading } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLeaves = useCallback(
        async (showLoader = false, query = '') => {
            if (authLoading || !currentUser || !currentUser.company) return;
            try {
                if (showLoader) setLoading(true);
                const params = {
                    company: currentUser.company._id,
                    ...(filter !== 'all' && { status: filter }),
                    ...(query && { search: query }),
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
        [filter, navigate, currentUser, authLoading, t],
    );

    useEffect(() => {
        if (authLoading || !currentUser) return;
        if (currentUser.role === 'admin' || currentUser.role === 'hr') {
            fetchLeaves(true);
        } else {
            setError(t('leaves.approvals.noPermissions'));
        }
    }, [currentUser, authLoading, fetchLeaves, t]);

    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeaves(false, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchLeaves]);

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

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'approved':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'rejected':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusLabel = (status) => {
        return t(`common.leaveStatus.${status}`);
    };

    const getLeaveTypeLabel = (type) => {
        return t(`common.leaveType.${type}`);
    };

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-xl border border-destructive/50 bg-card px-6 py-8 shadow-lg">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mb-2 text-center text-xl font-semibold text-foreground">
                        {t('common.errorOccurred')}
                    </div>
                    <div className="mb-6 text-center text-sm text-muted-foreground">
                        {error}
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full"
                    >
                        {t('employees.list.backToDashboard')}
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen message={t('leaves.approvals.loading')} />;
    }

    const statsData = [
        {
            id: 1,
            title: t('leaves.approvals.stats.pending'),
            value: leaves.filter((l) => l.status === 'pending').length,
            icon: Clock,
            color: 'text-amber-500',
        },
        {
            id: 2,
            title: t('leaves.approvals.stats.approved'),
            value: leaves.filter((l) => l.status === 'approved').length,
            icon: UserCheck,
            color: 'text-emerald-500',
        },
        {
            id: 3,
            title: t('leaves.approvals.stats.rejected'),
            value: leaves.filter((l) => l.status === 'rejected').length,
            icon: UserX,
            color: 'text-destructive',
        },
    ];

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
        <div className="flex h-full select-none flex-col space-y-6 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2">
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="mr-2 md:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {t('leaves.approvals.title')}
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('leaves.approvals.subtitle')}
                    </p>
                </div>
                
                 <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                     {/* View Toggle */}
                    {filter !== 'rejected' && (
                        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`rounded-md p-1.5 transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted'
                                }`}
                                title="List View"
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`rounded-md p-1.5 transition-all ${
                                    viewMode === 'calendar'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted'
                                }`}
                                title="Calendar View"
                            >
                                <Calendar className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                     <div className="relative w-full sm:w-auto">
                        <input
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[250px]"
                            placeholder={t('leaves.approvals.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {statsData.map((stat) => (
                    <Card
                        key={stat.id}
                        className="border-border bg-card shadow-sm transition-all hover:shadow-md"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight text-foreground">
                                <AnimatedNumber value={stat.value} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-4">
                {/* Filters */}
                 <div className="flex flex-wrap items-center gap-2">
                    {filterTabs.map((tab) => (
                        <Button
                                key={tab.value}
                                variant={filter === tab.value ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => {
                                    setFilter(tab.value);
                                    if (tab.value === 'rejected')
                                        setViewMode('list');
                                }}
                                className="text-xs uppercase tracking-wider font-semibold"
                            >
                                {tab.label}
                        </Button>
                    ))}
                </div>

                {viewMode === 'calendar' && filter !== 'rejected' ? (
                    <Card className="border-border bg-card shadow-sm p-4">
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
                    </Card>
                ) : (
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-semibold text-foreground">
                                {t('leaves.approvals.requestsList')}
                            </CardTitle>
                            <CardDescription className="text-xs tracking-wide text-muted-foreground">
                                {t('leaves.approvals.requestsCount', { count: leaves.length })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                        <div className="hidden md:block">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {t('leaves.approvals.employee')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {t('leaves.approvals.type')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {t('leaves.approvals.dates')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {t('leaves.approvals.days')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {t('leaves.approvals.status')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {t('leaves.approvals.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {leaves.map((leave) => (
                                        <tr
                                            key={leave._id}
                                            className="cursor-pointer transition-colors hover:bg-muted/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary shadow-sm">
                                                        {leave.user?.username
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            {leave.user
                                                                ?.username ||
                                                                t(
                                                                    'leaves.approvals.unknownUser',
                                                                )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {leave.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-foreground">
                                                    {getLeaveTypeLabel(
                                                        leave.leaveType,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <span className="font-medium text-foreground">
                                                        {new Date(
                                                            leave.startDate,
                                                        ).toLocaleDateString(
                                                            i18n.language,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
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
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {leave.days}
                                                </span>
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                    {t('common.days')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                                                        leave.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(leave.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {leave.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleApproveClick(
                                                                    leave._id,
                                                                )
                                                            }
                                                            className="h-11 w-11 sm:h-8 sm:w-8 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                                                            title={t('leaves.approvals.approve')}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedLeave(
                                                                    leave._id,
                                                                );
                                                                setShowRejectModal(
                                                                    true,
                                                                );
                                                            }}
                                                            className="h-11 w-11 sm:h-8 sm:w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            title={t('leaves.approvals.reject')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                                                        {leave.reviewedBy && (
                                                            <>
                                                                <span className="opacity-70">
                                                                    Reviewed by
                                                                </span>
                                                                <span className="font-medium text-foreground">
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
                                <div className="py-16 text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <Eye className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="text-base font-medium text-foreground">
                                        {t('leaves.approvals.noRequests')}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {t('common.tryDifferentSearch')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Cards */}
                        <div className="block md:hidden">
                            <div className="divide-y divide-border">
                            {leaves.map((leave) => (
                                <div
                                    key={leave._id}
                                        className="p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                                                {leave.user?.username
                                                    ?.charAt(0)
                                                    .toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                    <div className="font-semibold text-foreground">
                                                    {leave.user?.username ||
                                                        t(
                                                            'leaves.approvals.unknownUser',
                                                        )}
                                                </div>
                                                    <div className="text-sm text-muted-foreground">
                                                    {leave.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeColor(
                                                    leave.status
                                                )}`}
                                            >
                                                {getStatusLabel(leave.status)}
                                            </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                {t('common.type')}
                                            </span>
                                                <span className="text-sm font-medium text-foreground">
                                                {getLeaveTypeLabel(
                                                    leave.leaveType,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                {t('common.dates')}
                                            </span>
                                                <span className="text-sm font-medium text-foreground">
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
                                                <span className="text-xs font-medium text-muted-foreground">
                                                {t('common.days')}
                                            </span>
                                                <span className="text-base font-bold text-foreground">
                                                {leave.days}
                                            </span>
                                        </div>

                                            {leave.reason && (
                                                <div className="rounded-lg border border-border bg-muted/20 p-3">
                                                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                                                Reason
                                            </span>
                                                    <p className="text-sm text-foreground">
                                                "{leave.reason}"
                                            </p>
                                        </div>
                                            )}

                                        {leave.status === 'pending' && (
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        className="flex-1 gap-2"
                                                        size="sm"
                                                    onClick={() =>
                                                        handleApproveClick(
                                                            leave._id,
                                                        )
                                                    }
                                                >
                                                    <Check className="h-4 w-4" />
                                                    {t(
                                                        'leaves.approvals.approve',
                                                    )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 gap-2"
                                                        size="sm"
                                                    onClick={() => {
                                                        setSelectedLeave(
                                                            leave._id,
                                                        );
                                                        setShowRejectModal(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                    {t(
                                                        'leaves.approvals.reject',
                                                    )}
                                                    </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            </div>
                             {leaves.length === 0 && (
                                <div className="py-16 text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <Eye className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="text-base font-medium text-foreground">
                                        {t('leaves.approvals.noRequests')}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {t('common.tryDifferentSearch')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                )}
            </div>

             {notification && (
                 <div className={`fixed top-4 right-4 z-50 rounded-md p-4 shadow-md ${
                     notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'
                 }`}>
                     {notification.message}
                 </div>
            )}

            {/* Approve Confirmation Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                        <div className="p-8">
                            <div className="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-full text-primary">
                                <UserCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                {t('leaves.approvals.approveModalTitle')}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('leaves.approvals.approveModalMessage')}
                            </p>

                            <div className="mt-6 flex flex-col gap-3">
                                <Button
                                    onClick={confirmApprove}
                                >
                                    {t('leaves.approvals.confirm')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setLeaveToApprove(null);
                                    }}
                                >
                                    {t('leaves.approvals.cancel')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                        <div className="p-8">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                <UserX className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                {t('leaves.approvals.rejectModalTitle')}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('leaves.approvals.rejectModalMessage')}
                            </p>

                            <div className="mt-6">
                                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                                    Reason for rejection
                                </label>
                                <textarea
                                    value={rejectNote}
                                    onChange={(e) =>
                                        setRejectNote(e.target.value)
                                    }
                                    rows="4"
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Please provide a brief explanation..."
                                />
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <Button
                                    onClick={handleReject}
                                    variant="destructive"
                                >
                                    {t('leaves.approvals.reject')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectNote('');
                                        setSelectedLeave(null);
                                    }}
                                >
                                    {t('leaves.approvals.cancel')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
