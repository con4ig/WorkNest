import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api.js';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { useAuth } from '../context/AuthContext';
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

// Komponent do wyświetlania wykresu postępu projektu
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

    // Dane dla wykresu kołowego z wszystkimi statusami
    const chartData =
        totalProjects > 0
            ? [
                  {
                      name: t('dashboard.stats.completed'),
                      value: completedProjects,
                      color: '#10B981', // Emerald 500
                  },
                  {
                      name: t('dashboard.stats.inProgress'),
                      value: runningProjects,
                      color: '#F59E0B', // Amber 500
                  },
                  {
                      name: t('dashboard.stats.pending'),
                      value: pendingProjects,
                      color: '#94A3B8', // Slate 400
                  },
              ].filter((item) => item.value > 0)
            : [
                  {
                      name: t('dashboard.charts.noData'),
                      value: 1,
                      color: '#E2E8F0', // Slate 200
                  },
              ];

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

    return (
        <div className="flex w-full flex-col gap-6 p-4">
            {/* Tytuł z podkreśleniem */}
            <h3 className="w-fit text-xl font-bold text-foreground">
                Postęp Projektów
            </h3>

            {/* Kontener wykresu i legendy obok siebie */}
            <div className="flex items-center justify-start gap-8">
                {/* Wykres kołowy */}
                <div className="relative flex-shrink-0">
                    <div className="h-32 w-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={60}
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
                    {/* Central percentage stats */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            {animatedPercentage}%
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            OGÓLNIE
                        </span>
                    </div>
                </div>

                {/* Legenda po prawej */}
                <div className="flex min-w-[140px] flex-col space-y-4">
                    {/* Reference: "zakonczone w trakc" -> Keeping consistent with translation keys but styling as requested */}

                    {/* Completed */}
                    <div className="group flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                            <span className="text-sm font-semibold text-muted-foreground">
                                {t('dashboard.stats.completed')}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                            {stats[1]?.value || '1'}
                        </span>
                    </div>

                    {/* In Progress */}
                    <div className="group flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                            <span className="text-sm font-semibold text-muted-foreground">
                                {t('dashboard.stats.inProgress')}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                            {stats[2]?.value || '1'}
                        </span>
                    </div>

                    {/* Pending */}
                    <div className="group flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-muted-foreground shadow-[0_0_6px_rgba(148,163,184,0.4)]" />
                            <span className="text-sm font-semibold text-muted-foreground">
                                {t('dashboard.stats.pending')}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                            {stats[3]?.value || '1'}
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
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [stats, setStats] = useState([]);
    const [profileImage, setProfileImage] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const [weeklyActivity, setWeeklyActivity] = useState([]);

    useEffect(() => {
        // moment.locale(i18n.language); // Removed as we switched to date-fns
    }, [i18n.language]);

    // Połączona funkcja do pobierania wszystkich danych
    const fetchDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            setUsername(user.username);
            setRole(user.role);
            setProfileImage(user.profileImage);

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

            // Przetwarzanie danych aktywności
            const rawActivity = activityRes.data;
            const activityMap = rawActivity.reduce((acc, item) => {
                acc[item.date] = item.count;
                return acc;
            }, {});

            const processedActivityData = [];
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const day = new Date(today);
                day.setDate(today.getDate() - i);
                const dayString = format(day, 'yyyy-MM-dd');
                processedActivityData.push({
                    day: format(day, 'EEE', {
                        locale: i18n.language === 'pl' ? pl : undefined,
                    }),
                    fullDate: dayString,
                    val: activityMap[dayString] || 0,
                });
            }
            setWeeklyActivity(processedActivityData);
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
    }, [user, i18n.language]);

    if (loading) {
        return <LoadingScreen message={t('dashboard.loading')} />;
    }

    return (
        <div className="flex h-full select-none flex-col space-y-6 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        {t('dashboard.welcome', {
                            name: user?.firstName || user?.username,
                        })}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('dashboard.overview')}
                    </p>
                </div>
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {format(new Date(), 'EEEE, d MMMM yyyy', {
                        locale: i18n.language === 'pl' ? pl : undefined,
                    })}
                </div>
            </div>

            {/* Top Section: Stats Cards + Project Progress */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Stats Cards (Left Side) */}
                <div className="col-span-1 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card
                            key={stat.id}
                            className="border-border bg-card shadow-sm transition-all hover:shadow-md"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {t(`dashboard.stats.${stat.titleKey}`)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tracking-tight text-foreground">
                                    <AnimatedNumber value={stat.value} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Project Progress Chart (Right Side) */}
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
                        <ResponsiveContainer width="100%" height="100%">
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
                                    barSize={40}
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
                        className="hover:bg-primary/10 text-primary hover:text-primary"
                        onClick={() => navigate('/projects')}
                    >
                        {t('common.viewAll')}{' '}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <div
                                    key={project._id}
                                    className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                                    onClick={() =>
                                        navigate(`/projects/${project._id}`)
                                    }
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                                                project.status === 'completed'
                                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                                    : project.status ===
                                                        'in_progress'
                                                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                                                      : 'border-border bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {project.name}
                                            </h3>
                                            <p className="text-xs tracking-wide text-muted-foreground">
                                                {t('common.deadline')}:{' '}
                                                {(() => {
                                                    try {
                                                        return project.endDate
                                                            ? format(
                                                                  new Date(
                                                                      project.endDate,
                                                                  ),
                                                                  'dd MMM yyyy',
                                                                  {
                                                                      locale:
                                                                          i18n.language ===
                                                                          'pl'
                                                                              ? pl
                                                                              : undefined,
                                                                  },
                                                              )
                                                            : t(
                                                                  'common.notSpecified',
                                                              );
                                                    } catch (e) {
                                                        return t(
                                                            'common.invalidDate',
                                                        );
                                                    }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-foreground">
                                            {
                                                project.tasks?.filter(
                                                    (t) =>
                                                        t.status ===
                                                        'completed',
                                                ).length
                                            }
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

            <footer className="mt-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
                © {new Date().getFullYear()} WorkNest - {t('footer.Rights')}
            </footer>
        </div>
    );
}
