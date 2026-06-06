import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import BulkActionsHeader from '../BulkActionsHeader';
import GridView from '../../GridView';
import KanbanView from '../../KanbanView';
import ListView from '../../ListView';
import { FolderKanban } from 'lucide-react';

const ProjectsContent = ({
    isFiltering,
    projects,
    currentUserRole,
    selectedProjects,
    setSelectedProjects,
    handleBulkAction,
    showArchived,
    screenSize,
    currentView,
    handleArchive,
    handleRestore,
    handlePermanentDelete,
    handleRowClick,
    toggleSelection,
    toggleSelectAll,
    handleStatusChange,
    t,
}) => {
    return (
        <Card
            className={`transition-opacity duration-300 ${
                isFiltering ? 'opacity-60' : 'opacity-100'
            } h-full border-border bg-card shadow-sm`}
        >
            <CardContent className="h-full p-0">
                {currentUserRole !== 'employee' &&
                    selectedProjects.length > 0 && (
                        <div className="border-b border-border bg-muted/30 p-4">
                            <BulkActionsHeader
                                selectedCount={selectedProjects.length}
                                onClearSelection={() => setSelectedProjects([])}
                                onArchive={() => handleBulkAction('archive')}
                                onRestore={() => handleBulkAction('restore')}
                                onDelete={() => handleBulkAction('delete')}
                                showArchived={showArchived}
                            />
                        </div>
                    )}

                <div className="h-full p-4 md:p-6">
                    {projects.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">
                                {showArchived
                                    ? t('projects.misc.noArchivedProjects')
                                    : t('projects.misc.noProjectsFound')}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('common.tryDifferentSearch')}
                            </p>
                        </div>
                    ) : screenSize === 'mobile' ||
                      currentView === 'grid' ||
                      (currentView === 'kanban' &&
                          (showArchived || screenSize !== 'desktop')) ? (
                        <GridView
                            projects={projects}
                            currentUserRole={currentUserRole}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            onDelete={handlePermanentDelete}
                            onCardClick={handleRowClick}
                            showArchived={showArchived}
                            selectedProjects={selectedProjects}
                            onToggleSelect={toggleSelection}
                        />
                    ) : currentView === 'kanban' ? (
                        <KanbanView
                            projects={projects}
                            onStatusChange={handleStatusChange}
                            onCardClick={handleRowClick}
                            onArchive={handleArchive}
                            onPermanentDelete={handlePermanentDelete}
                            currentUserRole={currentUserRole}
                        />
                    ) : (
                        <ListView
                            projects={projects}
                            currentUserRole={currentUserRole}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            onPermanentDelete={handlePermanentDelete}
                            onRowClick={handleRowClick}
                            showArchived={showArchived}
                            selectedProjects={selectedProjects}
                            onToggleSelect={toggleSelection}
                            onToggleSelectAll={toggleSelectAll}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProjectsContent;
