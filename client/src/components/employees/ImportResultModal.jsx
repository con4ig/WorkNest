import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle } from 'lucide-react';

const ImportResultModal = ({ isOpen, onClose, results }) => {
    const { t } = useTranslation();
    if (!isOpen || !results) return null;

    const hasErrors = results.failedCount > 0;

    return (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md duration-200">
            <div className="animate-in zoom-in-95 flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-2xl duration-200">
                <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                                {t('employees.list.importResult.title')}
                            </h3>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {t('employees.list.importResult.subtitle')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="-mr-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-5 sm:p-6">
                    <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-800">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold">
                                    {t('employees.list.importResult.infoTitle')}
                                </h4>
                                <p className="mt-1 text-sm">
                                    {t('employees.list.importResult.infoText')}{' '}
                                    <code className="rounded bg-blue-100 px-1 py-0.5 font-mono font-bold">
                                        WorkNest123!
                                    </code>
                                </p>
                                <p className="mt-1 text-xs text-blue-600">
                                    {t('employees.list.importResult.infoHint')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                            <div className="text-2xl font-bold text-slate-700">
                                {results.processed}
                            </div>
                            <div className="text-xs font-semibold uppercase text-slate-500">
                                {t('employees.list.importResult.processed')}
                            </div>
                        </div>
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-600">
                                {results.created}
                            </div>
                            <div className="text-xs font-semibold uppercase text-emerald-600">
                                {t('employees.list.importResult.created')}
                            </div>
                        </div>
                        <div
                            className={`rounded-lg border p-4 text-center ${
                                hasErrors
                                    ? 'border-red-100 bg-red-50'
                                    : 'border-slate-100 bg-slate-50'
                            }`}
                        >
                            <div
                                className={`text-2xl font-bold ${
                                    hasErrors
                                        ? 'text-red-600'
                                        : 'text-slate-700'
                                }`}
                            >
                                {results.failedCount}
                            </div>
                            <div
                                className={`text-xs font-semibold uppercase ${
                                    hasErrors
                                        ? 'text-red-600'
                                        : 'text-slate-500'
                                }`}
                            >
                                {t('employees.list.importResult.errors')}
                            </div>
                        </div>
                    </div>

                    {hasErrors && (
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 font-semibold text-slate-800">
                                <AlertCircle className="h-5 w-5" />{' '}
                                {t('employees.list.importResult.errorDetails')}
                            </h4>
                            <div className="overflow-x-auto rounded-lg border border-red-100 bg-red-50">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-red-100/50 font-semibold text-red-800">
                                        <tr>
                                            <th className="px-4 py-2">
                                                {t(
                                                    'employees.list.importResult.row',
                                                )}
                                            </th>
                                            <th className="px-4 py-2">
                                                {t(
                                                    'employees.list.importResult.email',
                                                )}
                                            </th>
                                            <th className="px-4 py-2">
                                                {t(
                                                    'employees.list.importResult.error',
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-100 text-red-700">
                                        {results.failedSamples.map(
                                            (fail, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2">
                                                        {fail.row}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {fail.email || '-'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {fail.message}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                                {results.failedCount >
                                    results.failedSamples.length && (
                                    <div className="bg-red-100/30 px-4 py-2 text-center text-xs italic text-red-600">
                                        {t(
                                            'employees.list.importResult.moreErrors',
                                            {
                                                count:
                                                    results.failedCount -
                                                    results.failedSamples
                                                        .length,
                                            },
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-100 p-4 sm:flex sm:justify-end">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto"
                    >
                        {t('employees.list.importResult.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportResultModal;
