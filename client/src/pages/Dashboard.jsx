import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }
    setMessage(`Witaj, ${username}!`);
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">{message}</p>
    </div>
  );
}
