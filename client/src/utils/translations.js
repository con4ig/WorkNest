import i18n from '../i18n';

/**
 * Tłumaczy rolę użytkownika
 */
export const translateRole = (role) => {
    return i18n.t(`common.roles.${role}`, { defaultValue: role });
};

/**
 * Tłumaczy status użytkownika
 */
export const translateStatus = (status) => {
    return i18n.t(`common.employeeStatus.${status}`, { defaultValue: status });
};

/**
 * Tłumaczy typ kontraktu
 */
export const translateContractType = (contractType) => {
    return i18n.t(`common.contractType.${contractType}`, { defaultValue: contractType });
};

/**
 * Tłumaczy status projektu
 */
export const translateProjectStatus = (status) => {
    return i18n.t(`common.projectStatus.${status}`, { defaultValue: status });
};

/**
 * Tłumaczy status zadania
 */
export const translateTaskStatus = (status) => {
    return i18n.t(`common.taskStatus.${status}`, { defaultValue: status });
};

/**
 * Tłumaczy priorytet
 */
export const translatePriority = (priority) => {
    return i18n.t(`common.priority.${priority}`, { defaultValue: priority });
};

/**
 * Tłumaczy status urlopu
 */
export const translateLeaveStatus = (status) => {
    return i18n.t(`common.leaveStatus.${status}`, { defaultValue: status });
};

/**
 * Tłumaczy typ urlopu
 */
export const translateLeaveType = (type) => {
    return i18n.t(`common.leaveType.${type}`, { defaultValue: type });
};