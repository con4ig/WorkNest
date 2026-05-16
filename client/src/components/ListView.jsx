import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectRow from './projects/ProjectRow';
import ProjectGridCard from './projects/ProjectGridCard';

const ListView = ({
    projects,
    currentUserRole,
    onArchive,
    onRestore,
    onPermanentDelete,
    onRowClick,
    showArchived,
    selectedProjects,
    onToggleSelect,
    onToggleSelectAll,
}) => {
    const { t } = useTranslation();

    const tableHeaders = [
        t('projects.tableHeaders.projectName'),
        t('projects.tableHeaders.status'),
        t('projects.tableHeaders.progress'),
        t('projects.tableHeaders.deadline'),
        t('projects.tableHeaders.assigned'),
    ];

    if (currentUserRole !== 'employee') {
        tableHeaders.push(t('projects.tableHeaders.actions'));
    }

    // Determine if all projects are selected
    const areAllSelected =
        projects.length > 0 && selectedProjects.length === projects.length;

    return (
        <div className="space-y-6">
            <div className="hidden lg:block">
                <div className="rounded-2xl border border-border/50 bg-secondary/5 transition-all duration-300 backdrop-blur-sm">
                    <table className="min-w-full text-left text-sm text-muted-foreground">
                        <thead className="bg-secondary/20 border-b border-border/50">
                            <tr>
                                {currentUserRole !== 'employee' && (
                                    <th className="w-12 px-6 py-4 rounded-tl-2xl">
                                        <input
                                            type="checkbox"
                                            checked={areAllSelected}
                                            onChange={onToggleSelectAll}
                                            className="h-4.5 w-4.5 cursor-pointer rounded-md border-input bg-card text-primary transition-all focus:ring-primary focus:ring-offset-2"
                                        />
                                    </th>
                                )}
                                {tableHeaders.map((header, i) => (
                                    <th
                                        key={header}
                                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60${i === 0 && currentUserRole === 'employee' ? ' rounded-tl-2xl' : ''}${i === tableHeaders.length - 1 ? ' rounded-tr-2xl' : ''}`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 bg-transparent">
                        {projects.map((project) => (
                            <ProjectRow
                                key={project._id}
                                project={project}
                                currentUserRole={currentUserRole}
                                onArchive={onArchive}
                                onRestore={onRestore}
                                onPermanentDelete={onPermanentDelete}
                                onRowClick={onRowClick}
                                showArchived={showArchived}
                                isSelected={selectedProjects.includes(
                                    project._id,
                                )}
                                onToggleSelect={onToggleSelect}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Mobile View */}
            <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
                {projects.map((project) => (
                    <ProjectGridCard
                        key={project._id}
                        project={project}
                        currentUserRole={currentUserRole}
                        onArchive={onArchive}
                        onRestore={onRestore}
                        onPermanentDelete={onPermanentDelete}
                        showArchived={showArchived}
                        onCardClick={onRowClick}
                        isSelected={selectedProjects.includes(project._id)}
                        onToggleSelect={onToggleSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default ListView;
