import React, { useEffect, useState } from 'react';
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
    Sparkles
} from 'lucide-react';
import clsx from 'clsx';

const RoleChangeModal = ({
    isOpen,
    onClose,
    user,
    currentRole,
    onConfirm,
    isChanging,
}) => {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState(currentRole);

    useEffect(() => {
        setSelectedRole(currentRole);
    }, [currentRole, isOpen]);

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
            iconColor: 'text-zinc-400'
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
            iconColor: 'text-blue-400'
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
            iconColor: 'text-indigo-400'
        },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Full-screen Backdrop */}
            <div 
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                {t('employees.list.roleModal.title')}
                            </h2>
                            <p className="mt-1 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                                {user?.username || user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isActive = selectedRole === role.value;
                            
                            return (
                                <button
                                    key={role.value}
                                    onClick={() => setSelectedRole(role.value)}
                                    className={clsx(
                                        "w-full p-4 rounded-xl text-left transition-all relative border",
                                        isActive 
                                            ? clsx("border-primary/30 bg-primary/5 shadow-lg", role.glowColor)
                                            : "border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-black/[0.05] dark:hover:bg-white/10"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-black", 
                                                "bg-primary")}>
                                                <Check size={12} />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start gap-4">
                                        <div className={clsx(
                                            "p-2.5 rounded-lg shrink-0",
                                            isActive ? "bg-primary text-black" : "bg-black/5 dark:bg-white/5 text-zinc-400 dark:text-zinc-500"
                                        )}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="pr-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={clsx(
                                                    "text-sm font-bold transition-colors",
                                                    isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                                                )}>
                                                    {t(`common.roles.${role.value}`)}
                                                </span>
                                                {role.value === 'admin' && (
                                                    <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 uppercase tracking-widest">
                                                        SYSTEM
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-tighter leading-relaxed">
                                                {t(`employees.list.roleModal.${role.value}Desc`)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedRole !== currentRole && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter leading-relaxed">
                                {t('employees.list.roleModal.warning')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 dark:border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isChanging}
                        className="flex-1 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-900 dark:text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={() => onConfirm(selectedRole)}
                        disabled={isChanging || selectedRole === currentRole}
                        className="flex-1 py-2 bg-primary text-black font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-bold">
                                {isChanging ? t('employees.list.roleModal.submitting') : t('employees.list.roleModal.submit')}
                            </span>
                            {!isChanging && selectedRole !== currentRole && <ChevronRight size={16} />}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleChangeModal;
