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
    AlertCircle,
    Info,
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen.jsx';
import moment from 'moment';
import 'moment/locale/pl';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

moment.locale('pl');

export default function GenerateCode() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState(true);
    const [invitations, setInvitations] = useState([]);
    const { user: currentUser } = useAuth();
    const [showDemoWarning, setShowDemoWarning] = useState(false);
    
    const [confirmationProps, setConfirmationProps] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const askForConfirmation = (props) => {
        setConfirmationProps({ isOpen: true, ...props });
    };

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

    const handleRevoke = (id) => {
        askForConfirmation({
            title: t('generateCode.revokeCode'),
            message: t('generateCode.revokeConfirm'),
            confirmText: t('common.delete'),
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/users/invitations/${id}`);
                    await fetchInvitations();
                    toast.success('Kod został usunięty');
                } catch (err) {
                    toast.error(t('generateCode.revokeError'));
                }
            },
        });
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Options for selects
    const stats = [
        {
            id: 1,
            title: t('generateCode.activeInvitations'),
            value: invitations.filter(i => new Date(i.expiresAt) > new Date()).length,
            icon: Key,
            color: 'text-primary',
        },
        {
            id: 2,
            title: t('generateCode.allUses'),
            value: invitations.reduce((acc, curr) => acc + curr.uses, 0),
            icon: Users,
            color: 'text-blue-500',
        },
        {
            id: 3,
            title: t('generateCode.expired'),
            value: invitations.filter(i => new Date(i.expiresAt) <= new Date()).length,
            icon: Clock,
            color: 'text-orange-500',
        },
    ];

    if (pageLoading) return <LoadingScreen message={t('generateCode.loading')} />;

    const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="flex h-full select-none flex-col space-y-6 p-6 md:p-8">
            <ConfirmationModal
                {...confirmationProps}
                onClose={() =>
                    setConfirmationProps({
                        ...confirmationProps,
                        isOpen: false,
                    })
                }
            />
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="mr-2 md:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {t('generateCode.title')}
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('generateCode.subtitle')}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {stats.map((stat) => (
                    <Card
                        key={stat.id}
                        className="border-border bg-card shadow-sm transition-all hover:shadow-md"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight text-foreground">
                                <AnimatedNumber value={stat.value} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Generator Form */}
                <Card className="border-border bg-card shadow-sm lg:col-span-4 h-fit">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <CardTitle>{t('generateCode.newCode')}</CardTitle>
                        </div>
                        <CardDescription>
                            {t('generateCode.generatorDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                                <div className="space-y-8">
                                    {/* Role Selection */}
                                    <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {t('generateCode.roleLabel')}
                                        </label>
                                <select
                                    value={formData.role}
                                            onChange={(val) =>
                                        setFormData({ ...formData, role: val.target.value })
                                            }
                                    className={inputClass}
                                >
                                    <option value="employee">{t('common.roles.employee')}</option>
                                    <option value="hr">{t('common.roles.hr')}</option>
                                    <option value="admin">{t('common.roles.admin')}</option>
                                </select>
                                    </div>

                                    {/* Type Selection */}
                                    <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {t('generateCode.typeLabel')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                    <div
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        type: 'single',
                                                    })
                                                }
                                        className={`cursor-pointer group flex flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                                                    formData.type === 'single'
                                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                                : 'border-border bg-card hover:bg-muted'
                                                }`}
                                            >
                                                <Users className={`h-6 w-6 transition-transform group-hover:scale-110`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {t('generateCode.typeSingle')}
                                                </span>
                                    </div>
                                    <div
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        type: 'multi',
                                                    })
                                                }
                                        className={`cursor-pointer group flex flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                                                    formData.type === 'multi'
                                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                                : 'border-border bg-card hover:bg-muted'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <Users className={`h-6 w-6 transition-transform group-hover:scale-110`} />
                                            <InfinityIcon className="h-4 w-4 -ml-1 opacity-70" />
                                                </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {t('generateCode.typeMulti')}
                                                </span>
                                    </div>
                                        </div>
                                    </div>

                                    {/* Max Uses */}
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${formData.type === 'multi' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                                    >
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                                        className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* Expiration */}
                                    <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {t('generateCode.expirationLabel')}
                                        </label>
                                <select
                                    value={formData.expiresIn}
                                            onChange={(val) =>
                                        setFormData({ ...formData, expiresIn: val.target.value })
                                            }
                                    className={inputClass}
                                >
                                    <option value="5m">{t('generateCode.expirations.5m')}</option>
                                    <option value="30m">{t('generateCode.expirations.30m')}</option>
                                    <option value="1h">{t('generateCode.expirations.1h')}</option>
                                    <option value="24h">{t('generateCode.expirations.24h')}</option>
                                    <option value="7d">{t('generateCode.expirations.7d')}</option>
                                    <option value="30d">{t('generateCode.expirations.30d')}</option>
                                </select>
                                    </div>

                                    {error && (
                                <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm text-center font-medium">
                                                {error}
                                        </div>
                                    )}

                            <Button
                                className="w-full gap-2"
                                disabled={loading}
                                        onClick={() => {
                                            if (currentUser?.email === 'demo@worknest.com') {
                                                setShowDemoWarning(true);
                                            } else {
                                                handleGenerate();
                                            }
                                        }}
                                    >
                                        {loading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        {t('generateCode.generating')}
                                    </>
                                        ) : (
                                            <>
                                        <RefreshCw className="h-4 w-4" />
                                                {t('generateCode.generateButton')}
                                            </>
                                        )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                    {/* Right Column: Active Invitations List */}
                <Card className="border-border bg-card shadow-sm lg:col-span-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{t('generateCode.activeInvitations')}</CardTitle>
                                <CardDescription>
                                    {t('generateCode.manageAccessTokens')}
                                </CardDescription>
                                </div>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
                                    {invitations.length} Active
                                </span>
                            </div>
                    </CardHeader>
                    <CardContent>

                            {invitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Key className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                <h4 className="text-lg font-semibold text-foreground">
                                        {t('generateCode.noActiveCodes')}
                                    </h4>
                                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
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
                                            className={`group relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-md ${
                                                    isExpired
                                                    ? 'border-border bg-muted/30 opacity-60 grayscale'
                                                    : 'border-border bg-card hover:border-primary/30'
                                                }`}
                                            >
                                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                                    {/* Code & Role info */}
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex flex-wrap items-center gap-6">
                                                            <div className="relative">
                                                            <span className="font-mono text-2xl font-bold tracking-[0.2em] text-foreground sm:text-3xl">
                                                                    {inv.code}
                                                                </span>
                                                                {isExpired && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="h-[2px] w-full bg-destructive" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => copyToClipboard(inv.code, inv._id)}
                                                                title={t('generateCode.copyCode')}
                                                            >
                                                                {copiedId === inv._id ? (
                                                                    <Check className="h-4 w-4" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                        </Button>
                                                        <span className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
                                                                inv.role === 'admin'
                                                                ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                                    : inv.role === 'hr'
                                                                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                                  : 'bg-primary/10 text-primary border-primary/20'
                                                            }`}>
                                                                {t(`common.roles.${inv.role}`)}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-8">
                                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                <Clock className="h-4 w-4 opacity-50" />
                                                                {isExpired
                                                                ? <span className="text-destructive">{t('generateCode.expired')}</span>
                                                                    : `${t('generateCode.expiresIn')} ${moment(inv.expiresAt).fromNow()}`}
                                                            </div>
                                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                <Shield className="h-4 w-4 opacity-50" />
                                                                {inv.createdBy?.username || t('leaves.approvals.unknownUser')}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Usage & Delete */}
                                                <div className="flex items-center justify-between gap-6 border-t border-border pt-6 sm:justify-end sm:border-t-0 sm:pt-0">
                                                        {inv.maxUses > 1 && (
                                                            <div className="flex flex-col items-start gap-3 sm:items-end">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                                    <Users className="h-4 w-4 text-primary" />
                                                                    {inv.uses} / {inv.maxUses}
                                                                </div>
                                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                                    <div
                                                                    className="h-full bg-primary transition-all duration-1000 ease-out"
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleRevoke(inv._id)}
                                                            title={t('generateCode.revokeCode')}
                                                        >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Demo Warning Modal */}
            {showDemoWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                    {t('generateCode.demoWarningTitle')}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t('generateCode.demoWarningDesc')} <span className="text-foreground font-medium">{t('generateCode.demoWarningDescBold')}</span>.
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex gap-3">
                                        <div className="mt-0.5 text-primary">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        {t('generateCode.demoPoint1')} <strong className="text-white font-semibold">{t('generateCode.demoPoint1Bold')}</strong> {t('generateCode.demoPoint1End')}
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-0.5 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </div>
                                        {t('generateCode.demoPoint2')} <strong className="text-white font-semibold">{t('generateCode.demoPoint2Bold')}</strong>.
                                    </li>
                                </ul>

                                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground flex gap-2">
                                    <Info className="h-4 w-4 shrink-0 text-blue-500" />
                                    <div>
                                        <span className="font-semibold text-foreground block mb-0.5">{t('generateCode.demoHintLabel')}</span>
                                        {t('generateCode.demoHint')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                    className="w-full sm:w-auto"
                                onClick={() => setShowDemoWarning(false)}
                            >
                                {t('generateCode.cancel')}
                            </Button>
                            <Button
                                    className="w-full sm:w-auto"
                                onClick={() => {
                                    setShowDemoWarning(false);
                                    handleGenerate();
                                }}
                            >
                                {t('generateCode.understand')}
                            </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
