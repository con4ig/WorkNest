import React, { useState, useEffect, useRef } from 'react';
import { Search, ListFilter, RefreshCcw } from 'lucide-react';

const FilterControls = ({
    onFilterChange,
    onRefresh,
    isFiltering,
    screenSize,
    filters,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const isMounted = useRef(false);

    // Sync internal state with parent state when filters prop changes
    useEffect(() => {
        setSearchTerm(filters.name);
        setStatus(filters.status);
    }, [filters]);

    useEffect(() => {
        // Debounce filter changes
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Szukaj projektu..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <ListFilter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-8 text-sm shadow-sm transition-all hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
                {screenSize !== 'mobile' && (
                    <button
                        onClick={onRefresh}
                        className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:border-emerald-400 hover:bg-slate-50 hover:text-emerald-600 active:scale-95"
                        title="Odśwież listę"
                    >
                        <RefreshCcw
                            className={`h-5 w-5 ${isFiltering ? 'animate-spin' : ''}`}
                        />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FilterControls;
