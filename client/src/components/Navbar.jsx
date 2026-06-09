import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
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
        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-foreground/80 hover:bg-accent hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    const buttonPrimaryClass =
        'inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    const buttonSecondaryClass =
        'inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-primary border border-border bg-card hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-sm transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between md:h-20">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:gap-3"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 md:h-10 md:w-10">
                            <Briefcase
                                className="h-4 w-4 text-primary-foreground md:h-5 md:w-5"
                                aria-hidden="true"
                            />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
                            Work<span className="text-primary">Nest</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-4 md:flex">
                        <LanguageSwitcher />
                        {loading ? (
                            <div className="h-10 w-48 animate-pulse rounded-full bg-muted"></div>
                        ) : user ? (
                            <>
                                <Link to="/dashboard" className={navItemClass}>
                                    <LayoutDashboard
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    {t('navbar.dashboard')}
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={`ml-3 ${buttonSecondaryClass}`}
                                    aria-label={t('navbar.logout')}
                                >
                                    <LogOut
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    {t('navbar.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={navItemClass}>
                                    <LogIn
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    {t('navbar.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className={`ml-3 ${buttonPrimaryClass}`}
                                >
                                    <UserPlus
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    {t('navbar.register')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex items-center gap-2 md:hidden">
                        <LanguageSwitcher />
                        {loading ? (
                            <div className="h-10 w-28 animate-pulse rounded-full bg-muted"></div>
                        ) : user ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className={buttonPrimaryClass}
                                aria-label={t('navbar.logout')}
                            >
                                <LogOut
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                {t('navbar.logout')}
                            </button>
                        ) : (
                            <Link to="/login" className={buttonPrimaryClass}>
                                <LogIn className="h-4 w-4" aria-hidden="true" />
                                {t('navbar.login')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
