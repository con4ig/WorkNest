import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import AnimatedNumber from '../../ui/AnimatedNumber';
import { Clock, UserCheck, UserX } from 'lucide-react';

const LeaveStats = ({ leaves, t }) => {
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

    return (
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
    );
};

export default LeaveStats;
