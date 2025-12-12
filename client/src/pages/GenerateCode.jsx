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
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
            {/* Header */}
            <div className="mx-auto mb-10 max-w-6xl">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
                >
                    <ArrowLeft className="h-4 w-4" /> Wróć do dashboardu
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Zarządzanie Zaproszeniami
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Generuj kody dostępu i monitoruj ich wykorzystanie w
                            swojej organizacji.
                        </p>
                    </div>
                    <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 sm:flex">
                        <Key className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12">
                {/* Left Column: Generator Form */}
                <div className="lg:col-span-5">
                    <div className="rounded-2xl bg-white shadow-xl shadow-gray-200/50">
                        <div className="rounded-t-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
                            <h2 className="flex items-center gap-2 text-xl font-bold">
                                <Sparkles className="h-5 w-5" /> Nowy Kod
                            </h2>
                            <p className="mt-1 text-emerald-100 opacity-90">
                                Skonfiguruj parametry nowego zaproszenia
                            </p>
                        </div>
                        
                        <div className="space-y-6 p-6">
                            {/* Role Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Rola użytkownika
                                </label>
                                <CustomSelect
                                    options={roleOptions}
                                    selected={formData.role}
                                    onChange={(val) => setFormData({...formData, role: val})}
                                    placeholder="Wybierz rolę"
                                />
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Określa uprawnienia nowego użytkownika w systemie.
                                </p>
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold text-gray-700">
                                    Rodzaj zaproszenia
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setFormData({...formData, type: 'single'})}
                                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                            formData.type === 'single'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <Users className="h-6 w-6" />
                                        <span className="text-sm font-semibold">Jednorazowe</span>
                                    </button>
                                    <button
                                        onClick={() => setFormData({...formData, type: 'multi'})}
                                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                            formData.type === 'multi'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex">
                                            <Users className="h-6 w-6" />
                                            <InfinityIcon className="h-3 w-3 -ml-1 text-current" />
                                        </div>
                                        <span className="text-sm font-semibold">Wielokrotne</span>
                                    </button>
                                </div>
                            </div>

                            {/* Max Uses (only for multi) */}
                            <div className={`overflow-hidden transition-all duration-300 ${formData.type === 'multi' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Expiration */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 font-bold text-white transition-all hover:bg-black hover:shadow-lg disabled:opacity-70"
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
                <div className="lg:col-span-7">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-6 text-lg font-bold text-gray-900">
                            Aktywne Zaproszenia ({invitations.length})
                        </h3>

                        {invitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <Key className="h-8 w-8 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">Brak aktywnych kodów</h4>
                                <p className="mt-1 text-gray-500">
                                    Wygeneruj nowy kod, aby zaprosić pracowników.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invitations.map((inv) => {
                                    const isExpired = new Date(inv.expiresAt) < new Date();
                                    const progress = inv.maxUses > 1 ? (inv.uses / inv.maxUses) * 100 : 0;
                                    
                                    return (
                                        <div 
                                            key={inv._id} 
                                            className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md ${
                                                isExpired ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-emerald-100 bg-white ring-1 ring-emerald-50'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                {/* Code & Role info */}
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-3">
                                                        <span className="font-mono text-2xl font-bold tracking-wider text-emerald-600">
                                                            {inv.code}
                                                        </span>
                                                        <button 
                                                            onClick={() => copyToClipboard(inv.code, inv._id)}
                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                                            title="Kopiuj kod"
                                                        >
                                                            {copiedId === inv._id ? <Check className="h-4 w-4 text-emerald-600"/> : <Copy className="h-4 w-4"/>}
                                                        </button>
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                            inv.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                            inv.role === 'hr' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                            {inv.role.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {isExpired ? 'Wygasł' : `Wygasa ${moment(inv.expiresAt).fromNow()}`}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Shield className="h-3 w-3" />
                                                            Autor: {inv.createdBy?.username || 'Nieznany'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Usage & Delete */}
                                                <div className="flex items-center gap-6">
                                                    {inv.maxUses > 1 && (
                                                         <div className="flex flex-col items-end gap-1">
                                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                                                <Users className="h-4 w-4 text-gray-400" />
                                                                {inv.uses} / {inv.maxUses}
                                                            </div>
                                                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                                                <div 
                                                                    className="h-full bg-emerald-500 transition-all" 
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                         </div>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleRevoke(inv._id)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                                        title="Unieważnij kod"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
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
