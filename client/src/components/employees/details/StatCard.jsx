import React from 'react';

const StatCard = ({ icon, title, children }) => (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:bg-muted/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {title}
            </h3>
            <div className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                {children}
            </div>
        </div>
    </div>
);

export default StatCard;
