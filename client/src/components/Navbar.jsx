import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,
    LogOut,
    UserPlus,
    LogIn,
    LayoutDashboard,
} from 'lucide-react';
import LanguageSwitcher from './common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
        setTimeout(logout, 0);
    };

    const navItemClass =
        'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-white/10 hover:text-emerald-700 dark:hover:text-white transition-all duration-300';
    const buttonPrimaryClass =
        'px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/50 transition-all duration-300 transform hover:scale-[1.02]';
    const buttonSecondaryClass =
        'px-5 py-2.5 rounded-full text-sm font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all duration-300';

    return (
        <nav className="sticky top-0 z-50 border-b border-emerald-50/50 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 shadow-xl backdrop-blur-sm transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 md:gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 md:h-10 md:w-10">
                            <Briefcase className="h-4 w-4 text-white md:h-5 md:w-5" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-2xl">
                            Work<span className="text-emerald-600">Nest</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - Full Menu */}
                    <div className="hidden items-center gap-4 md:flex">
                        <LanguageSwitcher />
                        {loading ? (
                            <div className="h-10 w-48 animate-pulse rounded-full bg-gray-200"></div>
                        ) : user ? (
                            <>
                                <Link to="/dashboard" className={navItemClass}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    {t('navbar.dashboard')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`ml-3 ${buttonSecondaryClass}`}
                                >
                                    <LogOut className="mr-1 inline h-4 w-4" />
                                    {t('navbar.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={navItemClass}>
                                    <LogIn className="h-4 w-4" />
                                    {t('navbar.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className={`ml-3 ${buttonPrimaryClass}`}
                                >
                                    <UserPlus className="mr-1 inline h-4 w-4" />
                                    {t('navbar.register')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Navigation - Only Login Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <LanguageSwitcher />
                        {loading ? (
                            <div className="h-10 w-28 animate-pulse rounded-full bg-gray-200"></div>
                        ) : user ? (
                            <button
                                onClick={handleLogout}
                                className={buttonPrimaryClass}
                            >
                                <LogOut className="mr-1 inline h-4 w-4" />
                                {t('navbar.logout')}
                            </button>
                        ) : (
                            <Link to="/login" className={buttonPrimaryClass}>
                                <LogIn className="mr-1 inline h-4 w-4" />
                                {t('navbar.login')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
