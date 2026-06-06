import {
    format,
    differenceInYears,
    differenceInMonths,
    addYears,
} from 'date-fns';
import { pl, enUS } from 'date-fns/locale';

export const formatDateForDisplay = (dateString, language = 'pl') => {
    if (!dateString) return null;
    try {
        return format(new Date(dateString), 'd MMMM yyyy', {
            locale: language === 'pl' ? pl : enUS,
        });
    } catch {
        return null;
    }
};

export const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
        return '';
    }
};

export const calculateWorkExperience = (hireDate, t) => {
    if (!hireDate) return t('common.notSpecified');
    try {
        const hire = new Date(hireDate);
        const now = new Date();
        const years = differenceInYears(now, hire);
        const hirePlusYears = addYears(hire, years);
        const months = differenceInMonths(now, hirePlusYears);

        let result = '';
        if (years > 0) {
            result += `${years} ${t('common.years', { count: years })} `;
        }
        if (months > 0 || years === 0) {
            result += `${months} ${t('common.months', { count: months })}`;
        }
        return result.trim();
    } catch {
        return t('common.invalidDate');
    }
};

export const getStatusClasses = (status) => {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-500 ring-green-500/20';
        case 'inactive':
            return 'bg-muted text-muted-foreground ring-border';
        case 'on-leave':
            return 'bg-blue-500/10 text-blue-500 ring-blue-500/20';
        case 'terminated':
            return 'bg-destructive/10 text-destructive ring-destructive/20';
        default:
            return 'bg-muted text-muted-foreground ring-border';
    }
};

export const getContractClasses = (type) => {
    switch (type) {
        case 'full-time':
            return 'bg-primary/10 text-primary';
        case 'part-time':
            return 'bg-yellow-500/10 text-yellow-500';
        case 'contract':
            return 'bg-purple-500/10 text-purple-500';
        case 'temporary':
            return 'bg-orange-500/10 text-orange-500';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

export const AVAILABLE_STATUSES = [
    'active',
    'inactive',
    'on-leave',
    'terminated',
];
export const AVAILABLE_CONTRACT_TYPES = [
    'full-time',
    'part-time',
    'contract',
    'temporary',
];
export const AVAILABLE_ROLES = ['employee', 'hr', 'admin'];
export const DEPARTMENTS = [
    'IT',
    'HR',
    'Sales',
    'Marketing',
    'Finance',
    'Operations',
];
