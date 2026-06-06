import React from 'react';
import { Select } from '../../ui/Select';
import { ListFilter, FolderKanban, Archive, RefreshCcw } from 'lucide-react';
import { Button } from '../../ui/Button';
import ViewSwitcher from '../../ViewSwitcher';

const ProjectsFilterBar = ({
    t,
    statusFilter,
    setStatusFilter,
    showArchived,
    setShowArchived,
    screenSize,
    isFiltering,
    handleRefresh,
    currentView,
    handleViewChange,
}) => {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                    <Select
                        className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[200px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">
                            {t('projects.filter.allStatuses')}
                        </option>
                        <option value="pending">
                            {t('common.projectStatus.pending')}
                        </option>
                        <option value="running">
                            {t('common.projectStatus.running')}
                        </option>
                        <option value="completed">
                            {t('common.projectStatus.completed')}
                        </option>
                        <option value="on-hold">
                            {t('common.projectStatus.on-hold')}
                        </option>
                    </Select>
                    <ListFilter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                    <button
                        type="button"
                        onClick={() => setShowArchived(false)}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            !showArchived
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        <FolderKanban className="h-3.5 w-3.5" />
                        {t('projects.misc.active')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowArchived(true)}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            showArchived
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        <Archive className="h-3.5 w-3.5" />
                        {t('projects.misc.archive')}
                    </button>
                </div>
                {screenSize !== 'mobile' && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        className={`h-10 w-10 ${isFiltering ? 'animate-spin' : ''}`}
                        title={t('projects.filter.refresh')}
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {screenSize !== 'mobile' && (
                <ViewSwitcher
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    showArchived={showArchived}
                    disableKanban={screenSize !== 'desktop'}
                />
            )}
        </div>
    );
};

export default ProjectsFilterBar;
