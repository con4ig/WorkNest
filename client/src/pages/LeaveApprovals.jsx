import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import CalendarComponent from '../components/CalendarComponent';
import { useAuth } from '../context/useAuth';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../components/ui/Card';

import {
    ApproveModal,
    RejectModal,
} from '../components/leaves/approvals/LeaveModals';
import LeaveStats from '../components/leaves/approvals/LeaveStats';
import LeaveHeader from '../components/leaves/approvals/LeaveHeader';
import LeaveList from '../components/leaves/approvals/LeaveList';
import Toast from '../components/ui/Toast';

export default function LeaveApprovals() {
    const { t, i18n } = useTranslation();
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [leaveToApprove, setLeaveToApprove] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
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
                        type="button"
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

    const filterTabs = [
        {
            value: 'pending',
            label: t('leaves.approvals.pending'),
        },
        {
            value: 'approved',
            label: t('common.leaveStatus.approved'),
        },
        {
            value: 'rejected',
            label: t('common.leaveStatus.rejected'),
        },
        {
            value: 'all',
            label: t('leaves.approvals.all'),
        },
    ];

    return (
        <div className="flex h-full select-none flex-col space-y-6 p-6 md:p-8">
            <LeaveHeader
                filter={filter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                navigate={navigate}
                t={t}
            />

            <LeaveStats leaves={leaves} t={t} />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    {filterTabs.map((tab) => (
                        <Button
                            type="button"
                            key={tab.value}
                            variant={
                                filter === tab.value ? 'secondary' : 'ghost'
                            }
                            size="sm"
                            onClick={() => {
                                setFilter(tab.value);
                                if (tab.value === 'rejected')
                                    setViewMode('list');
                            }}
                            className="text-xs font-semibold uppercase tracking-wider"
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {viewMode === 'calendar' && filter !== 'rejected' ? (
                    <Card className="border-border bg-card p-4 shadow-sm">
                        <CalendarComponent
                            views={['month']}
                            leaves={leaves.filter(
                                (l) => l.status !== 'rejected',
                            )}
                            onEventClick={(event) => {
                                const leave = event.resource;
                                if (leave.status === 'pending') {
                                    setLeaveToApprove(leave._id);
                                    setShowApproveModal(true);
                                } else {
                                    showNotification(
                                        t(
                                            'leaves.approvals.leaveRequestStatus',
                                            {
                                                status: leave.status,
                                            },
                                        ),
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
                                {t('leaves.approvals.requestsCount', {
                                    count: leaves.length,
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <LeaveList
                                leaves={leaves}
                                handleApproveClick={handleApproveClick}
                                setSelectedLeave={setSelectedLeave}
                                setShowRejectModal={setShowRejectModal}
                                t={t}
                                i18n={i18n}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <ApproveModal
                showApproveModal={showApproveModal}
                confirmApprove={confirmApprove}
                setShowApproveModal={setShowApproveModal}
                setLeaveToApprove={setLeaveToApprove}
                t={t}
            />

            <RejectModal
                showRejectModal={showRejectModal}
                handleReject={handleReject}
                rejectNote={rejectNote}
                setRejectNote={setRejectNote}
                setShowRejectModal={setShowRejectModal}
                setSelectedLeave={setSelectedLeave}
                t={t}
            />
        </div>
    );
}
