import React from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../ui/Card';
import {
    Sparkles,
    Users,
    Infinity as InfinityIcon,
    RefreshCw,
} from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const CodeGeneratorForm = ({
    formData,
    setFormData,
    loading,
    error,
    handleGenerate,
    currentUser,
    setShowDemoWarning,
    t,
}) => {
    const inputClass =
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    return (
        <Card className="h-fit border-border bg-card shadow-sm lg:col-span-4">
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
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('generateCode.roleLabel')}
                        </label>
                        <Select
                            value={formData.role}
                            onChange={(val) =>
                                setFormData({
                                    ...formData,
                                    role: val.target.value,
                                })
                            }
                        >
                            <option value="employee">
                                {t('common.roles.employee')}
                            </option>
                            {currentUser?.role === 'admin' && (
                                <>
                                    <option value="hr">
                                        {t('common.roles.hr')}
                                    </option>
                                    <option value="admin">
                                        {t('common.roles.admin')}
                                    </option>
                                </>
                            )}
                        </Select>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('generateCode.typeLabel')}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({ ...formData, type: 'single' })
                                }
                                className={`group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                                    formData.type === 'single'
                                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                        : 'border-border bg-card hover:bg-muted'
                                }`}
                            >
                                <Users className="h-6 w-6 transition-transform group-hover:scale-110" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {t('generateCode.typeSingle')}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({ ...formData, type: 'multi' })
                                }
                                className={`group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                                    formData.type === 'multi'
                                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                        : 'border-border bg-card hover:bg-muted'
                                }`}
                            >
                                <div className="flex items-center">
                                    <Users className="h-6 w-6 transition-transform group-hover:scale-110" />
                                    <InfinityIcon className="-ml-1 h-4 w-4 opacity-70" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {t('generateCode.typeMulti')}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Max Uses */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            formData.type === 'multi'
                                ? 'max-h-40 opacity-100'
                                : 'pointer-events-none max-h-0 opacity-0'
                        }`}
                    >
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t('generateCode.maxUsesLabel')}
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="1000"
                                aria-label={t('generateCode.maxUsesLabel')}
                                value={formData.maxUses}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({
                                        ...formData,
                                        maxUses:
                                            val === '' ? '' : parseInt(val),
                                    });
                                }}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Expiration */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('generateCode.expirationLabel')}
                        </label>
                        <Select
                            value={formData.expiresIn}
                            onChange={(val) =>
                                setFormData({
                                    ...formData,
                                    expiresIn: val.target.value,
                                })
                            }
                        >
                            <option value="5m">
                                {t('generateCode.expirations.5m')}
                            </option>
                            <option value="30m">
                                {t('generateCode.expirations.30m')}
                            </option>
                            <option value="1h">
                                {t('generateCode.expirations.1h')}
                            </option>
                            <option value="24h">
                                {t('generateCode.expirations.24h')}
                            </option>
                            <option value="7d">
                                {t('generateCode.expirations.7d')}
                            </option>
                            <option value="30d">
                                {t('generateCode.expirations.30d')}
                            </option>
                        </Select>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                            {error}
                        </div>
                    )}

                    <Button
                        type="button"
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
    );
};

export default CodeGeneratorForm;
