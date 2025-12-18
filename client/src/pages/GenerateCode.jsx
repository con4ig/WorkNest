import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import {
    Key,
    ArrowLeft,
    RefreshCw,
    Sparkles,
    Trash2,
    Copy,
    Check,
    Users,
    Clock,
    Shield,
    Infinity as InfinityIcon,
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen.jsx';
import CustomSelect from '../components/common/CustomSelect.jsx';
import moment from 'moment';
import 'moment/locale/pl';
import { useAuth } from '../context/AuthContext';

moment.locale('pl');

export default function GenerateCode() {
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState(true);
    const [invitations, setInvitations] = useState([]);
    const { user: currentUser } = useAuth();
    const [showDemoWarning, setShowDemoWarning] = useState(false);
    
    // Form state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        role: 'employee',
        type: 'single', // 'single' or 'multi'
        maxUses: 5,
        expiresIn: '5m', // 5 minut default
    });
    
    // Copy feedback state
    const [copiedId, setCopiedId] = useState(null);

    const fetchInvitations = useCallback(async () => {
        try {
            const res = await api.get('/users/invitations');
            const sorted = res.data.sort((a, b) => {
                const aExpired = new Date(a.expiresAt) < new Date();
                const bExpired = new Date(b.expiresAt) < new Date();
                if (aExpired === bExpired) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return aExpired ? 1 : -1;
            });
            setInvitations(sorted);
        } catch (err) {
            console.error('Błąd pobierania zaproszeń:', err);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchInvitations();
            setPageLoading(false);
        };
        init();
    }, [fetchInvitations]);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                role: formData.role,
                expiresIn: formData.expiresIn,
                maxUses: formData.type === 'single' ? 1 : (formData.maxUses || 2),
            };
            
            await api.post('/users/generate-invitation', payload);
            await fetchInvitations();
        } catch (err) {
            setError(err.response?.data?.message || 'Błąd generowania kodu');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm('Czy na pewno chcesz unieważnić ten kod?')) return;
        try {
            await api.delete(`/users/invitations/${id}`);
            await fetchInvitations();
        } catch (err) {
            alert('Nie udało się usunąć zaproszenia');
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Options for selects
    const roleOptions = [
        { id: 'employee', name: 'Pracownik' },
        { id: 'hr', name: 'HR Manager' },
        { id: 'admin', name: 'Administrator' },
    ];

    const expirationOptions = [
        { id: '5m', name: '5 minut' },
        { id: '30m', name: '30 minut' },
        { id: '1h', name: '1 godzina' },
        { id: '24h', name: '24 godziny' },
        { id: '7d', name: '7 dni' },
        { id: '30d', name: '30 dni' },
    ];

    if (pageLoading) return <LoadingScreen message="Ładowanie panelu..." />;

    return (
        <div className="min-h-screen bg-gray-100 p-6 lg:p-10">
            {/* Header */}
            <div className="mx-auto mb-8 max-w-7xl">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
                >
                    <ArrowLeft className="h-4 w-4" /> Wróć do dashboardu
                </button>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                            Zarządzanie Zaproszeniami
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 md:text-base">
                            Generuj kody dostępu i monitoruj ich wykorzystanie w
                            swojej organizacji.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-12">
                {/* Left Column: Generator Form */}
                <div className="lg:col-span-4">
                    <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Nowy Kod
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {/* Role Selection */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Rola użytkownika
                                </label>
                                <CustomSelect
                                    options={roleOptions}
                                    selected={formData.role}
                                    onChange={(val) =>
                                        setFormData({ ...formData, role: val })
                                    }
                                    placeholder="Wybierz rolę"
                                />
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Rodzaj zaproszenia
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                type: 'single',
                                            })
                                        }
                                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                                            formData.type === 'single'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Users className="h-5 w-5" />
                                        <span className="text-xs font-medium">
                                            Jednorazowe
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                type: 'multi',
                                            })
                                        }
                                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                                            formData.type === 'multi'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex">
                                            <Users className="h-5 w-5" />
                                            <InfinityIcon className="h-3 w-3 -ml-1 text-current" />
                                        </div>
                                        <span className="text-xs font-medium">
                                            Wielokrotne
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Max Uses (only for multi) */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ${formData.type === 'multi' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Limit użyć
                                </label>
                                <input
                                    type="number"
                                    min="2"
                                    max="1000"
                                    value={formData.maxUses}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({
                                            ...formData,
                                            maxUses:
                                                val === ''
                                                    ? ''
                                                    : parseInt(val),
                                        });
                                    }}
                                    onBlur={() => {
                                        if (
                                            !formData.maxUses ||
                                            formData.maxUses < 2
                                        ) {
                                            setFormData({
                                                ...formData,
                                                maxUses: 2,
                                            });
                                        }
                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Expiration */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Czas ważności
                                </label>
                                <CustomSelect
                                    options={expirationOptions}
                                    selected={formData.expiresIn}
                                    onChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            expiresIn: val,
                                        })
                                    }
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (
                                        currentUser?.email ===
                                        'demo@worknest.com'
                                    ) {
                                        setShowDemoWarning(true);
                                    } else {
                                        handleGenerate();
                                    }
                                }}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>Generowanie...</>
                                ) : (
                                    <>
                                        Generuj kod{' '}
                                        <RefreshCw className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Invitations List */}
                <div className="lg:col-span-8">
                    <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
                        <h3 className="mb-6 text-lg font-bold text-gray-900">
                            Aktywne Zaproszenia ({invitations.length})
                        </h3>

                        {invitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                    <Key className="h-7 w-7 text-gray-400" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-900">
                                    Brak aktywnych kodów
                                </h4>
                                <p className="mt-1 text-xs text-gray-500">
                                    Wygenerowane kody pojawią się w tym
                                    miejscu.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invitations.map((inv) => {
                                    const isExpired =
                                        new Date(inv.expiresAt) < new Date();
                                    const progress =
                                        inv.maxUses > 1
                                            ? (inv.uses / inv.maxUses) * 100
                                            : 0;

                                    return (
                                        <div
                                            key={inv._id}
                                            className={`group flex flex-col gap-4 rounded-lg border p-4 transition-all hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between ${
                                                isExpired
                                                    ? 'border-gray-100 bg-gray-50 opacity-70'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            {/* Code & Role info */}
                                            <div className="flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                                                    <span className="font-mono text-lg font-bold tracking-wider text-gray-800 sm:text-xl">
                                                        {inv.code}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                inv.code,
                                                                inv._id,
                                                            )
                                                        }
                                                        className="rounded p-1 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                                        title="Kopiuj kod"
                                                    >
                                                        {copiedId ===
                                                        inv._id ? (
                                                            <Check className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                            inv.role ===
                                                            'admin'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : inv.role ===
                                                                    'hr'
                                                                  ? 'bg-blue-100 text-blue-700'
                                                                  : 'bg-emerald-100 text-emerald-700'
                                                        }`}
                                                    >
                                                        {inv.role}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3" />
                                                        {isExpired
                                                            ? 'Wygasł'
                                                            : `Wygasa ${moment(inv.expiresAt).fromNow()}`}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Shield className="h-3 w-3" />
                                                        {inv.createdBy
                                                            ?.username ||
                                                            'Nieznany'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Usage & Delete */}
                                            <div className="flex items-center justify-between gap-4 border-t pt-3 sm:justify-start sm:border-t-0 sm:pt-0">
                                                {inv.maxUses > 1 && (
                                                    <div className="flex flex-col items-start gap-1 sm:items-end">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                            <Users className="h-3.5 w-3.5" />
                                                            {inv.uses} /{' '}
                                                            {inv.maxUses}
                                                        </div>
                                                        <div className="h-1 w-20 overflow-hidden rounded-full bg-gray-200">
                                                            <div
                                                                className="h-full bg-emerald-500 transition-all"
                                                                style={{
                                                                    width: `${progress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        handleRevoke(inv._id)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 opacity-60 transition-all hover:bg-red-100 hover:text-red-600 hover:opacity-100 group-hover:opacity-100"
                                                    title="Unieważnij kod"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Demo Warning Modal */}
            {showDemoWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="bg-amber-50 p-6 pb-4">
                             <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 rounded-full bg-amber-100 p-3 text-amber-600">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Środowisko Testowe (Demo)
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                        Pamiętaj, że konto Demo jest <strong>tymczasowe</strong>. 
                                    </p>
                                </div>
                             </div>
                        </div>
                        <div className="px-6 py-4">
                            <ul className="mb-4 space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                                    <span>Wygenerowany kod <strong>zadziała poprawnie</strong> przy rejestracji.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                     <Trash2 className="h-5 w-5 flex-shrink-0 text-amber-500" />
                                    <span>Jeżeli klikniesz "Wypróbuj Demo" ponownie, <strong>wszystkie dane (w tym ten kod i nowi użytkownicy) zostaną usunięte</strong>.</span>
                                </li>
                            </ul>
                            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                                <strong>Wskazówka:</strong> Skopiuj kod, wyloguj się i użyj go od razu w formularzu rejestracji, aby przetestować proces onboardingu.
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                            <button
                                onClick={() => setShowDemoWarning(false)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={() => {
                                    setShowDemoWarning(false);
                                    handleGenerate();
                                }}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Rozumiem, generuj kod
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
