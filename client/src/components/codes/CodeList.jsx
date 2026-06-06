import React from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../ui/Card';
import { Key, Copy, Check, Clock, Shield, Users, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const CodeList = ({
    invitations,
    copiedId,
    copyToClipboard,
    handleRevoke,
    t,
    i18n,
}) => {
    return (
        <Card className="border-border bg-card shadow-sm lg:col-span-8">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>
                            {t('generateCode.activeInvitations')}
                        </CardTitle>
                        <CardDescription>
                            {t('generateCode.manageAccessTokens')}
                        </CardDescription>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
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
                            const isExpired =
                                new Date(inv.expiresAt) < new Date();
                            const progress =
                                inv.maxUses > 1
                                    ? (inv.uses / inv.maxUses) * 100
                                    : 0;

                            return (
                                <div
                                    key={inv._id}
                                    suppressHydrationWarning
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
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            inv.code,
                                                            inv._id,
                                                        )
                                                    }
                                                    title={t(
                                                        'generateCode.copyCode',
                                                    )}
                                                >
                                                    {copiedId === inv._id ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <span
                                                    className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                                                        inv.role === 'admin'
                                                            ? 'border-purple-500/20 bg-purple-500/10 text-purple-500'
                                                            : inv.role === 'hr'
                                                              ? 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                                                              : 'border-primary/20 bg-primary/10 text-primary'
                                                    }`}
                                                >
                                                    {t(
                                                        `common.roles.${inv.role}`,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-8">
                                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    <Clock className="h-4 w-4 opacity-50" />
                                                    {isExpired ? (
                                                        <span className="text-destructive">
                                                            {t(
                                                                'generateCode.expired',
                                                            )}
                                                        </span>
                                                    ) : (
                                                        `${t('generateCode.expiresIn')} ${formatDistanceToNow(
                                                            new Date(
                                                                inv.expiresAt,
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                                locale:
                                                                    i18n.language ===
                                                                    'pl'
                                                                        ? pl
                                                                        : undefined,
                                                            },
                                                        )}`
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    <Shield className="h-4 w-4 opacity-50" />
                                                    {inv.createdBy?.username ||
                                                        t(
                                                            'leaves.approvals.unknownUser',
                                                        )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Usage & Delete */}
                                        <div className="flex items-center justify-between gap-6 border-t border-border pt-6 sm:justify-end sm:border-t-0 sm:pt-0">
                                            {inv.maxUses > 1 && (
                                                <div className="flex flex-col items-start gap-3 sm:items-end">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                        <Users className="h-4 w-4 text-primary" />
                                                        {inv.uses} /{' '}
                                                        {inv.maxUses}
                                                    </div>
                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-1000 ease-out"
                                                            style={{
                                                                width: `${progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() =>
                                                    handleRevoke(inv._id)
                                                }
                                                title={t(
                                                    'generateCode.revokeCode',
                                                )}
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
    );
};

export default CodeList;
