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
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { clsx } from 'clsx';

import LoadingScreen from '../components/LoadingScreen';
import { Select } from '../components/ui/Select';
// --- Pomocnicze funkcje formatowania ---
const formatDateForDisplay = (dateString, language = 'pl') => {
    if (!dateString) return null;
    try {
        return moment(dateString).locale(language).format('LL');
    } catch {
        return null;
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

const calculateWorkExperience = (hireDate, t) => {
    if (!hireDate) return t('common.notSpecified');
    try {
        const hire = moment(hireDate);
        const now = moment();
        const years = now.diff(hire, 'years');
        hire.add(years, 'years');
        const months = now.diff(hire, 'months');

        let result = '';
        if (years > 0) {
            result += `${years} ${t('common.years', { count: years })} `;
        }
        if (months > 0 || years === 0) {
            result += `${months} ${t('common.months', { count: months })}`;
        }
        return result.trim();
    } catch {
        return t('common.invalidDate');
    }
};

// --- Komponenty Ikon ---
const Icon = {
    Mail: ({ className = '' }) => <Mail className={`h-5 w-5 ${className}`} />,
    Phone: ({ className = '' }) => <Phone className={`h-5 w-5 ${className}`} />,
    Briefcase: ({ className = '' }) => (
        <Briefcase className={`h-5 w-5 ${className}`} />
    ),
    Building: ({ className = '' }) => (
        <Building2 className={`h-5 w-5 ${className}`} />
    ),
    Location: ({ className = '' }) => (
        <MapPin className={`h-5 w-5 ${className}`} />
    ),
    Calendar: ({ className = '' }) => (
        <Calendar className={`h-5 w-5 ${className}`} />
    ),
    Edit: () => <SquarePen className="h-4 w-4" />,
    Save: () => <Save className="h-4 w-4" />,
    Cancel: () => <X className="h-4 w-4" />,
    Back: () => <ArrowLeft className="h-4 w-4" />,
    Badge: ({ className = '' }) => <Badge className={`h-5 w-5 ${className}`} />,
    Notes: ({ className = '' }) => (
        <FileText className={`h-5 w-5 ${className}`} />
    ),
    Documents: ({ className = '' }) => (
        <FileText className={`h-5 w-5 ${className}`} />
    ),
};

// --- Styling helpers ---
const getStatusClasses = (status) => {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-500 ring-green-500/20';
        case 'inactive':
            return 'bg-muted text-muted-foreground ring-border';
        case 'on-leave':
            return 'bg-blue-500/10 text-blue-500 ring-blue-500/20';
        case 'terminated':
            return 'bg-destructive/10 text-destructive ring-destructive/20';
        default:
            return 'bg-muted text-muted-foreground ring-border';
    }
};

const getContractClasses = (type) => {
    switch (type) {
        case 'full-time':
            return 'bg-primary/10 text-primary';
        case 'part-time':
            return 'bg-yellow-500/10 text-yellow-500';
        case 'contract':
            return 'bg-purple-500/10 text-purple-500';
        case 'temporary':
            return 'bg-orange-500/10 text-orange-500';
        default:
            return 'bg-muted text-muted-foreground';
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
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:bg-muted/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {title}
            </h3>
            <div className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                {children}
            </div>
        </div>
    </div>
);

const ContentCard = ({ icon, title, children, actions }) => (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                    {icon}
                </div>
                <h2 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {title}
                </h2>
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
        <div className="p-4 sm:p-6">{children}</div>
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
}) => {
    const { t } = useTranslation();
    const inputClasses =
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/40';

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={`field-${name}`}
                className="ml-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
                {label}
            </label>
            {options ? (
                <Select
                    id={`field-${name}`}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    <option value="">-- {t('common.select')} --</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {name === 'role'
                                ? t(`common.roles.${opt}`)
                                : name === 'department'
                                  ? t(`common.departments.${opt}`)
                                  : opt}
                        </option>
                    ))}
                </Select>
            ) : type === 'textarea' ? (
                <textarea
                    id={`field-${name}`}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    rows={4}
                    className={inputClasses}
                />
            ) : (
                <input
                    id={`field-${name}`}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={inputClasses}
                />
            )}
        </div>
    );
};

