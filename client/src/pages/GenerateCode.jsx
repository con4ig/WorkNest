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

moment.locale('pl');

export default function GenerateCode() {
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState(true);
    const [invitations, setInvitations] = useState([]);
    
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
            <div className="mx-auto mb-8 max-w-6xl">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
                >
                    <ArrowLeft className="h-4 w-4" /> Wróć do dashboardu
                </button>
                <div className="flex items-start justify-between">
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

            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-12">
                {/* Left Column: Generator Form */}
                <div className="lg:col-span-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-2">
                             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
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
                                    onChange={(val) => setFormData({...formData, role: val})}
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
                                        onClick={() => setFormData({...formData, type: 'single'})}
                                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                                            formData.type === 'single'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Users className="h-5 w-5" />
                                        <span className="text-xs font-medium">Jednorazowe</span>
                                    </button>
                                    <button
                                        onClick={() => setFormData({...formData, type: 'multi'})}
                                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                                            formData.type === 'multi'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex">
                                            <Users className="h-5 w-5" />
                                            <InfinityIcon className="h-3 w-3 -ml-1 text-current" />
                                        </div>
                                        <span className="text-xs font-medium">Wielokrotne</span>
                                    </button>
                                </div>
                            </div>

                            {/* Max Uses (only for multi) */}
                            <div className={`overflow-hidden transition-all duration-300 ${formData.type === 'multi' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                            maxUses: val === '' ? '' : parseInt(val)
                                        });
                                    }}
                                    onBlur={() => {
                                        if (!formData.maxUses || formData.maxUses < 2) {
                                            setFormData({...formData, maxUses: 2});
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
                                    onChange={(val) => setFormData({...formData, expiresIn: val})}
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>Generowanie...</>
                                ) : (
                                    <>
                                        Generuj kod <RefreshCw className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Invitations List */}
                <div className="lg:col-span-8">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-6 text-lg font-bold text-gray-900">
                            Aktywne Zaproszenia ({invitations.length})
                        </h3>

                        {invitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                    <Key className="h-7 w-7 text-gray-400" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-900">Brak aktywnych kodów</h4>
                                <p className="mt-1 text-xs text-gray-500">
                                    Wygenerowane kody pojawią się w tym miejscu.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invitations.map((inv) => {
                                    const isExpired = new Date(inv.expiresAt) < new Date();
                                    const progress = inv.maxUses > 1 ? (inv.uses / inv.maxUses) * 100 : 0;
                                    
                                    return (
                                        <div 
                                            key={inv._id} 
                                            className={`group flex flex-col gap-4 rounded-lg border p-4 transition-all hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between ${
                                                isExpired ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            {/* Code & Role info */}
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-3">
                                                    <span className="font-mono text-xl font-bold tracking-wider text-gray-800">
                                                        {inv.code}
                                                    </span>
                                                    <button 
                                                        onClick={() => copyToClipboard(inv.code, inv._id)}
                                                        className="rounded p-1 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                                        title="Kopiuj kod"
                                                    >
                                                        {copiedId === inv._id ? <Check className="h-4 w-4 text-emerald-600"/> : <Copy className="h-4 w-4"/>}
                                                    </button>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                        inv.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        inv.role === 'hr' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {inv.role}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {isExpired ? 'Wygasł' : `Wygasa ${moment(inv.expiresAt).fromNow()}`}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Shield className="h-3 w-3" />
                                                        {inv.createdBy?.username || 'Nieznany'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Usage & Delete */}
                                            <div className="flex items-center gap-4 border-t pt-3 sm:border-t-0 sm:pt-0">
                                                {inv.maxUses > 1 && (
                                                     <div className="flex flex-col items-end gap-1 px-2">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                            <Users className="h-3.5 w-3.5" />
                                                            {inv.uses} / {inv.maxUses}
                                                        </div>
                                                        <div className="h-1 w-20 overflow-hidden rounded-full bg-gray-100">
                                                            <div 
                                                                className="h-full bg-emerald-500 transition-all" 
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                     </div>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleRevoke(inv._id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 opacity-60 transition-all hover:bg-red-50 hover:text-red-500 hover:opacity-100 group-hover:opacity-100"
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
        </div>
    );
}
