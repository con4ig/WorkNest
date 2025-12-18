import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import {
    Mail,
    Phone,
    Briefcase,
    MapPin,
    Calendar,
    SquarePen,
    Save,
    X,
    ArrowLeft,
    FileText,
    Building2,
    Badge,
} from 'lucide-react';
import {
    translateStatus,
    translateContractType,
    translateRole,
} from '../utils/translations.js';

import LoadingScreen from '../components/LoadingScreen';
// --- Pomocnicze funkcje formatowania ---
const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Nie określono';
    try {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return 'Błędna data';
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
        return '';
    }
};

const calculateWorkExperience = (hireDate) => {
    if (!hireDate) return 'Nie określono';
    try {
        const hire = new Date(hireDate);
        const now = new Date();
        const months =
            (now.getFullYear() - hire.getFullYear()) * 12 +
            (now.getMonth() - hire.getMonth());
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return `${years} lat ${remainingMonths} m-cy`;
    } catch {
        return 'Błędna data';
    }
};

// --- Komponenty Ikon ---
const Icon = {
    Mail: ({ className = 'text-emerald-500' }) => (
        <Mail className={`h-6 w-6 ${className}`} />
    ),
    Phone: ({ className = 'text-emerald-500' }) => (
        <Phone className={`h-6 w-6 ${className}`} />
    ),
    Briefcase: ({ className = 'text-emerald-500' }) => (
        <Briefcase className={`h-6 w-6 ${className}`} />
    ),
    Building: ({ className = 'text-emerald-500' }) => (
        <Building2 className={`h-6 w-6 ${className}`} />
    ),
    Location: ({ className = 'text-emerald-500' }) => (
        <MapPin className={`h-6 w-6 ${className}`} />
    ),
    Calendar: ({ className = 'text-emerald-500' }) => (
        <Calendar className={`h-6 w-6 ${className}`} />
    ),
    Edit: () => <SquarePen className="h-5 w-5" />,
    Save: () => <Save className="h-5 w-5" />,
    Cancel: () => <X className="h-5 w-5" />,
    Back: () => <ArrowLeft className="h-5 w-5" />,
    Badge: ({ className = 'text-emerald-500' }) => (
        <Badge className={`h-6 w-6 ${className}`} />
    ),
    Notes: ({ className = 'text-emerald-500' }) => (
        <FileText className={`h-6 w-6 ${className}`} />
    ),
    Documents: ({ className = 'text-emerald-500' }) => (
        <FileText className={`h-6 w-6 ${className}`} />
    ),
};

// --- Funkcje stylizujące ---
const getStatusClasses = (status) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 ring-green-300/50';
        case 'inactive':
            return 'bg-slate-100 text-slate-800 ring-slate-300/50';
        case 'on-leave':
            return 'bg-blue-100 text-blue-800 ring-blue-300/50';
        case 'terminated':
            return 'bg-red-100 text-red-800 ring-red-300/50';
        default:
            return 'bg-slate-100 text-slate-800 ring-slate-300/50';
    }
};

const getContractClasses = (type) => {
    switch (type) {
        case 'full-time':
            return 'bg-emerald-100 text-emerald-800';
        case 'part-time':
            return 'bg-amber-100 text-amber-800';
        case 'contract':
            return 'bg-purple-100 text-purple-800';
        case 'temporary':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-slate-100 text-slate-800';
    }
};

const AVAILABLE_STATUSES = ['active', 'inactive', 'on-leave', 'terminated'];
const AVAILABLE_CONTRACT_TYPES = [
    'full-time',
    'part-time',
    'contract',
    'temporary',
];
const AVAILABLE_ROLES = ['employee', 'hr', 'admin'];
const DEPARTMENTS = ['IT', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations'];

// --- Sub-komponenty ---
const StatCard = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1">{icon}</div>
        <div className="w-full">
            <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
            <div className="mt-2">{children}</div>
        </div>
    </div>
);

const ContentCard = ({ icon, title, children }) => (
    <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-4 border-b border-slate-200 pb-4">
            {icon}
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        {children}
    </div>
);

