import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectRow from './projects/ProjectRow';
import ProjectGridCard from './projects/ProjectGridCard';
import clsx from 'clsx';

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
        <>
            <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-500">
                    <thead className="bg-slate-50">
                        <tr>
                            {currentUserRole !== 'employee' && (
                                <th className="w-4 px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={areAllSelected}
                                        onChange={onToggleSelectAll}
                                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                </th>
                            )}
                            {tableHeaders.map((header) => (
                                <th
                                    key={header}
                                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
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
            <div className="block space-y-4 lg:hidden">
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
        </>
    );
};

export default ListView;
