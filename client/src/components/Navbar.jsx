import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,
    LogOut,
    UserPlus,
    LogIn,
    LayoutDashboard,
    Menu,
    X,
} from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            setMobileMenuOpen(false);
        } catch (err) {
            console.error('Błąd wylogowania:', err);
        }
    };

    const navItemClass =
        'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300';
    const mobileNavItemClass =
        'flex items-center gap-2 px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 w-full';
    const buttonPrimaryClass =
        'px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/50 transition-all duration-300 transform hover:scale-[1.02]';
    const buttonSecondaryClass =
        'px-5 py-2.5 rounded-full text-sm font-bold text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 transition-all duration-300';

    return (
        <nav className="sticky top-0 z-50 border-b border-emerald-50/50 bg-white bg-white/95 shadow-xl backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between md:h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="flex items-center gap-2 md:gap-3"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 md:h-10 md:w-10">
                                <Briefcase className="h-4 w-4 text-white md:h-5 md:w-5" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-gray-900 md:text-2xl">
                                Work
                                <span className="text-emerald-600">Nest</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-1 md:flex">
                        <Link to="/" className={navItemClass}>
                            Home
                        </Link>

                        {loading ? (
                            <div className="h-10 w-48 animate-pulse rounded-full bg-gray-200"></div>
                        ) : user ? (
                            <>
                                <Link to="/dashboard" className={navItemClass}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`ml-3 ${buttonSecondaryClass}`}
                                >
                                    <LogOut className="mr-1 inline h-4 w-4" />
                                    Wyloguj
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={navItemClass}>
                                    <LogIn className="h-4 w-4" />
                                    Zaloguj się
                                </Link>
                                <Link
                                    to="/register"
                                    className={`ml-3 ${buttonPrimaryClass}`}
                                >
                                    <UserPlus className="mr-1 inline h-4 w-4" />
                                    Zarejestruj się
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="space-y-2 border-t border-emerald-50 py-4 md:hidden">
                        <Link
                            to="/"
                            className={mobileNavItemClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>

                        {loading ? (
                            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200"></div>
                        ) : user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={mobileNavItemClass}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`${mobileNavItemClass} text-emerald-600`}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Wyloguj
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={mobileNavItemClass}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LogIn className="h-5 w-5" />
                                    Zaloguj się
                                </Link>
                                <Link
                                    to="/register"
                                    className="mx-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-base font-bold text-white shadow-lg shadow-emerald-500/50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <UserPlus className="h-5 w-5" />
                                    Zarejestruj się
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
