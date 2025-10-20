import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, FolderKanban, Users, ChartLine, Search, Plus, Home, CalendarCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import AddProjectModal from './AddProjectModal.jsx';
import moment from 'moment';
import 'moment/locale/pl';

const Icon = {
  Dashboard: () => (
    <LayoutDashboard className="w-5 h-5" />
  ),
  Projects: () => (
    <FolderKanban className="w-5 h-5" />
  ),
  Users: () => (
    <Users className="w-5 h-5" />
  ),
  Analytics: () => (
    <ChartLine className="w-5 h-5" />
  ),
  Search: () => (
    <Search className="w-4 h-4 text-gray-400" />
  ),
  Plus: () => (
    <Plus className="w-4 h-4" />
  ),
  Home: () => (
    <Home className="w-5 h-5" />
  ),
  Check: () => (
    <CalendarCheck className="w-5 h-5" />
  ),
  ChevronRight: () => (
    <ChevronRight className="w-5 h-5" />
  ),
  ChevronLeft: () => (
    <ChevronLeft className="w-5 h-5" />
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
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [stats, setStats] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Wykrywanie rozmiaru ekranu
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProjectAdded = (newProject) => {
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

      if (role === 'admin' || role === 'hr') {
        setStats([
          { id: 1, title: 'Total Projects', value: '24', hint: 'Increased from last month' },
          { id: 2, title: 'Ended Projects', value: '10', hint: 'Stable' },
          { id: 3, title: 'Running Projects', value: '12', hint: 'Growing' },
          { id: 4, title: 'Pending', value: '2', hint: 'On review' }
        ]);
      } else {
        setStats([
          { id: 1, title: 'My Projects', value: '5', hint: 'Assigned to you' },
          { id: 2, title: 'Completed', value: '3', hint: 'This month' },
          { id: 3, title: 'In Progress', value: '2', hint: 'Active now' }
        ]);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const response = await axios.get('/api/projects?sortBy=createdAt:desc&limit=5', {
          withCredentials: true
        });

        setProjects(response.data.projects);

      } catch (err) {
        console.error("Nie udało się pobrać projektów:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        }
      }
    };

    fetchRecentProjects();
  }, [navigate]);

  const analytics = [40, 55, 75, 60, 80, 50, 30];

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
        navigate('/login');
      });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Overlay dla mobile gdy sidebar otwarty */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : isMobile ? '-translate-x-full' : 'w-20'} ${isMobile ? 'fixed' : 'fixed'} overflow-hidden bg-white shadow-lg h-screen z-20 transition-all duration-300`}>
          <div className="p-6 flex flex-col h-full">
            <div className={`flex items-center mb-8 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
              <div className="flex items-center gap-3">
                {isSidebarOpen && (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">W</div>
                )}
                {isSidebarOpen && (
                  <div>
                    <div className="font-semibold">{username}</div>
                    <div className="text-xs text-gray-500">{role}</div>
                  </div>
                )}
              </div>

              {/* Strzałka do zwijania/rozwijania - tylko na desktop */}
              {!isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-500 hover:text-gray-700 transition"
                  title={isSidebarOpen ? 'Zwiń menu' : 'Rozwiń menu'}
                >
                  {isSidebarOpen ? <Icon.ChevronLeft /> : <Icon.ChevronRight />}
                </button>
              )}
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {/* Dashboard */}
                <li
                  onClick={() => {
                    navigate('/dashboard');
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center rounded-lg cursor-pointer transition-colors
    ${isSidebarOpen ? 'gap-3 px-4 justify-start' : 'justify-center px-0'}
    ${location.pathname === '/dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
    py-3`}
                >
                  <Icon.Dashboard />
                  {isSidebarOpen && <span className="font-medium">Dashboard</span>}
                </li>

                {/* Projekty */}
                <li
                  onClick={() => {
                    navigate('/projekty');
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center rounded-lg cursor-pointer transition-colors
    ${isSidebarOpen ? 'gap-3 px-4 justify-start' : 'justify-center px-0'}
    ${location.pathname.startsWith('/projekty') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
    py-3`}
                >
                  <Icon.Projects />
                  {isSidebarOpen && <span className="font-medium">Projekty</span>}
                </li>

                {/* Zespół */}
                {(role === 'hr' || role === 'admin') && (
                  <li
                    onClick={() => {
                      navigate('/employees');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center rounded-lg cursor-pointer transition-colors
      ${isSidebarOpen ? 'gap-3 px-4 justify-start' : 'justify-center px-0'}
      ${location.pathname.startsWith('/employees') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
      py-3`}
                  >
                    <Icon.Users />
                    {isSidebarOpen && <span className="font-medium">Zespół</span>}
                  </li>
                )}

                {/* Zatwierdzanie Urlopów */}
                {(role === 'hr' || role === 'admin') && (
                  <li
                    onClick={() => {
                      navigate('/leave-approvals');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center rounded-lg cursor-pointer transition-colors
      ${isSidebarOpen ? 'gap-3 px-4 justify-start' : 'justify-center px-0'}
      ${location.pathname.startsWith('/leave-approvals') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
      py-3`}
                  >
                    <Icon.Check />
                    {isSidebarOpen && <span className="font-medium">Zatwierdzanie Urlopów</span>}
                  </li>
                )}

                {/* Rejestracja Urlopu */}
                {(role === 'employee' || role === 'hr') && (
                  <li
                    onClick={() => {
                      navigate('/myleaves');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center rounded-lg cursor-pointer transition-colors
      ${isSidebarOpen ? 'gap-3 px-4 justify-start' : 'justify-center px-0'}
      ${location.pathname.startsWith('/myleaves') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
      py-3`}
                  >
                    <Icon.Check />
                    {isSidebarOpen && <span className="font-medium">Rejestracja Urlopu</span>}
                  </li>
                )}

                {/* Home */}
                <li
                  onClick={() => {
                    navigate('/');
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center rounded-lg cursor-pointer transition-colors
    ${isSidebarOpen ? 'gap-3 px-4 justify-start' : 'justify-center px-0'}
    ${location.pathname === '/' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
    py-3`}
                >
                  <Icon.Home />
                  {isSidebarOpen && <span className="font-medium">Home</span>}
                </li>
              </ul>
            </nav>

            <div className="mt-auto">
              {isSidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  Wyloguj
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main content wrapper */}
        <div className={`w-full transition-all duration-300 ${isMobile ? 'pl-0' : isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
          {/* Topbar */}
          <div className="bg-white shadow-sm w-full sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
              <div className="flex items-center gap-3">
                {/* Hamburger menu na mobile */}
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
                  <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{message}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-6">
                <div className="relative hidden sm:block">
                  <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 gap-2">
                    <Icon.Search />
                    <input className="bg-transparent outline-none text-sm w-32 md:w-64" placeholder="Wyszukaj..." />
                  </div>
                </div>

                {(role === 'admin' || role === 'hr') && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-3 md:px-5 py-2 rounded-lg shadow-sm">
                    <Icon.Plus /> 
                    <span className="text-sm hidden sm:inline">Add Project</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* Stats big card */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl p-4 md:p-6 flex justify-between items-start shadow-lg">
                  <div>
                    <div className="text-xs md:text-sm opacity-90">Total Projects</div>
                    <div className="text-3xl md:text-4xl font-bold mt-2">24</div>
                    <div className="text-xs md:text-sm mt-2 opacity-90">Increased from last month</div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="bg-white/20 rounded-full px-3 md:px-4 py-1 text-xs md:text-sm backdrop-blur-sm">+6%</div>
                    <svg width="60" height="60" viewBox="0 0 36 36" className="transform -rotate-45 md:w-20 md:h-20">
                      <path d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
                      <path d="M18 2a16 16 0 1 0 9 3" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray="80 100" />
                    </svg>
                  </div>
                </div>

                {stats.slice(1).map(s => (
                  <div key={s.id} className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">{s.title}</div>
                    <div className="text-lg md:text-xl font-semibold mt-2">{s.value}</div>
                    <div className="text-xs md:text-sm text-gray-400 mt-2">{s.hint}</div>
                  </div>
                ))}

                {/* Project analytics */}
                <div className="sm:col-span-2 bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm md:text-base font-medium">Project Analytics</div>
                    <div className="text-xs text-gray-400">Weekly</div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-3">
                    {analytics.map((v, i) => (
                      <div key={i} className="flex-1">
                        <div style={{ height: `${(v / 100) * 80 + 8}px` }} className={`mx-0.5 md:mx-1 bg-emerald-600 rounded-t-md`} />
                        <div className="text-xs text-center text-gray-400 mt-2">{"SMTWTFS"[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <aside className="lg:col-span-4 space-y-4 md:space-y-6">
                <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm md:text-base font-medium">Reminders</div>
                    <button className="text-xs text-emerald-600">View all</button>
                  </div>
                  <div className="text-sm text-gray-600">Meeting with Arc Company</div>
                  <div className="text-xs text-gray-400 mt-1">02:00 pm - 04:00 pm</div>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm w-full sm:w-auto">Start Meeting</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm md:text-base font-medium">Project Progress</div>
                    <div className="text-xs md:text-sm text-gray-400">Overall</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg width="80" height="80" viewBox="0 0 36 36" className="md:w-24 md:h-24">
                      <path d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Z" fill="none" stroke="#E6F4EA" strokeWidth="6" />
                      <path d="M18 2a16 16 0 1 0 9 3" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeDasharray="41 100" />
                      <text x="18" y="22" fontSize="8" textAnchor="middle" fill="#111827" fontWeight="700">41%</text>
                    </svg>
                    <div className="text-sm">
                      <div className="text-gray-500">Completed</div>
                      <div className="text-gray-500 mt-2">In Progress</div>
                      <div className="text-gray-500 mt-2">Pending</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white rounded-xl p-3 md:p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs md:text-sm opacity-90">Time Tracker</div>
                      <div className="text-xl md:text-2xl font-bold mt-2">{formatTime(seconds)}</div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => setRunning(!running)} className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm ${running ? 'bg-white/20' : 'bg-white'} ${running ? 'text-white' : 'text-emerald-700'}`}>
                        {running ? 'Pause' : 'Start'}
                      </button>
                      <button onClick={() => { setSeconds(0); setRunning(false); }} className="flex-1 sm:flex-none px-3 py-2 bg-white text-emerald-700 rounded-md text-sm">Reset</button>
                    </div>
                  </div>
                </div>

              </aside>
            </div>

            {/* Bottom area: Recent activity */}
            <div className="mt-6 md:mt-8 bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="text-base md:text-lg font-medium">Ostatnio dodane projekty</div>
                <button onClick={() => navigate("/projekty")} className="text-xs md:text-sm text-emerald-600">Zobacz wszystkie →</button>
              </div>

              <ul className="space-y-3 md:space-y-4">
                {projects.map((project) => (
                  <li
                    key={project._id}
                    className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base font-medium truncate">Nowy projekt: {project.name}</div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">Dodano {moment(project.createdAt).fromNow()}</div>
                    </div>
                    <span className="text-sm text-gray-400 ml-2">→</span>
                  </li>
                ))}
              </ul>
            </div>


            <footer className="mt-6 md:mt-8 pb-6 md:pb-8 text-xs md:text-sm text-gray-400 text-center">
              © {new Date().getFullYear()} WorkNest — All rights reserved
            </footer>
          </div>
        </div>
      </div>

      {/* Modal stays at the root level */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectAdded}
      />
    </div>
  );
}