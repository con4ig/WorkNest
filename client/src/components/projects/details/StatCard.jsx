import React from 'react';

const StatCard = ({ icon, title, children }) => (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 shadow-sm transition-all hover:border-primary/20 hover:bg-muted/50 hover:shadow-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                {title}
            </h3>
            <div className="mt-0.5 text-lg font-bold tracking-tight text-foreground">
                {children}
            </div>
        </div>
    </div>
);

export default StatCard;
