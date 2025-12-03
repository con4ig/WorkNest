import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, LogIn, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Błąd wylogowania:', err);
        }
    };

    const buttonPrimaryClass =
        'px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/50 transition-all duration-300 transform hover:scale-[1.02]';

    return (
        <nav className="sticky top-0 z-50 border-b border-emerald-50/50 bg-white bg-white/95 shadow-xl backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 md:gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 md:h-10 md:w-10">
                            <Briefcase className="h-4 w-4 text-white md:h-5 md:w-5" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-gray-900 md:text-2xl">
                            Work<span className="text-emerald-600">Nest</span>
                        </span>
                    </Link>

                    {/* Login Button */}
                    {loading ? (
                        <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200"></div>
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/dashboard"
                                className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-700 md:flex"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={buttonPrimaryClass}
                            >
                                <LogOut className="mr-1 inline h-4 w-4" />
                                Wyloguj
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className={buttonPrimaryClass}>
                            <LogIn className="mr-1 inline h-4 w-4" />
                            Zaloguj się
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
