import React from 'react';
import { Eye, Check, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import {
    getStatusBadgeColor,
    getStatusLabel,
    getLeaveTypeLabel,
} from './LeaveHelpers';

const LeaveList = ({
    leaves,
    handleApproveClick,
    setSelectedLeave,
    setShowRejectModal,
    t,
    i18n,
}) => {
    if (leaves.length === 0) {
        return (
            <div className="py-16 text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Eye
                            className="h-8 w-8 text-muted-foreground/50"
                            strokeWidth={1.5}
                        />
                    </div>
                </div>
                <div className="text-base font-medium text-foreground">
                    {t('leaves.approvals.noRequests')}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                    {t('common.tryDifferentSearch')}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
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
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-foreground">
                                        {getLeaveTypeLabel(leave.leaveType, t)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-sm">
                                        <span className="font-medium text-foreground">
                                            {new Date(
                                                leave.startDate,
                                            ).toLocaleDateString(i18n.language)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {t('leaves.approvals.to')}{' '}
                                            {new Date(
                                                leave.endDate,
                                            ).toLocaleDateString(i18n.language)}
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
                                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(leave.status)}`}
                                    >
                                        {getStatusLabel(leave.status, t)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {leave.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-3">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleApproveClick(
                                                        leave._id,
                                                    )
                                                }
                                                className="h-11 w-11 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 sm:h-8 sm:w-8"
                                                title={t(
                                                    'leaves.approvals.approve',
                                                )}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedLeave(leave._id);
                                                    setShowRejectModal(true);
                                                }}
                                                className="h-11 w-11 text-destructive hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-8"
                                                title={t(
                                                    'leaves.approvals.reject',
                                                )}
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
                                                            leave.reviewedBy
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
                                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeColor(leave.status)}`}
                                >
                                    {getStatusLabel(leave.status, t)}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {t('common.type')}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {getLeaveTypeLabel(leave.leaveType, t)}
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
                                        ).toLocaleDateString(i18n.language)}
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
                                            type="button"
                                            className="flex-1 gap-2"
                                            size="sm"
                                            onClick={() =>
                                                handleApproveClick(leave._id)
                                            }
                                        >
                                            <Check className="h-4 w-4" />
                                            {t('leaves.approvals.approve')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 gap-2"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedLeave(leave._id);
                                                setShowRejectModal(true);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                            {t('leaves.approvals.reject')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default LeaveList;
