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
    ShieldCheck,
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
                className="animate-in fade-in fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl duration-300 dark:border-white/10 dark:bg-zinc-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/5 p-6 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div
                            className={clsx(
                                'flex h-10 w-10 items-center justify-center rounded-xl font-bold',
                                isAllSuccess
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-primary/20 text-primary',
                            )}
                        >
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                {t('employees.list.importResult.title')}
                            </h2>
                            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                {t('employees.list.importResult.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
                    {/* Security Info Box */}
                    <div className="flex items-start gap-3 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4 dark:border-indigo-500/20">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                                {t('employees.list.importResult.infoTitle')}
                            </h4>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                {t('employees.list.importResult.infoText')}{' '}
                                <code className="rounded border border-black/10 bg-black/5 px-1.5 py-0.5 font-mono font-bold text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-indigo-400">
                                    WorkNest123!
                                </code>
                            </p>
                            <p className="text-[10px] font-bold uppercase italic tracking-widest text-indigo-500 dark:text-indigo-400/80">
                                {t('employees.list.importResult.infoHint')}
                            </p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-black/5 bg-black/5 p-4 text-center transition-all dark:border-white/5 dark:bg-white/5">
                            <h5 className="mb-1 text-xl font-black text-zinc-900 dark:text-white">
                                {processed}
                            </h5>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                {t('employees.list.importResult.processed')}
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/10 p-4 text-center transition-all">
                            <h5 className="mb-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
                                {created}
                            </h5>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500/80">
                                {t('employees.list.importResult.created')}
                            </p>
                        </div>
                        <div
                            className={clsx(
                                'rounded-xl border p-4 text-center transition-all',
                                hasErrors
                                    ? 'border-red-500/20 bg-red-500/10'
                                    : 'border-black/5 bg-black/5 opacity-50 dark:border-white/5 dark:bg-white/5',
                            )}
                        >
                            <h5
                                className={clsx(
                                    'mb-1 text-xl font-black',
                                    hasErrors
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-zinc-400 dark:text-zinc-500',
                                )}
                            >
                                {failedCount}
                            </h5>
                            <p
                                className={clsx(
                                    'text-[10px] font-bold uppercase tracking-widest',
                                    hasErrors
                                        ? 'text-red-600 dark:text-red-500/80'
                                        : 'text-zinc-400 dark:text-zinc-500',
                                )}
                            >
                                {t('employees.list.importResult.errors')}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Errors */}
                    {hasErrors && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1 font-semibold text-zinc-900 dark:text-zinc-100">
                                <AlertCircle
                                    size={18}
                                    className="text-red-500 dark:text-red-400"
                                />
                                <h3>
                                    {t(
                                        'employees.list.importResult.errorDetails',
                                    )}
                                </h3>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-black/5 bg-black/[0.02] text-xs font-medium dark:border-white/5 dark:bg-zinc-800/20">
                                <table className="w-full text-left">
                                    <thead className="bg-black/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:bg-white/5">
                                        <tr>
                                            <th className="border-r border-black/5 px-4 py-3 dark:border-white/5">
                                                {t(
                                                    'employees.list.importResult.row',
                                                )}
                                            </th>
                                            <th className="border-r border-black/5 px-4 py-3 dark:border-white/5">
                                                {t(
                                                    'employees.list.importResult.email',
                                                )}
                                            </th>
                                            <th className="px-4 py-3">
                                                {t(
                                                    'employees.list.importResult.error',
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        {failedSamples.map((fail, idx) => (
                                            <tr
                                                key={fail.row || idx}
                                                className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                            >
                                                <td className="border-r border-black/5 px-4 py-3 font-mono text-zinc-500 dark:border-white/5">
                                                    {fail.row}
                                                </td>
                                                <td className="border-r border-black/5 px-4 py-3 font-bold text-zinc-700 dark:border-white/5 dark:text-zinc-300">
                                                    {fail.email || '-'}
                                                </td>
                                                <td className="px-4 py-3 font-bold tracking-tight text-red-600 dark:text-red-500">
                                                    {fail.message}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {failedCount > failedSamples.length && (
                                    <div className="border-t border-black/5 bg-black/5 p-3 text-center dark:border-white/5 dark:bg-white/5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            {t(
                                                'employees.list.importResult.moreErrors',
                                                {
                                                    count:
                                                        failedCount -
                                                        failedSamples.length,
                                                },
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!hasErrors && isAllSuccess && (
                        <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h3 className="mb-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Import completed successfully!
                                </h3>
                                <p className="mx-auto max-w-sm text-xs font-medium text-zinc-500">
                                    All employees were imported into the system.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end border-t border-black/5 p-6 dark:border-white/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-primary px-8 py-2 font-bold text-black transition-all hover:bg-primary/90 active:scale-95"
                    >
                        {t('employees.list.importResult.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportResultModal;
