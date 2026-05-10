import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    X, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight, 
    FileCheck, 
    FileX,
    ClipboardList,
    Info,
    ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

const ImportResultModal = ({ isOpen, onClose, results }) => {
    const { t } = useTranslation();
    
    if (!isOpen || !results) return null;

    const { processed, created, failedCount, failedSamples } = results;
    const hasErrors = failedCount > 0;
    const isAllSuccess = failedCount === 0 && created > 0;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Full-screen Backdrop */}
            <div 
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                            isAllSuccess ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-primary/20 text-primary"
                        )}>
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                {t('employees.list.importResult.title')}
                            </h2>
                            <p className="mt-1 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                                {t('employees.list.importResult.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Security Info Box */}
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 dark:border-indigo-500/20 flex items-start gap-3">
                        <div className="mt-1 w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                                {t('employees.list.importResult.infoTitle')}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                {t('employees.list.importResult.infoText')}{' '}
                                <code className="rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    WorkNest123!
                                </code>
                            </p>
                            <p className="text-[10px] text-indigo-500 dark:text-indigo-400/80 font-bold uppercase tracking-widest italic">
                                {t('employees.list.importResult.infoHint')}
                            </p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center transition-all">
                            <h5 className="text-xl font-black text-zinc-900 dark:text-white mb-1">{processed}</h5>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('employees.list.importResult.processed')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-center transition-all">
                            <h5 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{created}</h5>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500/80 uppercase tracking-widest">{t('employees.list.importResult.created')}</p>
                        </div>
                        <div className={clsx(
                            "p-4 rounded-xl border text-center transition-all",
                            hasErrors ? "bg-red-500/10 border-red-500/20" : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 opacity-50"
                        )}>
                            <h5 className={clsx("text-xl font-black mb-1", hasErrors ? "text-red-600 dark:text-red-400" : "text-zinc-400 dark:text-zinc-500")}>{failedCount}</h5>
                            <p className={clsx("text-[10px] font-bold uppercase tracking-widest", hasErrors ? "text-red-600 dark:text-red-500/80" : "text-zinc-400 dark:text-zinc-500")}>{t('employees.list.importResult.errors')}</p>
                        </div>
                    </div>

                    {/* Detailed Errors */}
                    {hasErrors && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold px-1">
                                <AlertCircle size={18} className="text-red-500 dark:text-red-400" />
                                <h3>{t('employees.list.importResult.errorDetails')}</h3>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-zinc-800/20 text-xs font-medium">
                                <table className="w-full text-left">
                                    <thead className="bg-black/5 dark:bg-white/5 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">
                                        <tr>
                                            <th className="px-4 py-3 border-r border-black/5 dark:border-white/5">{t('employees.list.importResult.row')}</th>
                                            <th className="px-4 py-3 border-r border-black/5 dark:border-white/5">{t('employees.list.importResult.email')}</th>
                                            <th className="px-4 py-3">{t('employees.list.importResult.error')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        {failedSamples.map((fail, idx) => (
                                            <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 border-r border-black/5 dark:border-white/5 font-mono text-zinc-500">{fail.row}</td>
                                                <td className="px-4 py-3 border-r border-black/5 dark:border-white/5 font-bold text-zinc-700 dark:text-zinc-300">{fail.email || '-'}</td>
                                                <td className="px-4 py-3 text-red-600 dark:text-red-500 font-bold tracking-tight">{fail.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {failedCount > failedSamples.length && (
                                    <div className="p-3 bg-black/5 dark:bg-white/5 text-center border-t border-black/5 dark:border-white/5">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            {t('employees.list.importResult.moreErrors', { count: failedCount - failedSamples.length })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!hasErrors && isAllSuccess && (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">Import zakończony sukcesem!</h3>
                                <p className="text-zinc-500 text-xs max-w-sm mx-auto font-medium">
                                    Wszyscy pracownicy zostali pomyślnie zaimportowani do systemu.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95"
                    >
                        {t('employees.list.importResult.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportResultModal;
