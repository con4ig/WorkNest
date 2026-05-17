import React from 'react';
import { LayoutList, LayoutDashboard, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ViewSwitcher = ({
    currentView,
    onViewChange,
    showArchived = false,
    disableKanban = false,
}) => {
    const { t } = useTranslation();

    const views = [
        {
            id: 'kanban',
            icon: LayoutDashboard,
            label: t('projects.view.kanban'),
            disabledInArchive: true,
            forceDisabled: disableKanban,
        },
        { id: 'list', icon: LayoutList, label: t('projects.view.list') },
        { id: 'grid', icon: LayoutGrid, label: t('projects.view.grid') },
    ];

    return (
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/20 p-1 backdrop-blur-sm">
            {views.map(
                ({ id, icon, label, disabledInArchive, forceDisabled }) => {
                    if (forceDisabled) return null;

                    const Icon = icon;
                    const isDisabled = disabledInArchive && showArchived;
                    return (
                        <button
                            key={id}
                            onClick={() => !isDisabled && onViewChange(id)}
                            disabled={isDisabled}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                                isDisabled
                                    ? 'cursor-not-allowed text-muted-foreground/30'
                                    : currentView === id
                                      ? 'bg-primary text-primary-foreground shadow-sm'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            title={
                                isDisabled
                                    ? `${label} (${t('projects.view.notAvailableInArchive')})`
                                    : label
                            }
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    );
                },
            )}
        </div>
    );
};

export default ViewSwitcher;
