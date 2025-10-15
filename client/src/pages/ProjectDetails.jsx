import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserManagementModal from './UserManagementModal';
import { Calendar, User, SquarePen, Save, X, ArrowLeft, Users, Info, TrendingUp, ChevronRight } from 'lucide-react';

// Konfiguracja Axios (bez zmian)
axios.defaults.baseURL = 'http://localhost:5500';

// --- Pomocnicze funkcje formatowania dat (bez zmian) ---
const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Nie określono';
    try {
        return new Date(dateString).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return 'Błędna data'; }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch { return ''; }
};

// --- Komponenty Ikon ---
const Icon = {
    Calendar: ({ className = "text-emerald-500" }) => <Calendar className={`w-6 h-6 ${className}`} />,
    User: ({ className }) => <User className={`w-5 h-5 ${className}`} />,
    Edit: () => <SquarePen className="w-5 h-5" />,
    Save: () => <Save className="w-5 h-5" />,
    Cancel: () => <X className="w-5 h-5" />,
    Back: () => <ArrowLeft className="w-5 h-5" />,
    Users: ({ className = "text-emerald-500" }) => <Users className={`w-6 h-6 ${className}`} />,
    Info: ({ className = "text-emerald-500" }) => <Info className={`w-6 h-6 ${className}`} />,
};

// --- Funkcje stylizujące dla jasnego motywu ---
const getStatusClasses = (status) => {
    switch (status) {
        case 'running': return 'bg-sky-100 text-sky-800 ring-sky-300/50';
        case 'completed': return 'bg-green-100 text-green-800 ring-green-300/50';
        case 'on-hold': return 'bg-amber-100 text-amber-800 ring-amber-300/50';
        default: return 'bg-slate-100 text-slate-800 ring-slate-300/50';
    }
};
const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-800';
        case 'medium': return 'bg-amber-100 text-amber-800';
        default: return 'bg-green-100 text-green-800';
    }
};

const AVAILABLE_STATUSES = ['pending', 'running', 'on-hold', 'completed'];
const AVAILABLE_PRIORITIES = ['low', 'medium', 'high'];

// --- Sub-komponenty dla lepszej organizacji kodu ---

// Karta statystyk w panelu bocznym
const StatCard = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1">{icon}</div>
        <div className="w-full">
            <h3 className="font-semibold text-slate-500">{title}</h3>
            <div className="mt-1">{children}</div>
        </div>
    </div>
);

// Okrągły wskaźnik postępu
const CircularProgress = ({ progress }) => {
    const radius = 60, stroke = 12;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle stroke="#e2e8f0" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke="url(#progressGradientLight)" fill="transparent" strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset }}
                    r={normalizedRadius} cx={radius} cy={radius} className="transition-all duration-500 ease-in-out"
                />
                <defs>
                    <linearGradient id="progressGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-4xl font-bold text-emerald-600">{progress}%</div>
        </div>
    );
};

// Karta z treścią w głównej sekcji
const ContentCard = ({ icon, title, children }) => (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
        <div className="flex items-center gap-4 mb-5 border-b border-slate-200 pb-4">
            {icon}
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        {children}
    </div>
);

