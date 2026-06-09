import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    X,
    Briefcase,
    Users,
    Shield,
    Check,
    AlertCircle,
    ShieldAlert,
    UserCircle2,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

const RoleChangeModal = ({
    isOpen,
    onClose,
    user,
    initialRole,
    onConfirm,
    isChanging,
}) => {
    const { t } = useTranslation();
    const currentRole = initialRole;
    const [selectedRole, setSelectedRole] = useState(initialRole);

    if (!isOpen) return null;

    const roles = [
        {
            value: 'employee',
            label: t('common.roles.employee'),
            icon: UserCircle2,
            color: 'zinc',
            description: t('employees.list.roleModal.employeeDesc'),
            glowColor: 'shadow-zinc-500/10',
            activeBorder: 'border-zinc-500/30',
            activeBg: 'bg-zinc-500/10',
            iconBg: 'bg-zinc-500/20',
            iconColor: 'text-zinc-400',
        },
        {
            value: 'hr',
            label: t('common.roles.hr'),
            icon: Users,
            color: 'blue',
            description: t('employees.list.roleModal.hrDesc'),
            glowColor: 'shadow-blue-500/10',
            activeBorder: 'border-blue-500/30',
            activeBg: 'bg-blue-500/10',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
        },
        {
            value: 'admin',
            label: t('common.roles.admin'),
            icon: Shield,
            color: 'indigo',
            description: t('employees.list.roleModal.adminDesc'),
            glowColor: 'shadow-indigo-500/10',
            activeBorder: 'border-indigo-500/30',
            activeBg: 'bg-indigo-500/10',
            iconBg: 'bg-indigo-500/20',
            iconColor: 'text-indigo-400',
        },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Full-screen Backdrop */}
            <div
                className="animate-in fade-in fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="animate-in zoom-in-95 relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl duration-300 dark:border-white/10 dark:bg-zinc-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/5 p-6 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 font-bold text-primary">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                {t('employees.list.roleModal.title')}
                            </h2>
                            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                {user?.username || user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 p-6">
                    <div className="space-y-3">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isActive = selectedRole === role.value;

                            return (
                                <button
                                    type="button"
                                    key={role.value}
                                    onClick={() => setSelectedRole(role.value)}
                                    className={clsx(
                                        'relative w-full rounded-xl border p-4 text-left transition-all',
                                        isActive
                                            ? clsx(
                                                  'border-primary/30 bg-primary/5 shadow-lg',
                                                  role.glowColor,
                                              )
                                            : 'border-black/5 bg-black/[0.03] hover:border-black/10 hover:bg-black/[0.05] dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10',
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute right-0 top-0 p-3">
                                            <div
                                                className={clsx(
                                                    'flex h-5 w-5 items-center justify-center rounded-full text-black',
                                                    'bg-primary',
                                                )}
                                            >
                                                <Check size={12} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div
                                            className={clsx(
                                                'shrink-0 rounded-lg p-2.5',
                                                isActive
                                                    ? 'bg-primary text-black'
                                                    : 'bg-black/5 text-zinc-400 dark:bg-white/5 dark:text-zinc-500',
                                            )}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div className="pr-6">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span
                                                    className={clsx(
                                                        'text-sm font-bold transition-colors',
                                                        isActive
                                                            ? 'text-zinc-900 dark:text-white'
                                                            : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300',
                                                    )}
                                                >
                                                    {t(
                                                        `common.roles.${role.value}`,
                                                    )}
                                                </span>
                                                {role.value === 'admin' && (
                                                    <span className="rounded border border-indigo-500/10 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                        SYSTEM
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tighter text-zinc-500 dark:text-zinc-500">
                                                {t(
                                                    `employees.list.roleModal.${role.value}Desc`,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedRole !== currentRole && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                            <AlertCircle
                                size={14}
                                className="mt-0.5 shrink-0 text-amber-500"
                            />
                            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tighter text-amber-500">
                                {t('employees.list.roleModal.warning')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-black/5 p-6 dark:border-white/5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isChanging}
                        className="flex-1 rounded-xl bg-black/5 py-2 font-bold text-zinc-900 transition-all hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(selectedRole)}
                        disabled={isChanging || selectedRole === currentRole}
                        className="flex-1 rounded-xl bg-primary py-2 font-bold text-black transition-all active:scale-95 disabled:opacity-50"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-bold">
                                {isChanging
                                    ? t('employees.list.roleModal.submitting')
                                    : t('employees.list.roleModal.submit')}
                            </span>
                            {!isChanging && selectedRole !== currentRole && (
                                <ChevronRight size={16} />
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleChangeModal;
