import React from 'react';
import ContentCard from './ContentCard';
import EditableField from './EditableField';
import { Icon } from './UserIcons';

const UserContactCard = ({
    isEditing,
    editData,
    user,
    handleEditChange,
    t,
}) => {
    return (
        <ContentCard icon={<Icon.Mail />} title={t('common.contact')}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {isEditing ? (
                    <>
                        <EditableField
                            label={t('common.email')}
                            name="email"
                            type="email"
                            value={editData.email}
                            onChange={handleEditChange}
                        />
                        <EditableField
                            label={t('common.phoneNumber')}
                            name="phoneNumber"
                            value={editData.phoneNumber}
                            onChange={handleEditChange}
                        />
                    </>
                ) : (
                    <>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.email')}
                            </p>
                            <a
                                href={`mailto:${user.email}`}
                                className="text-base font-semibold text-primary hover:underline"
                            >
                                {user.email}
                            </a>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.phoneNumber')}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {user.phoneNumber || t('common.notProvided')}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </ContentCard>
    );
};

export default UserContactCard;
