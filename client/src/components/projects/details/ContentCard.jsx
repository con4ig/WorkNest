import React from 'react';

const ContentCard = ({ icon, title, children, actions }) => (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm sm:h-9 sm:w-9">
                    {icon}
                </div>
                <h2 className="truncate text-sm font-bold uppercase tracking-widest text-foreground/90 sm:text-xl sm:normal-case sm:tracking-tight">
                    {title}
                </h2>
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
        <div className="p-4 sm:p-6">{children}</div>
    </div>
);

export default ContentCard;
