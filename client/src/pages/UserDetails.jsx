import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Phone, Briefcase, MapPin, Calendar, SquarePen, Save, X, ArrowLeft, FileText, Building2, Badge } from 'lucide-react';

// Konfiguracja Axios
axios.defaults.baseURL = 'http://localhost:5500';

// --- Pomocnicze funkcje formatowania ---
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

const calculateWorkExperience = (hireDate) => {
    if (!hireDate) return 'Nie określono';
    try {
        const hire = new Date(hireDate);
        const now = new Date();
        const months = (now.getFullYear() - hire.getFullYear()) * 12 + (now.getMonth() - hire.getMonth());
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return `${years} lat ${remainingMonths} m-cy`;
    } catch { return 'Błędna data'; }
};

// --- Komponenty Ikon ---
const Icon = {
    Mail: ({ className = "text-emerald-500" }) => <Mail className={`w-6 h-6 ${className}`} />,
    Phone: ({ className = "text-emerald-500" }) => <Phone className={`w-6 h-6 ${className}`} />,
    Briefcase: ({ className = "text-emerald-500" }) => <Briefcase className={`w-6 h-6 ${className}`} />,
    Building: ({ className = "text-emerald-500" }) => <Building2 className={`w-6 h-6 ${className}`} />,
    Location: ({ className = "text-emerald-500" }) => <MapPin className={`w-6 h-6 ${className}`} />,
    Calendar: ({ className = "text-emerald-500" }) => <Calendar className={`w-6 h-6 ${className}`} />,
    Edit: () => <SquarePen className="w-5 h-5" />,
    Save: () => <Save className="w-5 h-5" />,
    Cancel: () => <X className="w-5 h-5" />,
    Back: () => <ArrowLeft className="w-5 h-5" />,
    Badge: ({ className = "text-emerald-500" }) => <Badge className={`w-6 h-6 ${className}`} />,
    Notes: ({ className = "text-emerald-500" }) => <FileText className={`w-6 h-6 ${className}`} />,
};

// --- Funkcje stylizujące ---
const getStatusClasses = (status) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800 ring-green-300/50';
        case 'inactive': return 'bg-slate-100 text-slate-800 ring-slate-300/50';
        case 'on-leave': return 'bg-blue-100 text-blue-800 ring-blue-300/50';
        case 'terminated': return 'bg-red-100 text-red-800 ring-red-300/50';
        default: return 'bg-slate-100 text-slate-800 ring-slate-300/50';
    }
};

