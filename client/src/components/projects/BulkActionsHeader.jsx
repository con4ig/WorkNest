import React from 'react';
import { X, Archive, ArchiveRestore, Trash2 } from 'lucide-react';

const BulkActionsHeader = ({
    selectedCount,
    onClearSelection,
    onArchive,
    onRestore,
    onDelete,
    showArchived,
}) => {
    return (
        <div className="flex h-[72px] items-center justify-between rounded-xl border border-emerald-100/50 bg-white px-4 text-slate-800 shadow-lg shadow-emerald-500/5 ring-1 ring-black/5 transition-all sm:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onClearSelection}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title="Anuluj zaznaczenie"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600/80">
                        Zaznaczono
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                        {selectedCount}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {!showArchived ? (
                    <button
                        onClick={onArchive}
                        className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:ring-1 hover:ring-emerald-200 active:scale-95"
                        title="Archiwizuj zaznaczone"
                    >
                        <Archive className="h-4 w-4" />
                        <span className="hidden sm:inline">Archiwizuj</span>
                    </button>
                ) : (
                    <button
                        onClick={onRestore}
                        className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:ring-1 hover:ring-emerald-200 active:scale-95"
                        title="Przywróć zaznaczone"
                    >
                        <ArchiveRestore className="h-4 w-4" />
                        <span className="hidden sm:inline">Przywróć</span>
                    </button>
                )}

                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 hover:ring-1 hover:ring-red-200 active:scale-95"
                    title="Usuń zaznaczone"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Usuń</span>
                </button>
            </div>
        </div>
    );
};

export default BulkActionsHeader;
