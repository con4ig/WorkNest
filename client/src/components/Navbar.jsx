import {useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me', { withCredentials: true });
        setUsername(res.data.username);
      } catch (err) {
        console.error('Błąd przy autoryzacji:', err);
        setUsername(null); // nie zalogowany
      }
    };

    checkAuth();
  }, []);

    const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      localStorage.clear(); // usuń dane użytkownika
      navigate('/login');
    } catch (err) {
      console.error('Błąd wylogowania:', err);
    }
  };



  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WorkNest</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Home
            </Link>
            
            {username ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="ml-2 px-4 py-2 rounded-md text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  Wyloguj
                </button>
              </>

            ) : (
                            <>
                <Link 
                  to="/login" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Zaloguj się
                </Link>
                <Link 
                  to="/register" 
                  className="ml-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
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