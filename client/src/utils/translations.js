import i18n from '../i18n';

/**
 * Translates project status
 */
export const translateProjectStatus = (status) => {
    return i18n.t(`common.projectStatus.${status}`, { defaultValue: status });
};

/**
 * Translates priority
 */
export const translatePriority = (priority) => {
    return i18n.t(`common.priority.${priority}`, { defaultValue: priority });
};
