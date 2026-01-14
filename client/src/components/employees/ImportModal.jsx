import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Upload } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport, isLoading }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [tempPassword, setTempPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!file) {
            setError(
                t('employees.list.importModal.fileRequired') ||
                    'Wybierz plik CSV',
            );
            return;
        }
        if (!tempPassword || tempPassword.length < 6) {
            setError(
                t('auth.validation.passwordMin') ||
                    'Hasło tymczasowe musi mieć min. 6 znaków',
            );
            return;
        }
        onImport(file, tempPassword);
    };

    const handleDownloadTemplate = () => {
        const headers = [
            'email',
            'username',
            'firstName',
            'lastName',
            'position',
            'department',
            'salary',
            'role',
        ];
        const exampleRows = [
            [
                'jan.kowalski@firma.pl',
                'janek',
                'Jan',
                'Kowalski',
                'Programista',
                'IT',
                '8000',
                'employee',
            ],
            [
                'anna.nowak@firma.pl',
                'anowak',
                'Anna',
                'Nowak',
                'HR Manager',
                'HR',
                '9500',
                'hr',
            ],
        ];

        const csvContent = [
            headers.join(','),
            ...exampleRows.map((row) => row.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'szablon_pracownikow.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md duration-200">
            <div className="animate-in zoom-in-95 w-full max-w-2xl rounded-xl border border-slate-200/50 bg-white p-5 shadow-2xl duration-200 sm:p-6">
                <div className="mb-6 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                        {t('employees.list.importModal.title')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="-mt-1 text-slate-400 transition-colors hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6 space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    <div>
                        <p className="mb-2 font-semibold text-slate-800">
                            {t('employees.list.importModal.instructions')}
                        </p>
                        <ul className="ml-1 list-inside list-disc space-y-1 text-slate-600">
                            <li
                                dangerouslySetInnerHTML={{
                                    __html: t(
                                        'employees.list.importModal.instruction1',
                                    ),
                                }}
                            ></li>
                            <li>
                                {t('employees.list.importModal.instruction2')}
                            </li>
                            <li>
                                {t('employees.list.importModal.instruction3')}
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-2 font-semibold text-slate-800">
                            {t('employees.list.importModal.rolesTitle')}
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 font-semibold text-slate-700">
                                    <tr>
                                        <th className="border-r border-slate-200 px-3 py-2">
                                            {t(
                                                'employees.list.importModal.csvValue',
                                            )}
                                        </th>
                                        <th className="px-3 py-2">
                                            {t(
                                                'employees.list.importModal.systemRole',
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    <tr>
                                        <td className="border-r border-slate-200 px-3 py-2 font-mono text-emerald-600">
                                            employee
                                        </td>
                                        <td className="px-3 py-2">
                                            {t('common.roles.employee')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-r border-slate-200 px-3 py-2 font-mono text-blue-600">
                                            hr
                                        </td>
                                        <td className="px-3 py-2">
                                            {t('common.roles.hr')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-r border-slate-200 px-3 py-2 font-mono text-purple-600">
                                            admin
                                        </td>
                                        <td className="px-3 py-2">
                                            {t('common.roles.admin')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="mt-2 flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                    >
                        <Download className="h-4 w-4" />{' '}
                        {t('employees.list.importModal.downloadTemplate')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('employees.list.importModal.fileLabel')}
                        </label>
                        <div className="relative flex items-center gap-3">
                            <label className="flex cursor-pointer items-center justify-center rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                                <Upload className="mr-2 h-4 w-4" />
                                <span>
                                    {t('employees.list.importModal.chooseFile')}
                                </span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="sr-only"
                                />
                            </label>
                            <span className="truncate text-sm text-slate-500">
                                {file
                                    ? file.name
                                    : t(
                                          'employees.list.importModal.noFileSelected',
                                      )}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('employees.list.importModal.tempPasswordLabel')}
                        </label>
                        <input
                            type="text"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-emerald-500 md:text-sm"
                            placeholder={t(
                                'employees.list.importModal.tempPasswordPlaceholder',
                            )}
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            {t('employees.list.importModal.tempPasswordHint')}
                        </p>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {isLoading
                                ? t('employees.list.importModal.loading')
                                : t('employees.list.importModal.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportModal;
