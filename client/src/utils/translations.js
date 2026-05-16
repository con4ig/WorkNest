import i18n from '../i18n';

/**
 * Translates user role
 */
export const translateRole = (role) => {
    return i18n.t(`common.roles.${role}`, { defaultValue: role });
};

/**
 * Translates user status
 */
export const translateStatus = (status) => {
    return i18n.t(`common.employeeStatus.${status}`, { defaultValue: status });
};

/**
 * Translates contract type
 */
export const translateContractType = (contractType) => {
    return i18n.t(`common.contractType.${contractType}`, { defaultValue: contractType });
};

/**
 * Translates project status
 */
export const translateProjectStatus = (status) => {
    return i18n.t(`common.projectStatus.${status}`, { defaultValue: status });
};

/**
 * Translates task status
 */
export const translateTaskStatus = (status) => {
    return i18n.t(`common.taskStatus.${status}`, { defaultValue: status });
};

/**
 * Translates priority
 */
export const translatePriority = (priority) => {
    return i18n.t(`common.priority.${priority}`, { defaultValue: priority });
};

/**
 * Translates leave status
 */
export const translateLeaveStatus = (status) => {
    return i18n.t(`common.leaveStatus.${status}`, { defaultValue: status });
};

/**
 * Translates leave type
 */
export const translateLeaveType = (type) => {
    return i18n.t(`common.leaveType.${type}`, { defaultValue: type });
};