import React from 'react';
import ContentCard from './ContentCard';
import EditableField from './EditableField';
import { Icon } from './UserIcons';
import { formatDateForDisplay, AVAILABLE_ROLES } from './UserHelpers';

const UserProfessionalCard = ({
    isEditing,
    editData,
    user,
    handleEditChange,
    t,
    i18n,
}) => {
    return (
        <ContentCard
            icon={<Icon.Briefcase />}
            title={t('employees.details.professionalInfo')}
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {isEditing ? (
                    <>
                        <EditableField
                            label={t('common.position')}
                            name="position"
                            value={editData.position}
                            onChange={handleEditChange}
                        />
                        <EditableField
                            label={t('common.roleInSystem')}
                            name="role"
                            value={editData.role}
                            options={AVAILABLE_ROLES}
                            onChange={handleEditChange}
                        />
                        <EditableField
                            label={t('projects.labelStartDate')}
                            name="hireDate"
                            type="date"
                            value={editData.hireDate}
                            onChange={handleEditChange}
                        />
                        <EditableField
                            label={t('employees.details.salary')}
                            name="salary"
                            type="number"
                            value={editData.salary}
                            onChange={handleEditChange}
                        />
                    </>
                ) : (
                    <>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.position')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {user.position || t('common.notSpecified')}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.role')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {t(`common.roles.${user.role}`)}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('employees.details.hireDate')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {formatDateForDisplay(
                                    user.hireDate,
                                    i18n.language,
                                ) || t('common.notSpecified')}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('employees.details.salaryLabel')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {user.salary > 0
                                    ? `${user.salary} PLN`
                                    : t('common.notSpecified')}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </ContentCard>
    );
};

export default UserProfessionalCard;
