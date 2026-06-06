import React from 'react';
import * as Icon from 'lucide-react';
import clsx from 'clsx';
import ContentCard from './ContentCard';
import { useTranslation } from 'react-i18next';

const EMPTY_USERS = [];

const ProjectTeam = ({ assignedUsers = EMPTY_USERS }) => {
    const { t } = useTranslation();

    return (
        <ContentCard
            icon={<Icon.Users className="h-5 w-5" />}
            title={`${t('projects.details.teamTitle')} (${assignedUsers.length})`}
        >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {assignedUsers.map((user) => (
                    <div
                        key={user._id}
                        className="group relative flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/40"
                    >
                        <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />

                        <div
                            className={clsx(
                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white',
                                user.role === 'admin'
                                    ? 'bg-amber-500'
                                    : 'bg-primary',
                            )}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">
                                {user.username}
                            </p>
                            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                {user.role}
                            </p>
                        </div>
                    </div>
                ))}
                {assignedUsers.length === 0 && (
                    <div className="col-span-full py-10 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground/40">
                            <Icon.Users className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
                            {t('projects.details.noUsers')}
                        </p>
                    </div>
                )}
            </div>
        </ContentCard>
    );
};

export default ProjectTeam;
