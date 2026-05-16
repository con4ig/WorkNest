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
    CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

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
            setError(t('employees.list.importModal.fileRequired') || 'Select a CSV file');
            return;
        }
        if (!tempPassword || tempPassword.length < 6) {
            setError(t('auth.validation.passwordMin') || 'Temporary password must be at least 6 characters');
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
            setError(t('employees.list.importModal.csvOnly') || 'Dozwolone tylko pliki CSV');
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ['email', 'username', 'firstName', 'lastName', 'position', 'department', 'salary', 'role'];
        const exampleRows = [
            ['jan.kowalski@firma.pl', 'janek', 'Jan', 'Kowalski', 'Programista', 'IT', '8000', 'employee'],
            ['anna.nowak@firma.pl', 'anowak', 'Anna', 'Nowak', 'HR Manager', 'HR', '9500', 'hr'],
        ];

        const csvContent = [headers.join(','), ...exampleRows.map((row) => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'szablon_pracownikow.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Full-screen Backdrop */}
            <div 
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">
                                {t('employees.list.importModal.title')}
                            </h2>
                            <p className="mt-1 text-muted-foreground text-xs font-medium">
                                {t('employees.list.importModal.instructions')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Instructions Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                t('employees.list.importModal.instruction1'),
                                t('employees.list.importModal.instruction2'),
                                t('employees.list.importModal.instruction3')
                            ].map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                    <Info size={14} className="mt-1 text-muted-foreground shrink-0" />
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: step }}></p>
                                </div>
                            ))}
                        </div>

                        {/* Roles Table */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('employees.list.importModal.rolesTitle')}</p>
                            <div className="overflow-hidden rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-zinc-800/20 text-[10px]">
                                <table className="w-full text-left">
                                    <thead className="bg-black/5 dark:bg-white/5 font-bold text-muted-foreground uppercase tracking-tighter">
                                        <tr>
                                            <th className="px-3 py-2 border-r border-black/5 dark:border-white/5">{t('employees.list.importModal.csvValue')}</th>
                                            <th className="px-3 py-2">{t('employees.list.importModal.systemRole')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        {[
                                            { val: 'employee', color: 'text-emerald-600 dark:text-emerald-400', label: t('common.roles.employee') },
                                            { val: 'hr', color: 'text-blue-600 dark:text-blue-400', label: t('common.roles.hr') },
                                            { val: 'admin', color: 'text-purple-600 dark:text-purple-400', label: t('common.roles.admin') }
                                        ].map((row, idx) => (
                                            <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className={clsx("px-3 py-2 font-mono border-r border-black/5 dark:border-white/5", row.color)}>{row.val}</td>
                                                <td className="px-3 py-2 text-muted-foreground font-medium">{row.label}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                            <Download size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('employees.list.importModal.downloadTemplate')}</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* File Upload Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <FileSpreadsheet size={16} className="text-primary" />
                                <h3>{t('employees.list.importModal.fileLabel')}</h3>
                            </div>

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={clsx(
                                    "relative group flex flex-col items-center justify-center py-10 px-6 rounded-xl border-2 border-dashed transition-all duration-300",
                                    dragging 
                                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                                        : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-black/10 dark:hover:bg-white/10",
                                    file && "border-emerald-500/30 bg-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                                )}
                            >
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                
                                <div className={clsx(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all",
                                    dragging ? "bg-primary text-black" : 
                                    file ? "bg-emerald-500 text-black" : "bg-black/5 dark:bg-white/5 text-muted-foreground"
                                )}>
                                    {file ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                                </div>

                                <div className="text-center">
                                    <p className="text-sm font-bold text-foreground mb-1">
                                        {file ? file.name : t('employees.list.importModal.chooseFile')}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                        {file 
                                            ? `${(file.size / 1024).toFixed(1)} KB` 
                                            : ".CSV only"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Key size={16} className="text-primary" />
                                <h3>{t('employees.list.importModal.tempPasswordLabel')}</h3>
                            </div>
                            <input
                                type="text"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                placeholder={t('employees.list.importModal.tempPasswordPlaceholder')}
                                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-mono text-sm"
                            />
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                <Info size={12} className="mt-1 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tighter">
                                    {t('employees.list.importModal.tempPasswordHint')}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                <span className="font-medium text-xs">{error}</span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-foreground font-bold rounded-xl transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || isLoading}
                        className={clsx(
                            "relative overflow-hidden px-8 py-2 bg-primary text-black font-bold rounded-xl transition-all hover:bg-primary/90 disabled:opacity-50",
                            isLoading && "pl-12"
                        )}
                    >
                        {isLoading && (
                            <Loader2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 animate-spin" />
                        )}
                        <span className="text-sm font-bold">{isLoading ? t('employees.list.importModal.loading') : t('employees.list.importModal.submit')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
