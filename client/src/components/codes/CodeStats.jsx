import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import AnimatedNumber from '../ui/AnimatedNumber';
import { Key, Users, Clock } from 'lucide-react';

const CodeStats = ({ invitations, t }) => {
    const stats = [
        {
            id: 1,
            title: t('generateCode.activeInvitations'),
            value: invitations.filter((i) => new Date(i.expiresAt) > new Date())
                .length,
            icon: Key,
            color: 'text-primary',
        },
        {
            id: 2,
            title: t('generateCode.allUses'),
            value: invitations.reduce((acc, curr) => acc + curr.uses, 0),
            icon: Users,
            color: 'text-blue-500',
        },
        {
            id: 3,
            title: t('generateCode.expired'),
            value: invitations.filter(
                (i) => new Date(i.expiresAt) <= new Date(),
            ).length,
            icon: Clock,
            color: 'text-orange-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
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

export default CodeStats;
