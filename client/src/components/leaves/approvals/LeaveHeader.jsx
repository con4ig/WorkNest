import React from 'react';
import { ArrowLeft, List, Calendar, Search } from 'lucide-react';
import { Button } from '../../ui/Button';

const LeaveHeader = ({
    filter,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    navigate,
    t,
}) => {
    return (
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
            <div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/dashboard')}
                        className="mr-2 md:hidden"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        {t('leaves.approvals.title')}
                    </h1>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t('leaves.approvals.subtitle')}
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                {/* View Toggle */}
                {filter !== 'rejected' && (
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`rounded-md p-1.5 transition-all ${
                                viewMode === 'list'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('calendar')}
                            className={`rounded-md p-1.5 transition-all ${
                                viewMode === 'calendar'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title="Calendar View"
                        >
                            <Calendar className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="relative w-full sm:w-auto">
                    <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[250px]"
                        placeholder={t('leaves.approvals.searchPlaceholder')}
                        aria-label={t('leaves.approvals.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveHeader;
