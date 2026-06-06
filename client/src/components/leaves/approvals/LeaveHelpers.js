export const getStatusBadgeColor = (status) => {
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

export const getStatusLabel = (status, t) => {
    return t(`common.leaveStatus.${status}`);
};

export const getLeaveTypeLabel = (type, t) => {
    return t(`common.leaveType.${type}`);
};
