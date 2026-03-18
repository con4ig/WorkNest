import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            setError(err.response?.data?.message || t('generateCode.generateError') || 'Błąd generowania kodu');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm(t('generateCode.revokeConfirm'))) return;
        try {
            await api.delete(`/users/invitations/${id}`);
            await fetchInvitations();
        } catch (err) {
            alert(t('generateCode.revokeError'));
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Options for selects
    const roleOptions = [
        { id: 'employee', name: t('common.roles.employee') },
        { id: 'hr', name: t('common.roles.hr') },
        { id: 'admin', name: t('common.roles.admin') },
    ];

    const expirationOptions = [
        { id: '5m', name: t('generateCode.expirations.5m') },
        { id: '30m', name: t('generateCode.expirations.30m') },
        { id: '1h', name: t('generateCode.expirations.1h') },
        { id: '24h', name: t('generateCode.expirations.24h') },
        { id: '7d', name: t('generateCode.expirations.7d') },
        { id: '30d', name: t('generateCode.expirations.30d') },
    ];

    if (pageLoading) return <LoadingScreen message={t('generateCode.loading')} />;

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            {/* Ambient Background Elements */}
            <div className="fixed -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
            <div className="fixed -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />

            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-10 lg:px-10">
                <div className="mx-auto max-w-7xl space-y-10">
                    {/* Header */}
                    <header className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 shadow-2xl sm:p-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
                        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
                        
                        <div className="relative z-10">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="group mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/80 transition-all hover:text-primary"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                {t('generateCode.backToDashboard')}
                            </button>
                            
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                            Security & Access
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl lg:text-6xl">
                                        {t('generateCode.title')}
                                    </h1>
                                    <p className="mt-4 max-w-2xl text-lg font-medium text-zinc-400">
                                        {t('generateCode.subtitle')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Generator Form */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-2xl">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
                            
                            <div className="relative z-10">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary border border-primary/20 shadow-inner">
                                        <Sparkles className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight text-white">
                                            {t('generateCode.newCode')}
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                            Generator
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Role Selection */}
                                    <div className="space-y-3">
                                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            {t('generateCode.roleLabel')}
                                        </label>
                                        <CustomSelect
                                            options={roleOptions}
                                            selected={formData.role}
                                            onChange={(val) =>
                                                setFormData({ ...formData, role: val })
                                            }
                                            placeholder={t('generateCode.rolePlaceholder')}
                                        />
                                    </div>

                                    {/* Type Selection */}
                                    <div className="space-y-3">
                                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            {t('generateCode.typeLabel')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        type: 'single',
                                                    })
                                                }
                                                className={`group flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border p-5 transition-all active:scale-95 ${
                                                    formData.type === 'single'
                                                        ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/20 ring-1 ring-primary/30'
                                                        : 'border-white/5 bg-zinc-900/50 text-zinc-500 hover:border-white/10 hover:bg-zinc-800'
                                                }`}
                                            >
                                                <Users className={`h-6 w-6 transition-transform group-hover:scale-110`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {t('generateCode.typeSingle')}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        type: 'multi',
                                                    })
                                                }
                                                className={`group flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border p-5 transition-all active:scale-95 ${
                                                    formData.type === 'multi'
                                                        ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/20 ring-1 ring-primary/30'
                                                        : 'border-white/5 bg-zinc-900/50 text-zinc-500 hover:border-white/10 hover:bg-zinc-800'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <Users className={`h-6 w-6 transition-transform group-hover:scale-110`} />
                                                    <InfinityIcon className="h-4 w-4 -ml-1 text-current opacity-60" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {t('generateCode.typeMulti')}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Max Uses */}
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${formData.type === 'multi' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                                    >
                                        <div className="space-y-3 pt-2">
                                            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                {t('generateCode.maxUsesLabel')}
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
                                                        maxUses: val === '' ? '' : parseInt(val),
                                                    });
                                                }}
                                                className="w-full rounded-[1.25rem] border border-white/10 bg-zinc-950/50 px-5 py-4 text-sm font-bold text-white transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                                            />
                                        </div>
                                    </div>

                                    {/* Expiration */}
                                    <div className="space-y-3">
                                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            {t('generateCode.expirationLabel')}
                                        </label>
                                        <CustomSelect
                                            options={expirationOptions}
                                            selected={formData.expiresIn}
                                            onChange={(val) =>
                                                setFormData({ ...formData, expiresIn: val })
                                            }
                                        />
                                    </div>

                                    {error && (
                                        <div className="animate-in slide-in-from-top-2 rounded-[1.25rem] border border-destructive/20 bg-destructive/10 p-4">
                                            <p className="text-center text-xs font-bold text-destructive">
                                                {error}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (currentUser?.email === 'demo@worknest.com') {
                                                setShowDemoWarning(true);
                                            } else {
                                                handleGenerate();
                                            }
                                        }}
                                        disabled={loading}
                                        className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.25rem] bg-primary py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/30 transition-all hover:bg-primary/90 hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                {t('generateCode.generating')}
                                            </div>
                                        ) : (
                                            <>
                                                {t('generateCode.generateButton')}
                                                <RefreshCw className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Column: Active Invitations List */}
                    <div className="lg:col-span-8">
                        <div className="rounded-[2.5rem] border border-white/5 bg-zinc-900/30 p-10 shadow-2xl backdrop-blur-2xl">
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-white">
                                        {t('generateCode.activeInvitations')}
                                    </h3>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                        Manage Access Tokens
                                    </p>
                                </div>
                                <span className="inline-flex items-center rounded-xl bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                                    {invitations.length} Active
                                </span>
                            </div>

                            {invitations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-white/5 bg-zinc-950/20 py-24 text-center">
                                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-zinc-900/80 text-zinc-700 shadow-inner">
                                        <Key className="h-10 w-10" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white">
                                        {t('generateCode.noActiveCodes')}
                                    </h4>
                                    <p className="mt-2 max-w-xs text-sm font-medium text-zinc-500">
                                        {t('generateCode.noActiveCodesDesc')}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {invitations.map((inv) => {
                                        const isExpired = new Date(inv.expiresAt) < new Date();
                                        const progress = inv.maxUses > 1 ? (inv.uses / inv.maxUses) * 100 : 0;

                                        return (
                                            <div
                                                key={inv._id}
                                                className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 hover:shadow-2xl ${
                                                    isExpired
                                                        ? 'border-white/5 bg-zinc-950/20 opacity-50 grayscale'
                                                        : 'border-white/10 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-primary/30'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-8 p-8 sm:flex-row sm:items-center">
                                                    {/* Code & Role info */}
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex flex-wrap items-center gap-6">
                                                            <div className="relative">
                                                                <span className="font-mono text-3xl font-black tracking-[0.25em] text-white sm:text-4xl">
                                                                    {inv.code}
                                                                </span>
                                                                {isExpired && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="h-[2px] w-full bg-destructive/50" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => copyToClipboard(inv.code, inv._id)}
                                                                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950/50 text-zinc-400 transition-all hover:bg-primary/20 hover:text-primary active:scale-95 shadow-inner"
                                                                title={t('generateCode.copyCode')}
                                                            >
                                                                {copiedId === inv._id ? (
                                                                    <Check className="h-6 w-6" />
                                                                ) : (
                                                                    <Copy className="h-6 w-6" />
                                                                )}
                                                            </button>
                                                            <span className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                                                inv.role === 'admin'
                                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/5'
                                                                    : inv.role === 'hr'
                                                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5'
                                                                      : 'bg-primary/10 text-primary border-primary/20 shadow-primary/5'
                                                            }`}>
                                                                {t(`common.roles.${inv.role}`)}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-8">
                                                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                                                                <Clock className="h-4 w-4 opacity-50" />
                                                                {isExpired
                                                                    ? <span className="text-destructive/70">{t('generateCode.expired')}</span>
                                                                    : `${t('generateCode.expiresIn')} ${moment(inv.expiresAt).fromNow()}`}
                                                            </div>
                                                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                                                                <Shield className="h-4 w-4 opacity-50" />
                                                                {inv.createdBy?.username || t('leaves.approvals.unknownUser')}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Usage & Delete */}
                                                    <div className="flex items-center justify-between gap-8 border-t border-white/5 pt-8 sm:justify-end sm:border-t-0 sm:pt-0">
                                                        {inv.maxUses > 1 && (
                                                            <div className="flex flex-col items-start gap-3 sm:items-end">
                                                                <div className="flex items-center gap-2 text-xs font-black text-zinc-400">
                                                                    <Users className="h-4 w-4 text-primary" />
                                                                    {inv.uses} / {inv.maxUses}
                                                                </div>
                                                                <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-950 shadow-inner">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000 ease-out"
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleRevoke(inv._id)}
                                                            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-destructive/10 text-destructive opacity-30 transition-all hover:bg-destructive hover:text-white hover:opacity-100 active:scale-90 shadow-lg"
                                                            title={t('generateCode.revokeCode')}
                                                        >
                                                            <Trash2 className="h-6 w-6" />
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
            
            {/* Demo Warning Modal */}
            {showDemoWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-xl">
                    <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500">
                        <div className="bg-amber-500/10 p-8">
                             <div className="flex items-start gap-6">
                                <div className="flex-shrink-0 rounded-2xl bg-amber-500/20 p-4 text-amber-500 border border-amber-500/20">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <div className="mt-1">
                                    <h3 className="text-xl font-black tracking-tight text-white leading-tight">
                                        {t('generateCode.demoWarningTitle')}
                                    </h3>
                                    <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">
                                        {t('generateCode.demoWarningDesc')} <strong className="text-amber-500">{t('generateCode.demoWarningDescBold')}</strong>. 
                                    </p>
                                </div>
                             </div>
                        </div>
                        <div className="px-8 py-6 space-y-6">
                            <ul className="space-y-4 text-sm font-medium text-zinc-400">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                        <Check className="h-3 w-3" />
                                    </div>
                                    <span>{t('generateCode.demoPoint1')} <strong className="text-white">{t('generateCode.demoPoint1Bold')}</strong> {t('generateCode.demoPoint1End')}</span>
                                </li>
                                <li className="flex items-start gap-4">
                                     <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-destructive/20 flex items-center justify-center text-destructive border border-destructive/20">
                                        <Trash2 className="h-3 w-3" />
                                    </div>
                                    <span>{t('generateCode.demoPoint2')} <strong className="text-white">{t('generateCode.demoPoint2Bold')}</strong>.</span>
                                </li>
                            </ul>
                            <div className="rounded-2xl bg-zinc-950/50 border border-white/5 p-4 text-xs font-medium text-zinc-500">
                                <strong className="text-zinc-400">{t('generateCode.demoHintLabel')}</strong> {t('generateCode.demoHint')}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-t border-white/5 bg-zinc-950/30 px-8 py-6">
                            <button
                                onClick={() => setShowDemoWarning(false)}
                                className="flex-1 rounded-2xl border border-white/10 bg-zinc-900 px-6 py-4 text-sm font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
                            >
                                {t('generateCode.cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDemoWarning(false);
                                    handleGenerate();
                                }}
                                className="flex-1 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:translate-y-[-2px] active:scale-95"
                            >
                                {t('generateCode.understand')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

