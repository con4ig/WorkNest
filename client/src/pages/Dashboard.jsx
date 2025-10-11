import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddProjectModal from './AddProjectModal.jsx';

const Icon = {
  Dashboard: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" /></svg>
  ),
  Projects: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5s-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zM2 21c0-3 3-5 6-5s6 2 6 5" /></svg>
  ),
  Search: () => (
    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" /></svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14" /></svg>
  )
};

function formatTime(s) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]); // Przykładowy stan listy projektów
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();

  const handleProjectAdded = (newProject) => {
    // Tutaj możesz zaktualizować listę projektów na stronie
    setProjects((prevProjects) => [newProject, ...prevProjects]);
    alert(`Projekt "${newProject.name}" został pomyślnie dodany!`);
  };

useEffect(() => {
  const checkAuth = async () => {
    const res = await axios.get('/api/auth/me', { withCredentials: true });
    const { username, role } = res.data;

    setMessage(`Witaj, ${username}! Masz szybki przegląd ostatnich projektów.`);
    setUsername(username);
    setRole(role);
    
    // Ustaw różne stats w zależności od roli
    if (role === 'admin' || role === 'hr') {
      setStats([
        { id: 1, title: 'Total Projects', value: '24', hint: 'Increased from last month' },
        { id: 2, title: 'Ended Projects', value: '10', hint: 'Stable' },
        { id: 3, title: 'Running Projects', value: '12', hint: 'Growing' },
        { id: 4, title: 'Pending', value: '2', hint: 'On review' }
      ]);
    } else {
      // Employee widzi tylko swoje
      setStats([
        { id: 1, title: 'My Projects', value: '5', hint: 'Assigned to you' },
        { id: 2, title: 'Completed', value: '3', hint: 'This month' },
        { id: 3, title: 'In Progress', value: '2', hint: 'Active now' }
      ]);
    }
  };

  checkAuth();
}, [navigate]);
  
  // sample data
  // const stats = [
  //   { id: 1, title: 'Total Projects', value: '24', hint: 'Increased from last month' },
  //   { id: 2, title: 'Ended Projects', value: '10', hint: 'Stable' },
  //   { id: 3, title: 'Running Projects', value: '12', hint: 'Growing' },
  //   { id: 4, title: 'Pending', value: '2', hint: 'On review' }
  // ];

  const analytics = [40, 55, 75, 60, 80, 50, 30]; // example weekly data

  // time tracker
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function handleLogout() {
  axios.post('/api/auth/logout', {}, { withCredentials: true })
    .then(() => {
      navigate('/login');
    })
    .catch((err) => {
      console.error('Błąd przy wylogowaniu:', err);
      navigate('/login'); // awaryjnie
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        /* Sidebar */
          <aside className="w-64 bg-white shadow-lg fixed h-full">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">W</div>
                <div>
            <div className="font-semibold">{username}</div>
            <div className="text-xs text-gray-500">{role}</div>
                </div>
              </div>

              <nav className="flex-1">
                <ul className="space-y-2">
            <li className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700">
              <Icon.Dashboard /> <span className="font-medium">Dashboard</span>
            </li>
            <li 
            onClick={() => navigate("/projekty")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors">
              <Icon.Projects /> Projekty
            </li>
            {(role === 'hr' || role === 'admin') && (
              <li 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors"
                onClick={() => navigate('/employees')}
              >
                <Icon.Users /> Zespół
              </li>
            )}
            <li className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18M3 6h18M3 18h18"/></svg> Analytics
            </li>
            <li
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors"
              onClick={() => navigate('/')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18M3 6h18M3 18h18"/></svg> Home
            </li>
                </ul>
              </nav>

              <div className="mt-auto">
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
            Wyloguj
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
        <main className="flex-1 ml-64">
          {/* Topbar */}
          <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between px-8 py-4">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-500">{message}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 gap-2">
                    <Icon.Search />
                    <input className="bg-transparent outline-none text-sm w-64" placeholder="Search task or project..." />
                  </div>
                </div>

                {(role === 'admin' || role === 'hr') && (
                  <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-5 py-2 rounded-lg shadow-sm">
                    <Icon.Plus /> <span className="text-sm">Add Project</span>
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <span className="font-medium text-gray-600">A</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Stats big card */}
              <div className="col-span-8 grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl p-6 flex justify-between items-start shadow-lg">
                  <div>
                    <div className="text-sm opacity-90">Total Projects</div>
                    <div className="text-4xl font-bold mt-2">24</div>
                    <div className="text-sm mt-2 opacity-90">Increased from last month</div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="bg-white/20 rounded-full px-4 py-1 text-sm backdrop-blur-sm">+6%</div>
                    <svg width="80" height="80" viewBox="0 0 36 36" className="transform -rotate-45">
                      <path d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
                      <path d="M18 2a16 16 0 1 0 9 3" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray="80 100" />
                    </svg>
                  </div>
                </div>

                {stats.slice(1).map(s => (
                  <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">{s.title}</div>
                    <div className="text-xl font-semibold mt-2">{s.value}</div>
                    <div className="text-sm text-gray-400 mt-2">{s.hint}</div>
                  </div>
                ))}

                {/* Project analytics */}
                <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Project Analytics</div>
                    <div className="text-xs text-gray-400">Weekly</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {analytics.map((v, i) => (
                      <div key={i} className="flex-1">
                        <div style={{height: `${(v/100)*80 + 8}px`}} className={`mx-1 bg-emerald-600 rounded-t-md`} />
                        <div className="text-xs text-center text-gray-400 mt-2">SMTWTFS"[i]"</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <aside className="col-span-4 space-y-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Reminders</div>
                    <button className="text-xs text-emerald-600">View all</button>
                  </div>
                  <div className="text-sm text-gray-600">Meeting with Arc Company</div>
                  <div className="text-xs text-gray-400 mt-1">02:00 pm - 04:00 pm</div>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Start Meeting</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Project Progress</div>
                    <div className="text-sm text-gray-400">Overall</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg width="96" height="96" viewBox="0 0 36 36">
                      <path d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Z" fill="none" stroke="#E6F4EA" strokeWidth="6"/>
                      <path d="M18 2a16 16 0 1 0 9 3" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeDasharray="41 100"/>
                      <text x="18" y="22" fontSize="8" textAnchor="middle" fill="#111827" fontWeight="700">41%</text>
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">Completed</div>
                      <div className="text-sm text-gray-500 mt-2">In Progress</div>
                      <div className="text-sm text-gray-500 mt-2">Pending</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">Time Tracker</div>
                      <div className="text-2xl font-bold mt-2">{formatTime(seconds)}</div>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => setRunning(!running)} className={`px-3 py-2 rounded-md text-sm ${running ? 'bg-white/20' : 'bg-white' } ${running ? 'text-white' : 'text-emerald-700'}`}>
                        {running ? 'Pause' : 'Start'}
                      </button>
                      <button onClick={() => { setSeconds(0); setRunning(false); }} className="px-3 py-2 bg-white text-emerald-700 rounded-md text-sm">Reset</button>
                    </div>
                  </div>
                </div>

              </aside>
            </div>

            {/* Bottom area: Recent activity */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="font-medium text-lg">Recent Activity</div>
                <div className="text-sm text-gray-400">Today</div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <div className="font-medium">Nowy projekt: Strona główna</div>
                    <div className="text-sm text-gray-500 mt-1">Przez Anna • 2h temu</div>
                  </div>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors">Szczegóły →</button>
                </li>
                <li className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <div className="font-medium">Zadanie ukończone: Backend API</div>
                    <div className="text-sm text-gray-500 mt-1">Przez Marek • 6h temu</div>
                  </div>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors">Szczegóły →</button>
                </li>
              </ul>
            </div>

            <footer className="mt-8 pb-8 text-sm text-gray-400 text-center">
              © {new Date().getFullYear()} WorkNest — All rights reserved
            </footer>
          </div>
        </main>
      </div>
      <AddProjectModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleProjectAdded}
            />
    </div>

    
  );
}
