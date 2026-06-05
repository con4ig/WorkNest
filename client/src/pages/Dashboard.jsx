import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { ChevronRight, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chartColors } from '../config/colors';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    PieChart,
    Pie,
    Cell,
    YAxis,
} from 'recharts';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useAuth } from '../context/useAuth';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { useCountUp } from '../hooks/useCountUp';

const CustomTooltip = ({ active, payload }) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
                <p className="text-sm font-semibold text-foreground">
                    {data.name}
                </p>
                <p className="text-xs text-muted-foreground">
                    {data.value}{' '}
                    {t('dashboard.stats.projectCount', {
                        count: data.value,
                    })}
                </p>
            </div>
        );
    }
    return null;
};

const ProjectProgressChart = ({ stats }) => {
    const { t } = useTranslation();
    const [hoveredSection, setHoveredSection] = useState(null);

    const totalProjects = Number(stats[0]?.value || 0);
    const completedProjects = Number(stats[1]?.value || 0);
    const runningProjects = Number(stats[2]?.value || 0);
    const pendingProjects = Number(stats[3]?.value || 0);

    const targetPercentage =
        totalProjects > 0
            ? Math.round((completedProjects / totalProjects) * 100)
            : 0;
    const animatedPercentage = useCountUp(targetPercentage);

    const chartData =
        totalProjects > 0
            ? [
                  {
                      name: t('dashboard.stats.completed'),
                      value: completedProjects,
                      color: chartColors.success,
                  },
                  {
                      name: t('dashboard.stats.inProgress'),
                      value: runningProjects,
                      color: chartColors.warning,
                  },
                  {
                      name: t('dashboard.stats.pending'),
                      value: pendingProjects,
                      color: chartColors.pending,
                  },
              ].filter((item) => item.value > 0)
            : [
                  {
                      name: t('dashboard.charts.noData'),
                      value: 1,
                      color: chartColors.muted,
                  },
              ];

    return (
        <div className="flex w-full flex-col gap-4 p-4">
            <h3 className="text-base font-bold tracking-tight text-foreground sm:text-xl">
                {t('dashboard.charts.projectProgress') || 'Project Progress'}
            </h3>

            {/* On mobile: chart centered, legend below. On sm+: side by side */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-start sm:gap-8">
                {/* Pie chart */}
                <div className="relative flex-shrink-0">
                    <div className="h-28 w-28 sm:h-32 sm:w-32">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                            minWidth={0}
                            minHeight={0}
                        >
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={55}
                                    dataKey="value"
                                    stroke="none"
                                    onMouseEnter={(_, index) =>
                                        setHoveredSection(index)
                                    }
                                    onMouseLeave={() => setHoveredSection(null)}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            opacity={
                                                hoveredSection === null ||
                                                hoveredSection === index
                                                    ? 1
                                                    : 0.6
                                            }
                                            style={{
                                                transition: 'opacity 0.3s ease',
                                            }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            {animatedPercentage}%
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            {t('dashboard.charts.overall') || 'OVERALL'}
                        </span>
                    </div>
                </div>

                {/* Legend — row on mobile (compact), column on sm+ */}
                <div className="flex w-full flex-row justify-around gap-2 sm:min-w-[140px] sm:flex-col sm:space-y-4">
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_6px_rgba(16,185,129,0.4)] sm:h-3 sm:w-3" />
                            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                {t('dashboard.stats.completed')}
                            </span>
                        </div>
                        <span className="text-base font-bold text-foreground sm:text-sm">
                            {stats[1]?.value || '0'}
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)] sm:h-3 sm:w-3" />
                            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                {t('dashboard.stats.inProgress')}
                            </span>
                        </div>
                        <span className="text-base font-bold text-foreground sm:text-sm">
                            {stats[2]?.value || '0'}
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground sm:h-3 sm:w-3" />
                            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                {t('dashboard.stats.pending')}
                            </span>
                        </div>
                        <span className="text-base font-bold text-foreground sm:text-sm">
                            {stats[3]?.value || '0'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [rawActivity, setRawActivity] = useState([]);

    // Re-format activity labels when language changes — no refetch needed
    const weeklyActivity = useMemo(() => {
        if (!rawActivity.length) return [];
        const activityMap = rawActivity.reduce((acc, item) => {
            acc[item.date] = item.count;
            return acc;
        }, {});
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(today);
            day.setDate(today.getDate() - (6 - i));
            const dayString = format(day, 'yyyy-MM-dd');
            return {
                day: format(day, 'EEE', {
                    locale: i18n.language === 'pl' ? pl : undefined,
                }),
                fullDate: dayString,
                val: activityMap[dayString] || 0,
            };
        });
    }, [rawActivity, i18n.language]);

    const formatProjectDate = (endDate) => {
        if (!endDate) return t('common.notSpecified');
        try {
            return format(new Date(endDate), 'dd MMM yyyy', {
                locale: i18n.language === 'pl' ? pl : undefined,
            });
        } catch {
            return t('common.invalidDate');
        }
    };

    const fetchDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const companyId = user.company?._id;
            if (!companyId) {
                setLoading(false);
                return;
            }

            const dataPromises = [
                api.get('/projects', {
                    params: {
                        sortBy: 'createdAt:desc',
                        limit: 4,
                        company: companyId,
                        isArchived: 'false',
                    },
                }),
                api.get('/projects/stats/weekly-activity', {
                    params: { company: companyId },
                }),
            ];

            if (
                user.role === 'admin' ||
                user.role === 'hr' ||
                user.role === 'superadmin'
            ) {
                dataPromises.push(
                    api.get(`/projects/stats/summary`, {
                        params: { company: companyId },
                    }),
                );
            } else {
                dataPromises.push(
                    api.get(
                        `/projects/users/${user._id}/assigned-projects/summary`,
                        {
                            params: { company: companyId },
                        },
                    ),
                );
            }

            const [projectsRes, activityRes, statsRes] =
                await Promise.all(dataPromises);

            if (
                user.role === 'admin' ||
                user.role === 'hr' ||
                user.role === 'superadmin'
            ) {
                const { total, running, pending, completed } = statsRes.data;
                setStats([
                    {
                        id: 1,
                        titleKey: 'allProjects',
                        value: total.toString(),
                    },
                    {
                        id: 2,
                        titleKey: 'completedFull',
                        value: completed.toString(),
                    },
                    {
                        id: 3,
                        titleKey: 'inProgress',
                        value: running.toString(),
                    },
                    {
                        id: 4,
                        titleKey: 'pending',
                        value: pending.toString(),
                    },
                ]);
            } else {
                const { assigned, completed, running, pending } = statsRes.data;
                setStats([
                    {
                        id: 1,
                        titleKey: 'myProjects',
                        value: assigned.toString(),
                    },
                    {
                        id: 2,
                        titleKey: 'completed',
                        value: completed.toString(),
                    },
                    {
                        id: 3,
                        titleKey: 'inProgress',
                        value: running.toString(),
                    },
                    {
                        id: 4,
                        titleKey: 'pending',
                        value: pending.toString(),
                    },
                ]);
            }

            setProjects(projectsRes.data.projects);

            // Store raw API data — formatting handled by useMemo (language-reactive)
            setRawActivity(activityRes.data);
        } catch {
            // Silent error handling
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
        // fetchDashboardData is intentionally omitted: it is defined as a plain
        // async function and would change on every render, causing an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (loading) {
        return <LoadingScreen message={t('dashboard.loading')} />;
    }

    return (
        <div className="flex h-full select-none flex-col space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
            {/* Header — compact on mobile */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                        {t('dashboard.welcome', {
                            name: user?.firstName || user?.username,
                        })}
                    </h1>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                        {t('dashboard.overview')}
                    </p>
                </div>
                <div className="ml-3 flex shrink-0 flex-col items-end gap-2">
                    {(user?.role === 'admin' || user?.role === 'hr') && (
                        <Button
                            onClick={() => navigate('/generate-code')}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs"
                        >
                            <Key className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                                {t('dashboard.generateCode')}
                            </span>
                            <span className="sm:hidden">Kod</span>
                        </Button>
                    )}
                    <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                        {format(new Date(), 'd MMM', {
                            locale: i18n.language === 'pl' ? pl : undefined,
                        })}
                    </div>
                </div>
            </div>

            {/* Top Section: Stats + Project Progress */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                {/* Stats — single panel, internal dividers, varied visual weight */}
                <div className="col-span-1 lg:col-span-8 lg:h-full">
                    <div className="grid h-full grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-4 sm:divide-y-0">
                        {stats.map((stat, idx) => {
                            const accents = [
                                null,
                                'bg-primary',
                                'bg-amber-500',
                                'bg-muted-foreground',
                            ];
                            const accent = accents[idx];
                            return (
                                <div
                                    key={stat.id}
                                    className="flex flex-col justify-between gap-3 p-5 sm:p-6"
                                >
                                    <div className="flex items-center gap-2">
                                        {accent && (
                                            <span
                                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent}`}
                                            />
                                        )}
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                                            {t(
                                                `dashboard.stats.${stat.titleKey}`,
                                            )}
                                        </span>
                                    </div>
                                    <div
                                        className={`font-black leading-none tracking-tight text-foreground ${idx === 0 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}
                                    >
                                        <AnimatedNumber value={stat.value} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Project Progress Chart */}
                <Card
                    className="col-span-1 select-none border-border bg-card shadow-sm lg:col-span-4"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <CardContent className="flex h-full items-center justify-center p-0">
                        <ProjectProgressChart stats={stats} />
                    </CardContent>
                </Card>
            </div>

            {/* Middle Section: Weekly Activity */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="font-semibold text-foreground">
                        {t('dashboard.charts.activity')}
                    </CardTitle>
                    <CardDescription className="text-xs tracking-wide text-muted-foreground">
                        {t('dashboard.charts.activityDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent
                    className="select-none pl-0"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <div className="h-[300px] select-none">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                            minWidth={0}
                            minHeight={0}
                        >
                            <BarChart
                                data={weeklyActivity}
                                className="select-none"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="rgb(var(--border))"
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: 'rgb(var(--muted-foreground))',
                                        fontSize: 12,
                                    }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: 'rgb(var(--muted-foreground))',
                                        fontSize: 12,
                                    }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgb(var(--muted))' }}
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--card))',
                                        border: '1px solid rgb(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        userSelect: 'none',
                                        boxShadow:
                                            '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                />
                                <Bar
                                    dataKey="val"
                                    fill="rgb(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader className="mb-4 flex flex-row items-center justify-between border-b border-border pb-4">
                    <div>
                        <CardTitle className="font-semibold text-foreground">
                            {t('dashboard.recentProjects.title')}
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs tracking-wide text-muted-foreground">
                            {t('dashboard.recentProjects.desc')}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => navigate('/projects')}
                    >
                        {t('common.viewAll')}{' '}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 sm:space-y-4">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <div
                                    key={project._id}
                                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-muted active:scale-[0.99] sm:p-4"
                                    onClick={() =>
                                        navigate(`/projects/${project._id}`)
                                    }
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 ${
                                                project.status === 'completed'
                                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                                    : project.status ===
                                                        'in_progress'
                                                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                                                      : 'border-border bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-semibold text-foreground">
                                                {project.name}
                                            </h3>
                                            <p className="text-[10px] tracking-wide text-muted-foreground sm:text-xs">
                                                {t('common.deadline')}:{' '}
                                                {formatProjectDate(
                                                    project.endDate,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-2 shrink-0 text-right">
                                        <div className="text-sm font-bold text-foreground">
                                            {project.tasks?.filter(
                                                (t) => t.status === 'completed',
                                            )?.length || 0}
                                            <span className="font-normal text-muted-foreground">
                                                /{project.tasks?.length || 0}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {t('common.tasks')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-sm tracking-wide text-muted-foreground">
                                {t('dashboard.noProjects')}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <footer className="mt-8 pb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
                © {new Date().getFullYear()} WorkNest - {t('footer.Rights')}
            </footer>
        </div>
    );
}
