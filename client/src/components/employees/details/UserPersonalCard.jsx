import React from 'react';
import ContentCard from './ContentCard';
import EditableField from './EditableField';
import { Icon } from './UserIcons';

const UserPersonalCard = ({
    isEditing,
    editData,
    user,
    handleEditChange,
    t,
}) => {
    return (
        <ContentCard
            icon={<Icon.Badge />}
            title={t('employees.details.personalData')}
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {isEditing ? (
                    <>
                        <EditableField
                            label={t('employees.details.peselId')}
                            name="peselOrId"
                            value={editData.peselOrId}
                            onChange={handleEditChange}
                        />
                    </>
                ) : (
                    <>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('employees.details.peselId')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {user.peselOrId || t('common.notProvided')}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </ContentCard>
    );
};

export default UserPersonalCard;
