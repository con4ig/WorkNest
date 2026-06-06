import React from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { Button } from '../../ui/Button';

export const ApproveModal = ({
    showApproveModal,
    confirmApprove,
    setShowApproveModal,
    setLeaveToApprove,
    t,
}) => {
    if (!showApproveModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="p-8">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserCheck className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        {t('leaves.approvals.approveModalTitle')}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('leaves.approvals.approveModalMessage')}
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                        <Button type="button" onClick={confirmApprove}>
                            {t('leaves.approvals.confirm')}
                        </Button>
                        <Button
                            type="button"
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
    );
};

export const RejectModal = ({
    showRejectModal,
    handleReject,
    rejectNote,
    setRejectNote,
    setShowRejectModal,
    setSelectedLeave,
    t,
}) => {
    if (!showRejectModal) return null;

    return (
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
                        <label
                            htmlFor="reject-reason"
                            className="mb-2 block text-xs font-semibold text-muted-foreground"
                        >
                            Reason for rejection
                        </label>
                        <textarea
                            id="reject-reason"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            rows="4"
                            className="w-full rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Please provide a brief explanation..."
                            aria-label="Reason for rejection"
                        />
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <Button
                            type="button"
                            onClick={handleReject}
                            variant="destructive"
                        >
                            {t('leaves.approvals.reject')}
                        </Button>
                        <Button
                            type="button"
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
    );
};