const getContractClasses = (type) => {
    switch (type) {
        case 'full-time': return 'bg-emerald-100 text-emerald-800';
        case 'part-time': return 'bg-amber-100 text-amber-800';
        case 'contract': return 'bg-purple-100 text-purple-800';
        case 'temporary': return 'bg-orange-100 text-orange-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const AVAILABLE_STATUSES = ['active', 'inactive', 'on-leave', 'terminated'];
const AVAILABLE_CONTRACT_TYPES = ['full-time', 'part-time', 'contract', 'temporary'];
const AVAILABLE_ROLES = ['employee', 'hr', 'admin'];
const DEPARTMENTS = ['IT', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations'];

// --- Sub-komponenty ---
const StatCard = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1">{icon}</div>
        <div className="w-full">
            <h3 className="font-semibold text-slate-500 text-sm">{title}</h3>
            <div className="mt-2">{children}</div>
        </div>
    </div>
);

const ContentCard = ({ icon, title, children }) => (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
        <div className="flex items-center gap-4 mb-5 border-b border-slate-200 pb-4">
            {icon}
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        {children}
    </div>
);

const EditableField = ({ label, name, type = "text", value, onChange, disabled, options }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-600">{label}</label>
        {options ? (
            <select name={name} value={value} onChange={onChange} disabled={disabled} className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="">-- Wybierz --</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : type === 'textarea' ? (
            <textarea name={name} value={value} onChange={onChange} disabled={disabled} rows="4" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        ) : (
            <input type={type} name={name} value={value} onChange={onChange} disabled={disabled} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        )}
    </div>
);

// --- Główny komponent ---
export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const meRes = await axios.get('/api/auth/me', { withCredentials: true });
            setCurrentUser(meRes.data);
            const res = await axios.get(`/api/users/${id}`, { withCredentials: true });
            
            // Ustaw domyślne wartości dla pól HR jeśli ich nie ma
            const userData = {
                username: res.data.username || '',
                email: res.data.email || '',
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                phoneNumber: res.data.phoneNumber || '',
                position: res.data.position || '',
                department: res.data.department || '',
                hireDate: formatDateForInput(res.data.hireDate || ''),
                salary: res.data.salary || 0,
                status: res.data.status || 'active',
                contractType: res.data.contractType || 'full-time',
                role: res.data.role || 'employee',
                address: res.data.address || '',
                city: res.data.city || '',
                peselOrId: res.data.peselOrId || '',
                notes: res.data.notes || '',
            };
            
            setUser(res.data);
            setEditData(userData);
            setError(null);
        } catch (err) {
            console.error('Error fetching user:', err);
            setError(`Nie udało się załadować danych pracownika: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        id && fetchData();
    }, [id, fetchData]);

    const handleEditChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = value;
        if (type === 'number') newValue = parseInt(value, 10) || 0;
        setEditData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.patch(`/api/users/${id}`, {
                ...editData,
                hireDate: editData.hireDate || null,
                salary: editData.salary || 0,
            }, { withCredentials: true });
            await fetchData();
            setIsEditing(false);
        } catch (err) {
            alert(`Błąd podczas zapisywania zmian: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-slate-600">Ładowanie danych pracownika...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 min-h-screen bg-slate-50 flex justify-center items-center text-center">
            <div className="bg-red-50 border border-red-400 text-red-700 px-8 py-6 rounded-xl shadow-lg w-full max-w-lg">
                <strong className="font-bold text-lg block mb-2">Wystąpił błąd</strong>
                <span>{error}</span>
                <button onClick={() => navigate('/employees')} className="mt-6 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors w-full">
                    Powrót
                </button>
            </div>
        </div>
    );

    if (!user) return null;

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'hr';
    const fullName = `${editData.firstName} ${editData.lastName}`.trim() || editData.username;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex flex-col lg:flex-row">
            {/* --- LEWY PANEL --- */}
            <aside className="w-full lg:w-[380px] lg:min-h-screen bg-white p-6 lg:p-8 flex flex-col border-r border-slate-200">
                <div className="flex items-center gap-3 mb-10">
                    <button onClick={() => navigate('/employees')} className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                        <Icon.Back />
                    </button>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">Profil Pracownika</h2>
                </div>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-slate-800">{fullName}</h3>
                    <p className="text-slate-500 text-sm mt-1">{editData.position || 'Brak stanowiska'}</p>
                </div>

                <div className="space-y-6">
                    <StatCard icon={<Icon.Badge />} title="Status i umowa">
                        {isEditing ? (
                            <div className="space-y-3">
                                <select name="status" value={editData.status} onChange={handleEditChange} className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border bg-white ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-500">
                                    {AVAILABLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select name="contractType" value={editData.contractType} onChange={handleEditChange} className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border bg-white ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-500">
                                    {AVAILABLE_CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ring-1 w-fit ${getStatusClasses(user.status)}`}>{user.status}</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize w-fit ${getContractClasses(user.contractType)}`}>{user.contractType}</span>
                            </div>
                        )}
                    </StatCard>

                    <StatCard icon={<Icon.Calendar />} title="Staż pracy">
                        <p className="text-lg font-bold text-slate-800">{calculateWorkExperience(user.hireDate)}</p>
                    </StatCard>

                    <StatCard icon={<Icon.Briefcase />} title="Dział">
                        {isEditing ? (
                            <select name="department" value={editData.department} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500">
                                <option value="">-- Wybierz --</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        ) : (
                            <p className="text-lg font-bold text-slate-800">{user.department || 'Nie określono'}</p>
                        )}
                    </StatCard>
                </div>

                <div className="mt-auto pt-8 text-center text-xs text-slate-400">
                    <p>Utworzony: <span className="font-semibold text-slate-500">{formatDateForDisplay(user.createdAt)}</span></p>
                </div>
            </aside>

            {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
            <main className="w-full p-6 lg:p-10 flex-grow">
                <header className="relative p-8 mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-200">
                    <div className="relative z-10">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="firstName" value={editData.firstName} onChange={handleEditChange} placeholder="Imię..." className="text-lg font-bold text-white bg-white/20 backdrop-blur border-b-2 border-white/50 focus:outline-none rounded px-2 py-1" />
                                <input type="text" name="lastName" value={editData.lastName} onChange={handleEditChange} placeholder="Nazwisko..." className="text-lg font-bold text-white bg-white/20 backdrop-blur border-b-2 border-white/50 focus:outline-none rounded px-2 py-1" />
                            </div>
                        ) : (
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">{fullName}</h1>
                        )}
                        {isAdmin && (
                            <div className="flex flex-wrap gap-3 mt-6">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-bold rounded-lg hover:bg-slate-200 transition-all shadow-md disabled:opacity-60">
                                            {isSaving ? 'Zapisywanie...' : <><Icon.Save /> Zapisz zmiany</>}
                                        </button>
                                        <button onClick={() => { setIsEditing(false); fetchData(); }} className="flex items-center gap-2 px-5 py-2.5 bg-black/20 text-white font-bold rounded-lg hover:bg-black/30 transition-all">
                                            <Icon.Cancel /> Anuluj
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 font-bold rounded-lg hover:bg-slate-200 transition-all shadow-lg">
                                        <Icon.Edit /> Edytuj dane
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="space-y-8">
                    {/* Sekcja Kontakt */}
                    <ContentCard icon={<Icon.Mail />} title="Kontakt">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isEditing ? (
                                <>
                                    <EditableField label="Email" name="email" type="email" value={editData.email} onChange={handleEditChange} />
                                    <EditableField label="Numer telefonu" name="phoneNumber" value={editData.phoneNumber} onChange={handleEditChange} />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Email</p>
                                        <a href={`mailto:${user.email}`} className="text-lg font-bold text-emerald-600 hover:underline">{user.email}</a>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Numer telefonu</p>
                                        <p className="text-lg font-bold text-slate-800">{user.phoneNumber || 'Nie podano'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Praca */}
                    <ContentCard icon={<Icon.Briefcase />} title="Informacje zawodowe">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isEditing ? (
                                <>
                                    <EditableField label="Stanowisko" name="position" value={editData.position} onChange={handleEditChange} />
                                    <EditableField label="Rola w systemie" name="role" value={editData.role} options={AVAILABLE_ROLES} onChange={handleEditChange} />
                                    <EditableField label="Data zatrudnienia" name="hireDate" type="date" value={editData.hireDate} onChange={handleEditChange} />
                                    <EditableField label="Pensja (PLN)" name="salary" type="number" value={editData.salary} onChange={handleEditChange} />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Stanowisko</p>
                                        <p className="text-lg font-bold text-slate-800">{user.position || 'Nie określono'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Rola</p>
                                        <p className="text-lg font-bold text-slate-800">{user.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Data zatrudnienia</p>
                                        <p className="text-lg font-bold text-slate-800">{formatDateForDisplay(user.hireDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Pensja</p>
                                        <p className="text-lg font-bold text-slate-800">{user.salary > 0 ? `${user.salary} PLN` : 'Nie określono'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Adres */}
                    <ContentCard icon={<Icon.Location />} title="Adres">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isEditing ? (
                                <>
                                    <EditableField label="Adres" name="address" value={editData.address} onChange={handleEditChange} />
                                    <EditableField label="Miasto" name="city" value={editData.city} onChange={handleEditChange} />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Adres</p>
                                        <p className="text-lg font-bold text-slate-800">{user.address || 'Nie podano'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">Miasto</p>
                                        <p className="text-lg font-bold text-slate-800">{user.city || 'Nie podano'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Dane osobiste */}
                    <ContentCard icon={<Icon.Badge />} title="Dane osobiste">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isEditing ? (
                                <>
                                    <EditableField label="PESEL/ID" name="peselOrId" value={editData.peselOrId} onChange={handleEditChange} />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-slate-500 font-semibold">PESEL/ID</p>
                                        <p className="text-lg font-bold text-slate-800">{user.peselOrId || 'Nie podano'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Notatki */}
                    <ContentCard icon={<Icon.Notes />} title="Notatki">
                        {isEditing ? (
                            <EditableField label="Notatki pracownika" name="notes" type="textarea" value={editData.notes} onChange={handleEditChange} />
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{user.notes || 'Brak notatek'}</p>
                        )}
                    </ContentCard>
                </div>
            </main>
        </div>
    );
}