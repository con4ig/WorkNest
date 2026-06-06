import React from 'react';
import ContentCard from './ContentCard';
import EditableField from './EditableField';
import { Icon } from './UserIcons';

const UserNotesCard = ({ isEditing, editData, user, handleEditChange, t }) => {
    return (
        <ContentCard icon={<Icon.Notes />} title={t('common.notes')}>
            {isEditing ? (
                <EditableField
                    label={t('employees.details.notesLabel')}
                    name="notes"
                    type="textarea"
                    value={editData.notes}
                    onChange={handleEditChange}
                />
            ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground/80">
                    {user.notes || t('employees.details.noNotes')}
                </p>
            )}
        </ContentCard>
    );
};

export default UserNotesCard;
