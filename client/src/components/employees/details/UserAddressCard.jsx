import React from 'react';
import ContentCard from './ContentCard';
import EditableField from './EditableField';
import { Icon } from './UserIcons';

const UserAddressCard = ({
    isEditing,
    editData,
    user,
    handleEditChange,
    t,
}) => {
    return (
        <ContentCard icon={<Icon.Location />} title={t('common.address')}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {isEditing ? (
                    <>
                        <EditableField
                            label={t('common.address')}
                            name="address"
                            value={editData.address}
                            onChange={handleEditChange}
                        />
                        <EditableField
                            label={t('common.city')}
                            name="city"
                            value={editData.city}
                            onChange={handleEditChange}
                        />
                    </>
                ) : (
                    <>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.address')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {user.address || t('common.notProvided')}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.city')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {user.city || t('common.notProvided')}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </ContentCard>
    );
};

export default UserAddressCard;
