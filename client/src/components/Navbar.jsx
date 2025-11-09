import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importujemy hooka
import { Briefcase, LogOut, UserPlus, LogIn, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  // Pobieramy dane z kontekstu, a nie przez axios!
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

  const navItemClass = "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300";
  const buttonPrimaryClass = "ml-3 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/50 transition-all duration-300 transform hover:scale-[1.02]";
  const buttonSecondaryClass = "ml-3 px-5 py-2.5 rounded-full text-sm font-bold text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 transition-all duration-300";


  return (
    <nav className="bg-white border-b border-emerald-50/50 shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              {/* Logotyp z gradientem Szmaragd/Morski */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Work<span className="text-emerald-600">Nest</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={navItemClass}
            >
              Home
            </Link>

            {loading ? (
              // Skeleton UI na czas ładowania
              <div className="h-10 w-48 animate-pulse rounded-full bg-gray-200"></div>
            ) : user ? (
              // Widok dla zalogowanego użytkownika
              <>
                <Link
                  to="/dashboard"
                  className={navItemClass}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={buttonSecondaryClass}
                >
                  <LogOut className="w-4 h-4 mr-1 inline" />
                  Wyloguj
                </button>
              </>

            ) : ( // Widok dla gościa
              <>
                <Link
                  to="/login"
                  className={navItemClass}
                >
                  <LogIn className="w-4 h-4" />
                  Zaloguj się
                </Link>
                <Link
                  to="/register"
                  className={buttonPrimaryClass}
                >
                  <UserPlus className="w-4 h-4 mr-1 inline" />
                  Zarejestruj się
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}