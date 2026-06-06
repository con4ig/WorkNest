import React from 'react';
import { clsx } from 'clsx';
import { Select } from '../../ui/Select';
import StatCard from './StatCard';
import { Icon } from './UserIcons';
import {
    getStatusClasses,
    getContractClasses,
    calculateWorkExperience,
    formatDateForDisplay,
    AVAILABLE_STATUSES,
    AVAILABLE_CONTRACT_TYPES,
    DEPARTMENTS,
} from './UserHelpers';

const UserSidebar = ({
    user,
    editData,
    isEditing,
    handleEditChange,
    t,
    i18n,
    navigate,
    fullName,
}) => {
    return (
        <aside className="flex w-full flex-col border-r border-border bg-card p-6 lg:min-h-screen lg:w-[360px] lg:p-8">
            <div className="mb-10 flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/employees')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-all hover:bg-secondary active:scale-95"
                >
                    <Icon.Back />
                </button>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {t('employees.details.title')}
                    </p>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        {user.username}
                    </h2>
                </div>
            </div>

            <div className="mb-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary/10 text-4xl font-black text-primary shadow-lg">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {fullName}
                </h3>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-bold text-muted-foreground">
                    <Icon.Briefcase className="h-3 w-3" />
                    {editData.position || t('common.noPosition')}
                </div>
            </div>

            <div className="space-y-4">
                <StatCard
                    icon={<Icon.Badge />}
                    title={t('employees.details.statusAndContract')}
                >
                    {isEditing ? (
                        <div className="mt-2 space-y-2">
                            <Select
                                name="status"
                                value={editData.status}
                                onChange={handleEditChange}
                            >
                                {AVAILABLE_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {t(`common.employeeStatus.${s}`)}
                                    </option>
                                ))}
                            </Select>
                            <Select
                                name="contractType"
                                value={editData.contractType}
                                onChange={handleEditChange}
                            >
                                {AVAILABLE_CONTRACT_TYPES.map((c) => (
                                    <option key={c} value={c}>
                                        {t(`common.contractType.${c}`)}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                            <span
                                className={clsx(
                                    'rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                                    getStatusClasses(user.status),
                                )}
                            >
                                {t(`common.employeeStatus.${user.status}`)}
                            </span>
                            <span
                                className={clsx(
                                    'rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                                    getContractClasses(user.contractType),
                                )}
                            >
                                {t(`common.contractType.${user.contractType}`)}
                            </span>
                        </div>
                    )}
                </StatCard>
                <StatCard
                    icon={<Icon.Calendar />}
                    title={t('employees.details.workExperience')}
                >
                    <span className="text-sm font-bold tracking-tight text-foreground">
                        {calculateWorkExperience(user.hireDate, t)}
                    </span>
                </StatCard>
                <StatCard
                    icon={<Icon.Briefcase />}
                    title={t('common.department')}
                >
                    {isEditing ? (
                        <div className="mt-2">
                            <Select
                                name="department"
                                value={editData.department}
                                onChange={handleEditChange}
                            >
                                <option value="">
                                    -- {t('common.select')} --
                                </option>
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>
                                        {t(`common.departments.${d}`)}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    ) : (
                        <span className="text-sm font-bold tracking-tight text-foreground">
                            {user.department
                                ? t(`common.departments.${user.department}`)
                                : t('common.notSpecified')}
                        </span>
                    )}
                </StatCard>
            </div>

            <div className="mt-auto pt-8 text-center text-xs text-muted-foreground">
                <p>
                    {t('common.createdAt')}{' '}
                    <span className="font-semibold text-foreground">
                        {formatDateForDisplay(user.createdAt, i18n.language) ||
                            t('common.notSpecified')}
                    </span>
                </p>
            </div>
        </aside>
    );
};

export default UserSidebar;
