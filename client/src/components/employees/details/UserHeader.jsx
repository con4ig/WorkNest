import React from 'react';
import { Icon } from './UserIcons';

const UserHeaderEdit = ({
    isSaving,
    handleSave,
    editData,
    handleEditChange,
    setIsEditing,
    fetchData,
    t,
}) => (
    <header className="relative rounded-lg border border-border bg-card p-10 shadow-sm sm:p-12">
        <div className="relative z-10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                    type="text"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleEditChange}
                    placeholder={`${t('common.firstName')}...`}
                    aria-label={t('common.firstName')}
                    className="w-full border-b border-border bg-transparent text-3xl font-bold tracking-tight text-foreground focus:border-primary focus:outline-none sm:text-4xl lg:text-5xl"
                />
                <input
                    type="text"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleEditChange}
                    placeholder={`${t('common.lastName')}...`}
                    aria-label={t('common.lastName')}
                    className="w-full border-b border-border bg-transparent text-3xl font-bold tracking-tight text-foreground focus:border-primary focus:outline-none sm:text-4xl lg:text-5xl"
                />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                            {t('common.saving')}
                        </div>
                    ) : (
                        <>
                            <Icon.Save />
                            {t('common.saveChanges')}
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsEditing(false);
                        fetchData();
                    }}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
                >
                    <Icon.Cancel />
                    {t('common.cancel')}
                </button>
            </div>
        </div>
    </header>
);

const UserHeaderView = ({ isAdmin, setIsEditing, fullName, t }) => (
    <header className="relative rounded-lg border border-border bg-card p-10 shadow-sm sm:p-12">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {fullName}
            </h1>
            {isAdmin && (
                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <Icon.Edit />
                        {t('common.editData')}
                    </button>
                </div>
            )}
        </div>
    </header>
);

const UserHeader = (props) => {
    if (props.isEditing) {
        return <UserHeaderEdit {...props} />;
    }
    return <UserHeaderView {...props} />;
};

export default UserHeader;
