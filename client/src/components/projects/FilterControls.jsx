import React, { useState, useEffect, useRef } from 'react';
import { Search, ListFilter, RefreshCcw } from 'lucide-react';

const FilterControls = ({ onFilterChange, onRefresh, isFiltering }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) {
            const handler = setTimeout(() => {
                onFilterChange({ name: searchTerm, status });
            }, 500);

            return () => clearTimeout(handler);
        } else {
            isMounted.current = true;
        }
    }, [searchTerm, status, onFilterChange]);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Szukaj projektu..."
                    className="w-full rounded-lg border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1 sm:flex-none">
                    <ListFilter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full appearance-none rounded-lg border-slate-200 py-2.5 pl-10 pr-8 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:w-48"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">Wszystkie statusy</option>
                        <option value="pending">Oczekujące</option>
                        <option value="running">W Trakcie</option>
                        <option value="completed">Ukończone</option>
                        <option value="on-hold">Wstrzymane</option>
                    </select>
                </div>
                <button
                    onClick={onRefresh}
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                    title="Odśwież listę"
                >
                    <RefreshCcw
                        className={`h-5 w-5 ${isFiltering ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>
        </div>
    );
};

export default FilterControls;
