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
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
            {views.map(
                ({
                    id,
                    icon: Icon,
                    label,
                    disabledInArchive,
                    forceDisabled,
                }) => {
                    if (forceDisabled) return null; // Nie renderuj jeśli wymuszone wyłączenie (np. na tablecie)

                    const isDisabled = disabledInArchive && showArchived;
                    return (
                        <button
                            key={id}
                            onClick={() => !isDisabled && onViewChange(id)}
                            disabled={isDisabled}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                isDisabled
                                    ? 'cursor-not-allowed text-slate-300'
                                    : currentView === id
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'text-slate-600 hover:bg-slate-100'
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
