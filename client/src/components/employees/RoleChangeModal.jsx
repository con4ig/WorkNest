import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Briefcase, Users, Shield, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

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
            icon: Briefcase,
            color: 'gray',
            description: t('employees.list.roleModal.employeeDesc'),
        },
        {
            value: 'hr',
            label: t('common.roles.hr'),
            icon: Users,
            color: 'blue',
            description: t('employees.list.roleModal.hrDesc'),
        },
        {
            value: 'admin',
            label: t('common.roles.admin'),
            icon: Shield,
            color: 'purple',
            description: t('employees.list.roleModal.adminDesc'),
        },
    ];

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'border-purple-500/20 bg-purple-50 text-purple-700';
            case 'hr':
                return 'border-blue-500/20 bg-blue-50 text-blue-700';
            default:
                return 'border-slate-300/50 bg-slate-50 text-slate-700';
        }
    };

    return (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-200">
            <div className="animate-in zoom-in-95 w-full max-w-md rounded-xl border border-slate-200/50 bg-white shadow-2xl duration-200">
                <div className="flex items-start justify-between border-b border-slate-100 p-5">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                            {t('employees.list.roleModal.title')}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                            {user?.username}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="-mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="space-y-2.5">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            return (
                                <button
                                    key={role.value}
                                    onClick={() => setSelectedRole(role.value)}
                                    className={cn(
                                        'w-full rounded-lg border-2 p-4 text-left transition-all',
                                        selectedRole === role.value
                                            ? cn(
                                                  getRoleColor(role.value),
                                                  'shadow-sm ring-2 ring-offset-1 ring-offset-white',
                                                  role.value === 'admin'
                                                      ? 'ring-purple-400'
                                                      : role.value === 'hr'
                                                        ? 'ring-blue-400'
                                                        : 'ring-slate-400',
                                              )
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'rounded-lg p-2',
                                                selectedRole === role.value
                                                    ? role.value === 'admin'
                                                        ? 'bg-purple-100 text-purple-600'
                                                        : role.value === 'hr'
                                                          ? 'bg-blue-100 text-blue-600'
                                                          : 'bg-slate-200 text-slate-600'
                                                    : 'bg-slate-100 text-slate-500',
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900">
                                                    {t(
                                                        `common.roles.${role.value}`,
                                                    )}
                                                </span>
                                                {selectedRole ===
                                                    role.value && (
                                                    <div
                                                        className={
                                                            role.value ===
                                                            'admin'
                                                                ? 'text-purple-600'
                                                                : role.value ===
                                                                    'hr'
                                                                  ? 'text-blue-600'
                                                                  : 'text-slate-600'
                                                        }
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-xs text-slate-500">
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
                        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200/50 bg-amber-50 p-3 text-sm text-amber-800">
                            <div className="mt-0.5 flex-shrink-0 text-amber-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <p className="leading-relaxed">
                                {t('employees.list.roleModal.warning')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 border-t border-slate-100 p-4">
                    <button
                        onClick={onClose}
                        disabled={isChanging}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={() => onConfirm(selectedRole)}
                        disabled={isChanging || selectedRole === currentRole}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isChanging
                            ? t('employees.list.roleModal.submitting')
                            : t('employees.list.roleModal.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleChangeModal;
