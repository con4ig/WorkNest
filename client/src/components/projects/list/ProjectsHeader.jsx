import React from 'react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';

const ProjectsHeader = ({
    navigate,
    t,
    currentUserRole,
    setIsModalOpen,
    searchTerm,
    setSearchTerm,
}) => {
    return (
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
            <div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/dashboard')}
                        className="mr-2 md:hidden"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        {t('projects.projectListHeader.title')}
                    </h1>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t('projects.projectListHeader.subtitle')}
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                {(currentUserRole === 'admin' || currentUserRole === 'hr') && (
                    <Button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        variant="outline"
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>
                            {t('projects.projectListHeader.addProject')}
                        </span>
                    </Button>
                )}
                <div className="relative w-full sm:w-auto">
                    <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[250px]"
                        placeholder={t('projects.filter.searchPlaceholder')}
                        aria-label={t('projects.filter.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsHeader;