const EditableField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    disabled,
    options,
}) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-600">{label}</label>
        {options ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
                <option value="">-- Wybierz --</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {name === 'role' ? translateRole(opt) : opt}
                    </option>
                ))}
            </select>
        ) : type === 'textarea' ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                rows="4"
                className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
    const [employmentHistory, setEmploymentHistory] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const meRes = await api.get('/users/me');
            setCurrentUser(meRes.data);

            const res = await api.get(`/users/${id}`);

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
                employmentHistory: res.data.employmentHistory || [],
                documents: res.data.documents || [],
            };

            setUser(res.data);
            setEditData(userData);
            setEmploymentHistory(res.data.employmentHistory || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching user:', err);
            setError(
                `Nie udało się załadować danych pracownika: ${err.message}`,
            );
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
        setEditData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleHistoryChange = (index, e) => {
        const { name, value } = e.target;
        const updatedHistory = [...editData.employmentHistory];
        updatedHistory[index] = { ...updatedHistory[index], [name]: value };
        setEditData((prev) => ({ ...prev, employmentHistory: updatedHistory }));
    };

    const handleAddHistory = () => {
        const newHistoryEntry = {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: '',
        };
        setEditData((prev) => ({
            ...prev,
            employmentHistory: [...prev.employmentHistory, newHistoryEntry],
        }));
    };

    const handleRemoveHistory = (index) => {
        const updatedHistory = editData.employmentHistory.filter(
            (_, i) => i !== index,
        );
        setEditData((prev) => ({ ...prev, employmentHistory: updatedHistory }));
    };

    const handleDocumentChange = (index, e) => {
        const { name, value } = e.target;
        const updatedDocuments = [...editData.documents];
        updatedDocuments[index] = { ...updatedDocuments[index], [name]: value };
        setEditData((prev) => ({ ...prev, documents: updatedDocuments }));
    };

    const handleAddDocument = () => {
        const newDocument = {
            name: '',
            url: '',
            category: 'documentation',
            uploadedAt: new Date().toISOString(),
        };
        setEditData((prev) => ({
            ...prev,
            documents: [...(prev.documents || []), newDocument],
        }));
    };

    const handleRemoveDocument = (index) => {
        const updatedDocuments = editData.documents.filter(
            (_, i) => i !== index,
        );
        setEditData((prev) => ({ ...prev, documents: updatedDocuments }));
    };



    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = { ...editData };

            // Filtruj puste wpisy w dokumentach
            if (dataToSave.documents) {
                dataToSave.documents = dataToSave.documents.filter(
                    (doc) => doc.name && doc.url,
                );
            }

            // Filtruj puste wpisy w historii zatrudnienia
            if (dataToSave.employmentHistory) {
                dataToSave.employmentHistory =
                    dataToSave.employmentHistory.filter(
                        (hist) => hist.company && hist.position,
                    );
            }

            const response = await api.patch(`/users/${id}`, {
                ...dataToSave,
                hireDate: dataToSave.hireDate || null,
                salary: dataToSave.salary || 0,
            });

            const updatedUser = response.data.user;

            // Zaktualizuj stany bezpośrednio z odpowiedzi API
            setUser(updatedUser);
            setEmploymentHistory(updatedUser.employmentHistory || []);

            // Zsynchronizuj dane edycji z nowymi danymi
            const userData = {
                username: updatedUser.username || '',
                email: updatedUser.email || '',
                firstName: updatedUser.firstName || '',
                lastName: updatedUser.lastName || '',
                phoneNumber: updatedUser.phoneNumber || '',
                position: updatedUser.position || '',
                department: updatedUser.department || '',
                hireDate: formatDateForInput(updatedUser.hireDate || ''),
                salary: updatedUser.salary || 0,
                status: updatedUser.status || 'active',
                contractType: updatedUser.contractType || 'full-time',
                role: updatedUser.role || 'employee',
                address: updatedUser.address || '',
                city: updatedUser.city || '',
                peselOrId: updatedUser.peselOrId || '',
                notes: updatedUser.notes || '',
                employmentHistory: updatedUser.employmentHistory || [],
                documents: updatedUser.documents || [],
            };
            setEditData(userData);

            setIsEditing(false);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
            alert(`Błąd podczas zapisywania zmian: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <LoadingScreen message="Ładowanie danych pracownika..." />;

    if (error)
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-center">
                <div className="w-full max-w-lg rounded-xl border border-red-400 bg-red-50 px-8 py-6 text-red-700 shadow-lg">
                    <strong className="mb-2 block text-lg font-bold">
                        Wystąpił błąd
                    </strong>
                    <span>{error}</span>
                    <button
                        onClick={() => navigate('/employees')}
                        className="mt-6 w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
                    >
                        Powrót
                    </button>
                </div>
            </div>
        );

    if (!user) return null;

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'hr';
    const fullName =
        `${editData.firstName} ${editData.lastName}`.trim() ||
        editData.username;

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-700 lg:flex-row">
            {/* --- LEWY PANEL --- */}
            <aside className="flex w-full flex-col border-r border-slate-200 bg-white p-6 lg:min-h-screen lg:w-[380px] lg:p-8">
                <div className="mb-10 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/employees')}
                        className="rounded-lg bg-slate-100 p-2.5 transition-colors hover:bg-slate-200"
                    >
                        <Icon.Back />
                    </button>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">
                        Profil Pracownika
                    </h2>
                </div>

                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-4xl font-bold text-white shadow-lg">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-slate-800">
                        {fullName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {editData.position || 'Brak stanowiska'}
                    </p>
                </div>

                <div className="space-y-6">
                    <StatCard icon={<Icon.Badge />} title="Status i Umowa">
                        {isEditing ? (
                            <div className="space-y-3">
                                <select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-500"
                                >
                                    {AVAILABLE_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {translateStatus(s)}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="contractType"
                                    value={editData.contractType}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-500"
                                >
                                    {AVAILABLE_CONTRACT_TYPES.map((c) => (
                                        <option key={c} value={c}>
                                            {translateContractType(c)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <span
                                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${getStatusClasses(user.status)}`}
                                >
                                    {translateStatus(user.status)}
                                </span>
                                <span
                                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${getContractClasses(user.contractType)}`}
                                >
                                    {translateContractType(user.contractType)}
                                </span>
                            </div>
                        )}
                    </StatCard>

                    <StatCard icon={<Icon.Calendar />} title="Staż pracy">
                        <p className="text-lg font-bold text-slate-800">
                            {calculateWorkExperience(user.hireDate)}
                        </p>
                    </StatCard>

                    <StatCard icon={<Icon.Briefcase />} title="Dział">
                        {isEditing ? (
                            <select
                                name="department"
                                value={editData.department}
                                onChange={handleEditChange}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">-- Wybierz --</option>
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-lg font-bold text-slate-800">
                                {user.department || 'Nie określono'}
                            </p>
                        )}
                    </StatCard>
                </div>

                <div className="mt-auto pt-8 text-center text-xs text-slate-400">
                    <p>
                        Utworzony:{' '}
                        <span className="font-semibold text-slate-500">
                            {formatDateForDisplay(user.createdAt)}
                        </span>
                    </p>
                </div>
            </aside>

            {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
            <main className="w-full flex-grow p-6 lg:p-10">
                <header className="relative mb-10 overflow-hidden rounded-t-xl bg-white border-b p-8">
                    <div className="relative z-10">
                        {isEditing ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={editData.firstName}
                                    onChange={handleEditChange}
                                    placeholder="Imię..."
                                    className="rounded border-b-2 border-gray-300 bg-gray-100 px-2 py-1 text-lg font-bold text-gray-800 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={editData.lastName}
                                    onChange={handleEditChange}
                                    placeholder="Nazwisko..."
                                    className="rounded border-b-2 border-gray-300 bg-gray-100 px-2 py-1 text-lg font-bold text-gray-800 focus:outline-none"
                                />
                            </div>
                        ) : (
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 lg:text-5xl">
                                {fullName}
                            </h1>
                        )}
                        {isAdmin && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-60"
                                        >
                                            {isSaving ? (
                                                'Zapisywanie...'
                                            ) : (
                                                <>
                                                    <Icon.Save /> Zapisz zmiany
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                fetchData();
                                            }}
                                            className="flex items-center gap-2 rounded-lg bg-gray-200 px-5 py-2.5 font-bold text-gray-800 transition-all hover:bg-gray-300"
                                        >
                                            <Icon.Cancel /> Anuluj
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-slate-900"
                                    >
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
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {isEditing ? (
                                <>
                                    <EditableField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={editData.email}
                                        onChange={handleEditChange}
                                    />
                                    <EditableField
                                        label="Numer telefonu"
                                        name="phoneNumber"
                                        value={editData.phoneNumber}
                                        onChange={handleEditChange}
                                    />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Email
                                        </p>
                                        <a
                                            href={`mailto:${user.email}`}
                                            className="text-lg font-bold text-emerald-600 hover:underline"
                                        >
                                            {user.email}
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Numer telefonu
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {user.phoneNumber || 'Nie podano'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Praca */}
                    <ContentCard
                        icon={<Icon.Briefcase />}
                        title="Informacje zawodowe"
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {isEditing ? (
                                <>
                                    <EditableField
                                        label="Stanowisko"
                                        name="position"
                                        value={editData.position}
                                        onChange={handleEditChange}
                                    />
                                    <EditableField
                                        label="Rola w systemie"
                                        name="role"
                                        value={editData.role}
                                        options={AVAILABLE_ROLES}
                                        onChange={handleEditChange}
                                    />
                                    <EditableField
                                        label="Data zatrudnienia"
                                        name="hireDate"
                                        type="date"
                                        value={editData.hireDate}
                                        onChange={handleEditChange}
                                    />
                                    <EditableField
                                        label="Pensja (PLN)"
                                        name="salary"
                                        type="number"
                                        value={editData.salary}
                                        onChange={handleEditChange}
                                    />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Stanowisko
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {user.position || 'Nie określono'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Rola
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {translateRole(user.role)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Data zatrudnienia
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {formatDateForDisplay(
                                                user.hireDate,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Pensja
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {user.salary > 0
                                                ? `${user.salary} PLN`
                                                : 'Nie określono'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Adres */}
                    <ContentCard icon={<Icon.Location />} title="Adres">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {isEditing ? (
                                <>
                                    <EditableField
                                        label="Adres"
                                        name="address"
                                        value={editData.address}
                                        onChange={handleEditChange}
                                    />
                                    <EditableField
                                        label="Miasto"
                                        name="city"
                                        value={editData.city}
                                        onChange={handleEditChange}
                                    />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Adres
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {user.address || 'Nie podano'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Miasto
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {user.city || 'Nie podano'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Dane osobiste */}
                    <ContentCard icon={<Icon.Badge />} title="Dane osobiste">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {isEditing ? (
                                <>
                                    <EditableField
                                        label="PESEL/ID"
                                        name="peselOrId"
                                        value={editData.peselOrId}
                                        onChange={handleEditChange}
                                    />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            PESEL/ID
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {user.peselOrId || 'Nie podano'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Notatki */}
                    <ContentCard icon={<Icon.Notes />} title="Notatki">
                        {isEditing ? (
                            <EditableField
                                label="Notatki pracownika"
                                name="notes"
                                type="textarea"
                                value={editData.notes}
                                onChange={handleEditChange}
                            />
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                                {user.notes || 'Brak notatek'}
                            </p>
                        )}
                    </ContentCard>

                    {/* Sekcja Historia Zatrudnienia */}
                    <ContentCard
                        icon={<Icon.Briefcase />}
                        title="Historia zatrudnienia"
                    >
                        <div className="space-y-6">
                            {isEditing
                                ? editData.employmentHistory.map(
                                      (item, index) => (
                                          <div
                                              key={index}
                                              className="rounded-lg border bg-slate-50 p-4"
                                          >
                                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                  <EditableField
                                                      label="Firma"
                                                      name="company"
                                                      value={item.company}
                                                      onChange={(e) =>
                                                          handleHistoryChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                  />
                                                  <EditableField
                                                      label="Stanowisko"
                                                      name="position"
                                                      value={item.position}
                                                      onChange={(e) =>
                                                          handleHistoryChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                  />
                                                  <EditableField
                                                      label="Data rozpoczęcia"
                                                      name="startDate"
                                                      type="date"
                                                      value={formatDateForInput(
                                                          item.startDate,
                                                      )}
                                                      onChange={(e) =>
                                                          handleHistoryChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                  />
                                                  <EditableField
                                                      label="Data zakończenia"
                                                      name="endDate"
                                                      type="date"
                                                      value={formatDateForInput(
                                                          item.endDate,
                                                      )}
                                                      onChange={(e) =>
                                                          handleHistoryChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                  />
                                              </div>
                                              <textarea
                                                  name="description"
                                                  rows="3"
                                                  placeholder="Opis..."
                                                  value={item.description}
                                                  onChange={(e) =>
                                                      handleHistoryChange(
                                                          index,
                                                          e,
                                                      )
                                                  }
                                                  className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                              ></textarea>
                                              <button
                                                  onClick={() =>
                                                      handleRemoveHistory(index)
                                                  }
                                                  className="mt-2 text-sm font-semibold text-red-600 hover:text-red-800"
                                              >
                                                  Usuń
                                              </button>
                                          </div>
                                      ),
                                  )
                                : employmentHistory.map((item, index) => (
                                      <div
                                          key={index}
                                          className="relative pl-8"
                                      >
                                          <div className="absolute left-0 top-1 h-full w-px bg-slate-200"></div>
                                          <div className="absolute left-[-5px] top-1 h-3 w-3 rounded-full bg-emerald-500"></div>
                                          <p className="font-bold text-slate-800">
                                              {item.position}
                                          </p>
                                          <p className="text-sm text-slate-600">
                                              {item.company}
                                          </p>
                                          <p className="text-xs text-slate-400">
                                              {formatDateForDisplay(
                                                  item.startDate,
                                              )}{' '}
                                              -{' '}
                                              {formatDateForDisplay(
                                                  item.endDate,
                                              )}
                                          </p>
                                          <p className="mt-2 text-sm text-slate-500">
                                              {item.description}
                                          </p>
                                      </div>
                                  ))}
                            {isEditing && (
                                <button
                                    onClick={handleAddHistory}
                                    className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-200"
                                >
                                    + Dodaj wpis
                                </button>
                            )}
                            {!isEditing &&
                                employmentHistory.length === 0 && (
                                    <p className="text-slate-500">
                                        Brak historii zatrudnienia.
                                    </p>
                                )}
                        </div>
                    </ContentCard>

                    {/* Sekcja Dokumenty i Umowy */}
                    <ContentCard
                        icon={<Icon.Documents />}
                        title="Dokumenty i Umowy"
                    >
                        <div className="space-y-6">
                            {isEditing
                                ? (editData.documents || []).map(
                                      (doc, index) => (
                                          <div
                                              key={index}
                                              className="rounded-lg border bg-slate-50 p-4"
                                          >
                                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                  <EditableField
                                                      label="Nazwa dokumentu"
                                                      name="name"
                                                      value={doc.name}
                                                      onChange={(e) =>
                                                          handleDocumentChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                  />
                                                  <EditableField
                                                      label="URL do pliku"
                                                      name="url"
                                                      value={doc.url}
                                                      onChange={(e) =>
                                                          handleDocumentChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                  />
                                                  <EditableField
                                                      label="Kategoria"
                                                      name="category"
                                                      value={doc.category}
                                                      options={[
                                                          'documentation',
                                                          'agreement',
                                                      ]}
                                                      onChange={(e) =>
                                                          handleDocumentChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                  />
                                              </div>
                                              <button
                                                  onClick={() =>
                                                      handleRemoveDocument(index)
                                                  }
                                                  className="mt-4 text-sm font-semibold text-red-600 hover:text-red-800"
                                              >
                                                  Usuń dokument
                                              </button>
                                          </div>
                                      ),
                                  )
                                : (user.documents || []).map((doc, index) => (
                                      <div
                                          key={index}
                                          className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                                      >
                                          <div className="flex flex-col">
                                              <a
                                                  href={doc.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="font-bold text-emerald-600 hover:underline"
                                              >
                                                  {doc.name}
                                              </a>
                                              <span className="text-sm text-slate-500">
                                                  {doc.category === 'agreement'
                                                      ? 'Umowa'
                                                      : 'Dokumentacja'}
                                              </span>
                                          </div>
                                          <span className="text-xs text-slate-400">
                                              Dodano:{' '}
                                              {formatDateForDisplay(
                                                  doc.uploadedAt,
                                              )}
                                          </span>
                                      </div>
                                  ))}

                            {isEditing && (
                                <button
                                    onClick={handleAddDocument}
                                    className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-200"
                                >
                                    + Dodaj dokument
                                </button>
                            )}

                            {!isEditing &&
                                (!user.documents ||
                                    user.documents.length === 0) && (
                                    <p className="text-slate-500">
                                        Brak dokumentów i umów.
                                    </p>
                                )}
                        </div>
                    </ContentCard>
                </div>
            </main>
        </div>
    );
}
