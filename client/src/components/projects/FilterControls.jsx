import React, { useState, useEffect, useRef } from 'react';
import { Search, ListFilter, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FilterControls = ({
    onFilterChange,
    onRefresh,
    isFiltering,
    screenSize,
    filters,
}) => {
    const { t } = useTranslation();
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
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                    type="text"
                    placeholder={t('projects.filter.searchPlaceholder')}
                    className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-11 pr-4 text-base shadow-sm ring-offset-background transition-all text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 md:w-80 md:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <ListFilter className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <select
                        className="w-full appearance-none rounded-xl border border-input bg-background/50 py-2.5 pl-11 pr-10 text-base shadow-sm ring-offset-background transition-all text-foreground hover:border-primary/50 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 md:text-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">
                            {t('projects.filter.allStatuses')}
                        </option>
                        <option value="pending">
                            {t('common.projectStatus.pending')}
                        </option>
                        <option value="running">
                            {t('common.projectStatus.running')}
                        </option>
                        <option value="completed">
                            {t('common.projectStatus.completed')}
                        </option>
                        <option value="on-hold">
                            {t('common.projectStatus.on-hold')}
                        </option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <ListFilter className="h-4 w-4 opacity-50" />
                    </div>
                </div>
                {screenSize !== 'mobile' && (
                    <button
                        onClick={onRefresh}
                        className="group flex items-center justify-center rounded-xl border border-border bg-card p-2.5 text-muted-foreground shadow-sm ring-offset-background transition-all hover:border-primary/50 hover:bg-secondary hover:text-primary active:scale-95 active:shadow-inner"
                        title={t('projects.filter.refresh')}
                    >
                        <RefreshCcw
                            className={`h-5 w-5 transition-transform group-hover:rotate-180 ${isFiltering ? 'animate-spin' : ''}`}
                        />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FilterControls;