// Główny komponent strony
export default function ProjectDetails() {
    // --- Hooki i Stany (bez zmian) ---
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // --- Logika (bez zmian) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const meRes = await axios.get('/api/auth/me', { withCredentials: true });
            setCurrentUser(meRes.data);
            const res = await axios.get(`/api/projects/${id}`, { withCredentials: true });
            setProject(res.data);
            setEditData({
                name: res.data.name, description: res.data.description, status: res.data.status,
                priority: res.data.priority, progress: res.data.progress || 0,
                startDate: formatDateForInput(res.data.startDate), endDate: formatDateForInput(res.data.endDate),
            });
            setError(null);
        } catch (err) { setError('Nie udało się załadować danych projektu.'); } 
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => { id && fetchData(); }, [id, fetchData]);

    const handleEditChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = (name === 'progress' && type === 'number') ? Math.max(0, Math.min(100, parseInt(value, 10) || 0)) : value;
        setEditData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.patch(`/api/projects/${id}`, { ...editData, startDate: editData.startDate || null, endDate: editData.endDate || null }, { withCredentials: true });
            await fetchData();
            setIsEditing(false);
        } catch (err) { alert('Błąd podczas zapisywania zmian.'); } 
        finally { setIsSaving(false); }
    };

    const handleProjectUpdate = useCallback(() => { fetchData(); }, [fetchData]);

    // --- Widoki ładowania i błędu w jasnym motywie ---
    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-slate-600">Ładowanie projektu...</p>
            </div>
        </div>
    );
    if (error) return (
        <div className="p-8 min-h-screen bg-slate-50 flex justify-center items-center text-center">
             <div className="bg-red-50 border border-red-400 text-red-700 px-8 py-6 rounded-xl shadow-lg w-full max-w-lg">
                <strong className="font-bold text-lg block mb-2">Wystąpił błąd</strong><span>{error}</span>
                <button onClick={() => navigate('/projekty')} className="mt-6 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors w-full">
                    Powrót
                </button>
            </div>
        </div>
    );
    if (!project) return null;

    const isAdmin = currentUser?.role === 'admin';
    const progress = isEditing ? editData.progress : project.progress || 0;

    // --- Główny Render Komponentu ---
    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex flex-col lg:flex-row">
            {/* --- LEWY PANEL (SIDEBAR) --- */}
            <aside className="w-full lg:w-[380px] lg:min-h-screen bg-white p-6 lg:p-8 flex flex-col border-r border-slate-200">
                <div className="flex items-center gap-3 mb-10">
                    <button onClick={() => navigate('/projekty')} className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                        <Icon.Back />
                    </button>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">Szczegóły Projektu</h2>
                </div>
                
                <div className="flex flex-col items-center text-center">
                    <CircularProgress progress={progress} />
                     {isEditing ? (
                        <div className="w-full max-w-xs mt-4">
                            <input type="range" name="progress" value={editData.progress} onChange={handleEditChange} min="0" max="100" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" disabled={isSaving} />
                        </div>
                    ) : (
                         <p className="mt-3 text-lg font-semibold text-slate-600">Postęp projektu</p>
                    )}
                </div>

                <div className="mt-10 space-y-6">
                    <StatCard icon={<Icon.Calendar />} title="Okres trwania projektu">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input type="date" name="startDate" value={editData.startDate} onChange={handleEditChange} className="w-full border bg-slate-50 border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                                <input type="date" name="endDate" value={editData.endDate} onChange={handleEditChange} className="w-full border bg-slate-50 border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-slate-800">{formatDateForDisplay(project.startDate)} - {formatDateForDisplay(project.endDate)}</p>
                        )}
                    </StatCard>
                     <StatCard icon={<ChevronRight className="w-6 h-6 text-emerald-500"/>} title="Status i priorytet">
                        {isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                <select name="status" value={editData.status} onChange={handleEditChange} className={`px-3 py-1.5 text-sm font-semibold rounded-lg border focus:outline-none capitalize bg-white ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-500`}>
                                    {AVAILABLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select name="priority" value={editData.priority} onChange={handleEditChange} className={`px-3 py-1.5 text-sm font-semibold rounded-lg border focus:outline-none capitalize bg-white ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-500`}>
                                    {AVAILABLE_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        ) : (
                             <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ring-1 ${getStatusClasses(project.status)}`}>{project.status}</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getPriorityClasses(project.priority)}`}>{project.priority}</span>
                             </div>
                        )}
                    </StatCard>
                </div>
                 <div className="mt-auto pt-8 text-center text-xs text-slate-400">
                    <p>Utworzony przez <span className="font-semibold text-slate-500">{project.createdBy.username}</span></p>
                    <p>{formatDateForDisplay(project.createdAt)}</p>
                </div>
            </aside>
            
            {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
            <main className="w-full p-6 lg:p-10 flex-grow">
                <header className="relative p-8 mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-200">
                    <div className="relative z-10">
                        {isEditing ? (
                            <input type="text" name="name" value={editData.name} onChange={handleEditChange} className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight bg-transparent border-b-2 border-white/50 focus:outline-none w-full placeholder:text-white/70" placeholder="Nazwa projektu..."/>
                        ) : (
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">{project.name}</h1>
                        )}
                        {isAdmin && (
                            <div className="flex flex-wrap gap-3 mt-6">
                                {isEditing ? (<>
                                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-bold rounded-lg hover:bg-slate-200 transition-all shadow-md disabled:opacity-60">
                                        {isSaving ? 'Zapisywanie...' : <><Icon.Save /> Zapisz zmiany</>}
                                    </button>
                                    <button onClick={() => { setIsEditing(false); fetchData(); }} className="flex items-center gap-2 px-5 py-2.5 bg-black/20 text-white font-bold rounded-lg hover:bg-black/30 transition-all">
                                        <Icon.Cancel /> Anuluj
                                    </button>
                                </>) : (<>
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 font-bold rounded-lg hover:bg-slate-200 transition-all shadow-lg">
                                        <Icon.Edit /> Edytuj
                                    </button>
                                    <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-black/20 text-white font-bold rounded-lg hover:bg-black/30 transition-all">
                                        <Icon.User /> Zarządzaj zespołem
                                    </button>
                                </>)}
                            </div>
                        )}
                    </div>
                </header>
                
                <div className="space-y-8 animate-fade-in">
                    <ContentCard icon={<Icon.Info />} title="Opis projektu">
                        {isEditing ? (
                            <textarea name="description" value={editData.description} onChange={handleEditChange} rows="6" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed" placeholder="Dodaj szczegółowy opis..."/>
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{project.description || "Ten projekt nie ma jeszcze szczegółowego opisu."}</p>
                        )}
                    </ContentCard>
                    <ContentCard icon={<Icon.Users />} title={`Zespół projektowy (${project.assignedUsers.length})`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.assignedUsers.map(user => (
                                <div key={user._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-base ${user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{user.username}</p>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                            {project.assignedUsers.length === 0 && <p className="text-slate-500 col-span-full">Do tego projektu nie przypisano jeszcze żadnych użytkowników.</p>}
                        </div>
                    </ContentCard>
                </div>
                {showUserModal && <UserManagementModal project={project} onClose={() => setShowUserModal(false)} onUpdate={handleProjectUpdate} />}
            </main>
        </div>
    );
}