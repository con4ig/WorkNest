import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

const ProjectListHeader = ({ onAddProject, currentUserRole }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    console.log(i18n.getDataByLanguage('en'));
    return (
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl transition-all">
            <div className="w-full px-6 py-4 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center justify-center rounded-xl border border-border bg-card p-2.5 text-foreground shadow-sm transition-all hover:bg-secondary hover:shadow-md"
                        >
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </button>
                        <div className="h-10 w-px bg-border/60"></div>
                        <div>
                            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
                                <FolderKanban className="h-6 w-6 text-primary" />{' '}
                                {t('projects.projectListHeader.title')}
                            </h1>
                            <p className="hidden text-xs font-medium text-muted-foreground md:block">
                                {t('projects.projectListHeader.subtitle')}
                            </p>
                        </div>
                    </div>
                    {(currentUserRole === 'admin' ||
                        currentUserRole === 'hr') && (
                        <Button
                            onClick={onAddProject}
                            variant="outline"
                            className="h-10 gap-2 rounded-2xl border-border/50 bg-secondary/20 px-5 font-bold text-foreground shadow-none transition-all hover:scale-[1.02] hover:bg-secondary/40 hover:border-primary/50 active:scale-95 uppercase tracking-wider text-xs"
                        >
                            <Plus className="h-4 w-4 text-primary stroke-[3]" />
                            <span>{t('projects.projectListHeader.addProject')}</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ProjectListHeader;
