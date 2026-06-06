import React from 'react';

const ContentCard = ({ icon, title, children, actions }) => (
    <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between rounded-t-lg border-b border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                    {icon}
                </div>
                <h2 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {title}
                </h2>
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
        <div className="p-4 sm:p-6">{children}</div>
    </div>
);

export default ContentCard;