// --- Main component ---
export default function UserDetails() {
    const { t, i18n } = useTranslation();
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

            // Set default values for HR fields if missing
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
            setError(`Failed to load employee data: ${err.message}`);
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

            // Update state directly from API response
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
                err.response?.data?.message || t('common.errors.unexpected');
            alert(`${t('common.errors.saveFailed')}: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading)
        return <LoadingScreen message={t('employees.loadingDetails')} />;

    if (error)
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
                <div className="w-full max-w-lg rounded-xl border border-destructive/50 bg-destructive/10 px-8 py-6 text-destructive shadow-lg">
                    <strong className="mb-2 block text-lg font-bold">
                        {t('common.error')}
                    </strong>
                    <span>{error}</span>
                    <button
                        onClick={() => navigate('/employees')}
                        className="mt-6 w-full rounded-lg bg-destructive px-4 py-2 font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
                    >
                        {t('common.back')}
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
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground lg:flex-row">
            {/* --- SIDEBAR --- */}
            <aside className="flex w-full flex-col border-r border-border bg-card p-6 lg:min-h-screen lg:w-[360px] lg:p-8">
                <div className="mb-10 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/employees')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-all hover:bg-secondary active:scale-95"
                    >
                        <Icon.Back />
                    </button>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {t('employees.details.title')}
                        </p>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            {user.username}
                        </h2>
                    </div>
                </div>

                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary/10 text-4xl font-black text-primary shadow-lg">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        {fullName}
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-bold text-muted-foreground">
                        <Icon.Briefcase className="h-3 w-3" />
                        {editData.position || t('common.noPosition')}
                    </div>
                </div>

                <div className="space-y-4">
                    <StatCard
                        icon={<Icon.Badge />}
                        title={t('employees.details.statusAndContract')}
                    >
                        {isEditing ? (
                            <div className="mt-2 space-y-2">
                                <Select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleEditChange}
                                >
                                    {AVAILABLE_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {t(`common.employeeStatus.${s}`)}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    name="contractType"
                                    value={editData.contractType}
                                    onChange={handleEditChange}
                                >
                                    {AVAILABLE_CONTRACT_TYPES.map((c) => (
                                        <option key={c} value={c}>
                                            {t(`common.contractType.${c}`)}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        ) : (
                            <div className="mt-1 flex flex-wrap gap-2">
                                <span
                                    className={clsx(
                                        'rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                                        getStatusClasses(user.status),
                                    )}
                                >
                                    {t(`common.employeeStatus.${user.status}`)}
                                </span>
                                <span
                                    className={clsx(
                                        'rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                                        getContractClasses(user.contractType),
                                    )}
                                >
                                    {t(
                                        `common.contractType.${user.contractType}`,
                                    )}
                                </span>
                            </div>
                        )}
                    </StatCard>
                    <StatCard
                        icon={<Icon.Calendar />}
                        title={t('employees.details.workExperience')}
                    >
                        <span className="text-sm font-bold tracking-tight text-foreground">
                            {calculateWorkExperience(user.hireDate, t)}
                        </span>
                    </StatCard>
                    <StatCard
                        icon={<Icon.Briefcase />}
                        title={t('common.department')}
                    >
                        {isEditing ? (
                            <div className="mt-2">
                                <Select
                                    name="department"
                                    value={editData.department}
                                    onChange={handleEditChange}
                                >
                                    <option value="">
                                        -- {t('common.select')} --
                                    </option>
                                    {DEPARTMENTS.map((d) => (
                                        <option key={d} value={d}>
                                            {t(`common.departments.${d}`)}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        ) : (
                            <span className="text-sm font-bold tracking-tight text-foreground">
                                {user.department
                                    ? t(`common.departments.${user.department}`)
                                    : t('common.notSpecified')}
                            </span>
                        )}
                    </StatCard>
                </div>

                <div className="mt-auto pt-8 text-center text-xs text-muted-foreground">
                    <p>
                        {t('common.createdAt')}{' '}
                        <span className="font-semibold text-foreground">
                            {formatDateForDisplay(
                                user.createdAt,
                                i18n.language,
                            ) || t('common.notSpecified')}
                        </span>
                    </p>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
                <div className="space-y-10">
                    <header className="relative rounded-lg border border-border bg-card p-10 shadow-sm sm:p-12">
                        <div className="relative z-10">
                            {isEditing ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editData.firstName}
                                        onChange={handleEditChange}
                                        placeholder={`${t('common.firstName')}...`}
                                        className="w-full border-b border-border bg-transparent text-3xl font-bold tracking-tight text-foreground focus:border-primary focus:outline-none sm:text-4xl lg:text-5xl"
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editData.lastName}
                                        onChange={handleEditChange}
                                        placeholder={`${t('common.lastName')}...`}
                                        className="w-full border-b border-border bg-transparent text-3xl font-bold tracking-tight text-foreground focus:border-primary focus:outline-none sm:text-4xl lg:text-5xl"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                    {fullName}
                                </h1>
                            )}

                            {isAdmin && (
                                <div className="mt-8 flex flex-wrap gap-3">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                                        {t('common.saving')}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Icon.Save />
                                                        {t(
                                                            'common.saveChanges',
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    fetchData();
                                                }}
                                                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
                                            >
                                                <Icon.Cancel />
                                                {t('common.cancel')}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                                        >
                                            <Icon.Edit />
                                            {t('common.editData')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="space-y-8 pb-20">
                        {/* Sekcja Kontakt */}
                        <ContentCard
                            icon={<Icon.Mail />}
                            title={t('common.contact')}
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {isEditing ? (
                                    <>
                                        <EditableField
                                            label={t('common.email')}
                                            name="email"
                                            type="email"
                                            value={editData.email}
                                            onChange={handleEditChange}
                                        />
                                        <EditableField
                                            label={t('common.phoneNumber')}
                                            name="phoneNumber"
                                            value={editData.phoneNumber}
                                            onChange={handleEditChange}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t('common.email')}
                                            </p>
                                            <a
                                                href={`mailto:${user.email}`}
                                                className="text-base font-semibold text-primary hover:underline"
                                            >
                                                {user.email}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t('common.phoneNumber')}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {user.phoneNumber ||
                                                    t('common.notProvided')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ContentCard>

                        {/* Sekcja Praca */}
                        <ContentCard
                            icon={<Icon.Briefcase />}
                            title={t('employees.details.professionalInfo')}
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {isEditing ? (
                                    <>
                                        <EditableField
                                            label={t('common.position')}
                                            name="position"
                                            value={editData.position}
                                            onChange={handleEditChange}
                                        />
                                        <EditableField
                                            label={t('common.roleInSystem')}
                                            name="role"
                                            value={editData.role}
                                            options={AVAILABLE_ROLES}
                                            onChange={handleEditChange}
                                        />
                                        <EditableField
                                            label={t('projects.labelStartDate')}
                                            name="hireDate"
                                            type="date"
                                            value={editData.hireDate}
                                            onChange={handleEditChange}
                                        />
                                        <EditableField
                                            label={t(
                                                'employees.details.salary',
                                            )}
                                            name="salary"
                                            type="number"
                                            value={editData.salary}
                                            onChange={handleEditChange}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t('common.position')}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {user.position ||
                                                    t('common.notSpecified')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t('common.role')}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {t(`common.roles.${user.role}`)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t(
                                                    'employees.details.hireDate',
                                                )}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {formatDateForDisplay(
                                                    user.hireDate,
                                                    i18n.language,
                                                ) || t('common.notSpecified')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t(
                                                    'employees.details.salaryLabel',
                                                )}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {user.salary > 0
                                                    ? `${user.salary} PLN`
                                                    : t('common.notSpecified')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ContentCard>

                        {/* Sekcja Adres */}
                        <ContentCard
                            icon={<Icon.Location />}
                            title={t('common.address')}
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {isEditing ? (
                                    <>
                                        <EditableField
                                            label={t('common.address')}
                                            name="address"
                                            value={editData.address}
                                            onChange={handleEditChange}
                                        />
                                        <EditableField
                                            label={t('common.city')}
                                            name="city"
                                            value={editData.city}
                                            onChange={handleEditChange}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t('common.address')}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {user.address ||
                                                    t('common.notProvided')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t('common.city')}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {user.city ||
                                                    t('common.notProvided')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ContentCard>

                        {/* Sekcja Dane osobiste */}
                        <ContentCard
                            icon={<Icon.Badge />}
                            title={t('employees.details.personalData')}
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {isEditing ? (
                                    <>
                                        <EditableField
                                            label={t(
                                                'employees.details.peselId',
                                            )}
                                            name="peselOrId"
                                            value={editData.peselOrId}
                                            onChange={handleEditChange}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {t('employees.details.peselId')}
                                            </p>
                                            <p className="text-base font-semibold text-foreground">
                                                {user.peselOrId ||
                                                    t('common.notProvided')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ContentCard>

                        {/* Sekcja Notatki */}
                        <ContentCard
                            icon={<Icon.Notes />}
                            title={t('common.notes')}
                        >
                            {isEditing ? (
                                <EditableField
                                    label={t('employees.details.notesLabel')}
                                    name="notes"
                                    type="textarea"
                                    value={editData.notes}
                                    onChange={handleEditChange}
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground/80">
                                    {user.notes ||
                                        t('employees.details.noNotes')}
                                </p>
                            )}
                        </ContentCard>

                        {/* Sekcja Historia Zatrudnienia */}
                        <ContentCard
                            icon={<Icon.Briefcase />}
                            title={t('employees.details.employmentHistory')}
                        >
                            <div className="space-y-6">
                                {isEditing
                                    ? editData.employmentHistory.map(
                                          (item, index) => (
                                              <div
                                                  key={index}
                                                  className="rounded-lg border border-border bg-muted/50 p-4"
                                              >
                                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                      <EditableField
                                                          label={t(
                                                              'common.company',
                                                          )}
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
                                                          label={t(
                                                              'common.position',
                                                          )}
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
                                                          label={t(
                                                              'projects.labelStartDate',
                                                          )}
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
                                                          label={t(
                                                              'projects.labelEndDate',
                                                          )}
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
                                                      placeholder={`${t('common.description')}...`}
                                                      value={item.description}
                                                      onChange={(e) =>
                                                          handleHistoryChange(
                                                              index,
                                                              e,
                                                          )
                                                      }
                                                      className="mt-4 w-full rounded-lg border border-input bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                  ></textarea>
                                                  <button
                                                      onClick={() =>
                                                          handleRemoveHistory(
                                                              index,
                                                          )
                                                      }
                                                      className="mt-2 text-sm font-semibold text-destructive hover:text-destructive/80"
                                                  >
                                                      {t('common.delete')}
                                                  </button>
                                              </div>
                                          ),
                                      )
                                    : employmentHistory.map((item, index) => (
                                          <div
                                              key={index}
                                              className="group relative pb-8 pl-8 last:pb-0"
                                          >
                                              {/* Timeline line */}
                                              <div className="absolute left-0 top-2 h-full w-[2px] bg-border last:hidden" />

                                              {/* Timeline dot */}
                                              <div className="absolute left-[-5px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />

                                              <div>
                                                  <p className="text-base font-bold text-foreground">
                                                      {item.position}
                                                  </p>
                                                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                                                      <Icon.Building className="h-4 w-4" />
                                                      {item.company}
                                                  </p>
                                                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      {formatDateForDisplay(
                                                          item.startDate,
                                                      )}{' '}
                                                      —{' '}
                                                      {formatDateForDisplay(
                                                          item.endDate,
                                                      )}
                                                  </p>
                                                  <p className="mt-2 rounded-lg border border-border/10 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground/80">
                                                      {item.description}
                                                  </p>
                                              </div>
                                          </div>
                                      ))}
                                {isEditing && (
                                    <button
                                        onClick={handleAddHistory}
                                        className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/30"
                                    >
                                        +{' '}
                                        {t('employees.details.addHistoryEntry')}
                                    </button>
                                )}
                                {!isEditing &&
                                    employmentHistory.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            {t('employees.details.noHistory')}
                                        </p>
                                    )}
                            </div>
                        </ContentCard>

                        {/* Sekcja Dokumenty i Umowy */}
                        <ContentCard
                            icon={<Icon.Documents />}
                            title={t(
                                'employees.details.documentsAndAgreements',
                            )}
                        >
                            <div className="space-y-4">
                                {isEditing
                                    ? (editData.documents || []).map(
                                          (doc, index) => (
                                              <div
                                                  key={index}
                                                  className="rounded-lg border border-border bg-muted/50 p-4"
                                              >
                                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                      <EditableField
                                                          label={t(
                                                              'employees.details.documentName',
                                                          )}
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
                                                          label={t(
                                                              'employees.details.fileUrl',
                                                          )}
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
                                                          label={t(
                                                              'employees.details.category',
                                                          )}
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
                                                          handleRemoveDocument(
                                                              index,
                                                          )
                                                      }
                                                      className="mt-4 text-sm font-semibold text-destructive hover:text-destructive/80"
                                                  >
                                                      {t(
                                                          'employees.details.removeDocument',
                                                      )}
                                                  </button>
                                              </div>
                                          ),
                                      )
                                    : (user.documents || []).map(
                                          (doc, index) => (
                                              <div
                                                  key={index}
                                                  className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/30 sm:flex-row sm:items-center"
                                              >
                                                  <div className="flex items-center gap-4">
                                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                                                          <Icon.Documents />
                                                      </div>
                                                      <div className="flex flex-col">
                                                          <a
                                                              href={doc.url}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-base font-bold text-foreground transition-colors hover:text-primary"
                                                          >
                                                              {doc.name}
                                                          </a>
                                                          <div className="mt-0.5 flex items-center gap-2">
                                                              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                  {doc.category ===
                                                                  'agreement'
                                                                      ? t(
                                                                            'employees.details.agreement',
                                                                        )
                                                                      : t(
                                                                            'employees.details.documentation',
                                                                        )}
                                                              </span>
                                                              <span className="text-[10px] font-medium text-muted-foreground/60">
                                                                  {t(
                                                                      'common.Added',
                                                                  )}
                                                                  :{' '}
                                                                  {formatDateForDisplay(
                                                                      doc.uploadedAt,
                                                                  )}
                                                              </span>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <a
                                                      href={doc.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
                                                  >
                                                      Open
                                                  </a>
                                              </div>
                                          ),
                                      )}

                                {isEditing && (
                                    <button
                                        onClick={handleAddDocument}
                                        className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/30"
                                    >
                                        + {t('employees.details.addDocument')}
                                    </button>
                                )}

                                {!isEditing &&
                                    (!user.documents ||
                                        user.documents.length === 0) && (
                                        <p className="text-sm text-muted-foreground">
                                            {t('employees.details.noDocuments')}
                                        </p>
                                    )}
                            </div>
                        </ContentCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
