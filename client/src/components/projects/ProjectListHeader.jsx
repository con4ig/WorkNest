import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProjectListHeader = ({ onAddProject, currentUserRole }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    console.log(i18n.getDataByLanguage('en'));
    return (
        <header className="sticky top-0 z-30 mb-4 rounded-2xl bg-white shadow-sm md:mb-6">
            <div className="max-w-8xl mx-auto px-4 py-4 md:px-8 md:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">{t('projects.projectListHeader.dashboard')}</span>
                        </button>
                        <div className="hidden h-8 w-px bg-slate-200 sm:block"></div>
                        <div>
                            <h1 className="flex items-center gap-3 text-xl font-bold text-slate-800 sm:text-2xl">
                                <FolderKanban className="text-emerald-600" />{' '}
                                {t('projects.projectListHeader.title')}
                            </h1>
                            <p className="hidden text-sm text-slate-500 md:block">
                                {t('projects.projectListHeader.subtitle')}
                            </p>
                        </div>
                    </div>
                    {(currentUserRole === 'admin' ||
                        currentUserRole === 'hr') && (
                        <button
                            onClick={onAddProject}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">{t('projects.projectListHeader.addProject')}</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ProjectListHeader;
