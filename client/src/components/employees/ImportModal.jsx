import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    X,
    Download,
    Upload,
    FileText,
    Key,
    AlertCircle,
    Info,
    FileSpreadsheet,
    ArrowRight,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui/Button';

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
    link.setAttribute('download', 'worknest_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ImportModal = ({ isOpen, onClose, onImport, isLoading }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [tempPassword, setTempPassword] = useState('');
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!file) {
            setError(
                t('employees.list.importModal.fileRequired') ||
                    'Select a CSV file',
            );
            return;
        }
        if (!tempPassword || tempPassword.length < 6) {
            setError(
                t('auth.validation.passwordMin') ||
                    'Temporary password must be at least 6 characters',
            );
            return;
        }
        onImport(file, tempPassword);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            setError('');
        } else {
            setError(
                t('employees.list.importModal.csvOnly') ||
                    'Dozwolone tylko pliki CSV',
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="animate-in fade-in absolute inset-0 bg-foreground/25 backdrop-blur-sm transition-opacity duration-200"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="animate-in zoom-in-95 fade-in relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl duration-200">
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between border-b border-border px-5 pb-4 pt-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                            <Upload size={16} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold leading-snug text-foreground">
                                {t('employees.list.importModal.title')}
                            </h2>
                            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                                {t('employees.list.importModal.instructions')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    {/* Instructions Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                t('employees.list.importModal.instruction1'),
                                t('employees.list.importModal.instruction2'),
                                t('employees.list.importModal.instruction3'),
                            ].map((step, _idx) => (
                                <div
                                    key={step}
                                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
                                >
                                    <Info
                                        size={14}
                                        className="mt-1 shrink-0 text-muted-foreground"
                                    />
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Roles Table */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {t('employees.list.importModal.rolesTitle')}
                            </p>
                            <div className="overflow-hidden rounded-xl border border-border bg-background text-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-muted font-semibold text-muted-foreground">
                                        <tr>
                                            <th className="border-r border-border px-3 py-2">
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
                                    <tbody className="divide-y divide-border">
                                        {[
                                            {
                                                val: 'employee',
                                                color: 'text-emerald-600 dark:text-emerald-400',
                                                label: t(
                                                    'common.roles.employee',
                                                ),
                                            },
                                            {
                                                val: 'hr',
                                                color: 'text-blue-600 dark:text-blue-400',
                                                label: t('common.roles.hr'),
                                            },
                                            {
                                                val: 'admin',
                                                color: 'text-purple-600 dark:text-purple-400',
                                                label: t('common.roles.admin'),
                                            },
                                        ].map((row, _idx) => (
                                            <tr
                                                key={row.val}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <td
                                                    className={clsx(
                                                        'border-r border-border px-3 py-2 font-mono',
                                                        row.color,
                                                    )}
                                                >
                                                    {row.val}
                                                </td>
                                                <td className="px-3 py-2 font-medium text-foreground">
                                                    {row.label}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            className="flex w-full items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            {t('employees.list.importModal.downloadTemplate')}
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* File Upload Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <FileSpreadsheet
                                    size={16}
                                    className="text-primary"
                                />
                                <h3>
                                    {t('employees.list.importModal.fileLabel')}
                                </h3>
                            </div>

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={clsx(
                                    'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-300',
                                    dragging
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                                        : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50',
                                    file && 'border-primary/50 bg-primary/5',
                                )}
                            >
                                <input
                                    type="file"
                                    accept=".csv"
                                    aria-label={
                                        t('employees.list.importModal.title') ||
                                        'Upload CSV'
                                    }
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                />

                                <div
                                    className={clsx(
                                        'mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                                        dragging
                                            ? 'bg-primary text-primary-foreground'
                                            : file
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {file ? (
                                        <CheckCircle2 size={24} />
                                    ) : (
                                        <Upload size={24} />
                                    )}
                                </div>

                                <div className="text-center">
                                    <p className="mb-1 text-sm font-bold text-foreground">
                                        {file
                                            ? file.name
                                            : t(
                                                  'employees.list.importModal.chooseFile',
                                              )}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                        {file
                                            ? `${(file.size / 1024).toFixed(1)} KB`
                                            : '.CSV only'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Key size={16} className="text-primary" />
                                <h3>
                                    {t(
                                        'employees.list.importModal.tempPasswordLabel',
                                    )}
                                </h3>
                            </div>
                            <input
                                type="text"
                                value={tempPassword}
                                aria-label={t(
                                    'employees.list.importModal.tempPasswordLabel',
                                )}
                                onChange={(e) =>
                                    setTempPassword(e.target.value)
                                }
                                placeholder={t(
                                    'employees.list.importModal.tempPasswordPlaceholder',
                                )}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <div className="flex items-start gap-2 rounded-xl border border-border bg-background p-3">
                                <Info
                                    size={14}
                                    className="mt-0.5 text-muted-foreground"
                                />
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {t(
                                        'employees.list.importModal.tempPasswordHint',
                                    )}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                                <AlertCircle size={16} />
                                <span className="text-xs font-medium">
                                    {error}
                                </span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!file || isLoading}
                        isLoading={isLoading}
                    >
                        {t('employees.list.importModal.submit')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
