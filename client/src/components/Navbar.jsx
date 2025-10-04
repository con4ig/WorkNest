import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">WorkNest</Link>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="hover:underline">Zaloguj się</Link>
            <Link to="/register" className="hover:underline">Zarejestruj się</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <button onClick={handleLogout} className="hover:underline">Wyloguj</button>
          </>
        )}
      </div>
    </nav>
  );
}