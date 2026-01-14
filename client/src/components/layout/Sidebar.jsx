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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, isMobile }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { role, username, profileImage } = user || {};

    const handleLogout = () => {
        navigate('/');
        setTimeout(logout, 0);
    };

    const NavItem = ({ to, icon: Icon, label, exact = false }) => {
        const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);

        return (
            <li
                onClick={() => {
                    navigate(to);
                    if (isMobile) setIsSidebarOpen(false);
                }}
                className={cn(
                    'group relative flex cursor-pointer items-center overflow-hidden rounded-lg transition-all duration-200',
                    isSidebarOpen
                        ? 'justify-start gap-3 px-4'
                        : 'justify-center px-2',
                    isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    'py-3',
                )}
            >
                <Icon
                    className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive
                            ? 'text-white'
                            : 'text-slate-500 group-hover:text-slate-900',
                    )}
                />
                {isSidebarOpen && (
                    <span className="animate-in fade-in overflow-hidden text-ellipsis whitespace-nowrap font-medium duration-300">
                        {label}
                    </span>
                )}
                {!isSidebarOpen && !isMobile && (
                    <div className="absolute left-14 z-50 rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {label}
                    </div>
                )}
            </li>
        );
    };

    return (
        <aside
            className={cn(
                'fixed z-20 h-screen overflow-hidden border-r border-slate-200 bg-white/90 shadow-xl backdrop-blur-xl transition-all duration-300 ease-in-out',
                isSidebarOpen
                    ? 'w-64'
                    : isMobile
                      ? '-translate-x-full'
                      : 'w-20',
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
                            >
                                <ChevronRight className="h-5 w-5 text-slate-400" />
                            </Button>
                        </div>
                    )}

                    {/* Expanded State: User Profile */}
                    {(isSidebarOpen || isMobile) && (
                        <div className="flex w-full items-center justify-between overflow-hidden">
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className="relative cursor-pointer transition-transform hover:scale-105"
                                    onClick={() => navigate('/upload')}
                                >
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt="Avatar"
                                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white ring-2 ring-slate-100">
                                            {username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold text-slate-900">
                                        {username}
                                    </h3>
                                    <p className="truncate text-xs capitalize text-slate-500">
                                        {t(`common.roles.${role}`)}
                                    </p>
                                </div>
                            </div>

                            {!isMobile && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="-mr-2"
                                >
                                    <ChevronLeft className="h-5 w-5 text-slate-400" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="scrollbar-thin scrollbar-thumb-slate-200 flex-1 overflow-y-auto overflow-x-hidden">
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

                        <div className="mx-2 my-4 border-t border-slate-100"></div>

                        <NavItem
                            to="/"
                            icon={Home}
                            label={t('dashboard.sidebar.home')}
                            exact
                        />
                    </ul>
                </nav>

                {/* Footer */}
                <div className="mt-auto border-t border-slate-100 pt-4">
                    {isSidebarOpen ? (
                        <Button
                            variant="destructive"
                            className="w-full justify-start gap-2 border-0 bg-red-50 text-red-600 shadow-none hover:bg-red-100 hover:text-red-700"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>{t('dashboard.sidebar.logout')}</span>
                        </Button>
                    ) : (
                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
