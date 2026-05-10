import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    ChartLine,
    Home,
    CalendarCheck,
    ChevronRight,
    ChevronLeft,
    LogOut,
    Moon,
    Sun,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, isMobile }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { role, username, profileImage } = user || {};
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        navigate('/');
        setTimeout(logout, 0);
    };

    const NavItem = ({ to, icon: Icon, label, exact = false }) => {
        const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);

        const handleNav = () => {
            navigate(to);
            if (isMobile) setIsSidebarOpen(false);
        };

        return (
            <li
                role="link"
                tabIndex={0}
                onClick={handleNav}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav(); } }}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                    'group relative flex cursor-pointer items-center overflow-hidden rounded-lg transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isSidebarOpen
                        ? 'justify-start gap-3 px-4'
                        : 'justify-center px-2',
                    isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                    'py-3',
                )}
            >
                <Icon
                    className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground group-hover:text-secondary-foreground',
                    )}
                />
                {isSidebarOpen && (
                    <span className="animate-in fade-in overflow-hidden text-ellipsis whitespace-nowrap font-medium duration-300">
                        {label}
                    </span>
                )}
                {!isSidebarOpen && !isMobile && (
                    <div className="bg-popover text-popover-foreground absolute left-14 z-50 rounded-md border border-border px-2 py-1 text-xs opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                        {label}
                    </div>
                )}
            </li>
        );
    };

    return (
        <aside
            className={cn(
                'fixed z-40 h-screen overflow-hidden border-r border-border bg-background backdrop-blur-xl transition-all duration-300 ease-in-out',
                isSidebarOpen
                    ? 'w-72 shadow-2xl'
                    : isMobile
                      ? '-translate-x-full w-72'
                      : 'w-20',
                isMobile && 'rounded-r-2xl',
            )}
        >
            <div className="flex h-full flex-col p-4">
                {/* Header / Toggle */}
                <div className="mb-8 flex h-14 items-center justify-between">
                    {/* Collapsed State: Logo/Icon */}
                    {!isSidebarOpen && !isMobile && (
                        <div className="flex w-full justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(true)}
                                aria-label={t('dashboard.sidebar.expand', { defaultValue: 'Expand sidebar' })}
                            >
                                <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                            </Button>
                        </div>
                    )}

                    {/* Expanded State: User Profile */}
                    {(isSidebarOpen || isMobile) && (
                        <div className="flex w-full items-center justify-between overflow-hidden">
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="relative cursor-pointer transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                                    onClick={() => navigate('/upload')}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/upload'); }}
                                    aria-label={t('dashboard.sidebar.editProfile', { defaultValue: 'Edit profile' })}
                                >
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt={t('dashboard.sidebar.avatarAlt', { defaultValue: 'Profile picture', name: username })}
                                            loading="lazy"
                                            className="h-10 w-10 rounded-full border border-border object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                                            role="img"
                                            aria-label={`${username} avatar`}
                                        >
                                            {username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-primary"></div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold text-foreground">
                                        {username}
                                    </h3>
                                    <p className="truncate text-xs capitalize text-muted-foreground">
                                        {t(`common.roles.${role}`)}
                                    </p>
                                </div>
                            </div>

                            {!isMobile && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="-mr-2 text-muted-foreground hover:text-foreground"
                                    aria-label={t('dashboard.sidebar.collapse', { defaultValue: 'Collapse sidebar' })}
                                >
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="scrollbar-thin scrollbar-thumb-muted flex-1 overflow-y-auto overflow-x-hidden">
                    <ul className="space-y-1.5 px-1">
                        <NavItem
                            to="/dashboard"
                            icon={LayoutDashboard}
                            label={t('dashboard.sidebar.dashboard')}
                            exact
                        />
                        <NavItem
                            to="/projects"
                            icon={FolderKanban}
                            label={t('dashboard.sidebar.projects')}
                        />

                        {(role === 'hr' || role === 'admin') && (
                            <NavItem
                                to="/employees"
                                icon={Users}
                                label={t('dashboard.sidebar.team')}
                            />
                        )}

                        {(role === 'hr' || role === 'admin') && (
                            <NavItem
                                to="/leave-approvals"
                                icon={CalendarCheck}
                                label={t('dashboard.sidebar.approvals')}
                            />
                        )}

                        {(role === 'employee' || role === 'hr') && (
                            <NavItem
                                to="/myleaves"
                                icon={CalendarCheck}
                                label={t('dashboard.sidebar.leaves')}
                            />
                        )}

                        <div className="mx-2 my-4 border-t border-border"></div>

                        <NavItem
                            to="/"
                            icon={Home}
                            label={t('dashboard.sidebar.home')}
                            exact
                        />
                    </ul>
                </nav>

                {/* Footer */}
                <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
                    <Button
                        variant="ghost"
                        className={cn(
                            'justify-start text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                            !isSidebarOpen && 'justify-center',
                        )}
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? t('dashboard.sidebar.lightMode', { defaultValue: 'Switch to light mode' }) : t('dashboard.sidebar.darkMode', { defaultValue: 'Switch to dark mode' })}
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Moon className="h-5 w-5" aria-hidden="true" />
                        )}
                        {isSidebarOpen && (
                            <span className="ml-3 font-medium">
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        )}
                    </Button>

                    {isSidebarOpen ? (
                        <Button
                            variant="ghost"
                            className="border-destructive/20 bg-destructive/5 w-full justify-start gap-3 border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            <span>{t('dashboard.sidebar.logout')}</span>
                        </Button>
                    ) : (
                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="border-destructive/20 border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                aria-label={t('dashboard.sidebar.logout')}
                            >
                                <LogOut className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
