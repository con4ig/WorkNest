import React from 'react';
import * as Icon from 'lucide-react';
import ContentCard from './ContentCard';
import { formatDistanceToNow } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const getActivityDescription = (activity, t) => {
    if (!activity.action) return activity.description;

    const { action, metadata } = activity;
    const translateStatus = (status) =>
        t(`common.taskStatus.${status}`) || status;

    switch (action) {
        case 'task_created':
        case 'task_completed':
        case 'task_deleted':
            return t(`projects.details.activities.${action}`, {
                title: metadata?.title || '...',
            });
        case 'task_updated':
            return t('projects.details.activities.task_updated', {
                title: metadata?.title || '...',
                oldStatus: translateStatus(metadata?.oldStatus),
                newStatus: translateStatus(metadata?.newStatus),
            });
        case 'comment_added':
        case 'comment_replied':
        case 'comment_deleted':
            return t(`projects.details.activities.${action}`);
        default:
            return activity.description;
    }
};

const EMPTY_ACTIVITIES = [];

const ProjectActivities = ({
    activities = EMPTY_ACTIVITIES,
    showActivities,
    setShowActivities,
}) => {
    const { t, i18n } = useTranslation();

    return (
        <ContentCard
            icon={<Icon.Activity />}
            title={`${t('projects.details.activityTitle')} (${activities.length})`}
            actions={
                <button
                    type="button"
                    onClick={() => setShowActivities(!showActivities)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                    {showActivities
                        ? t('projects.details.hide')
                        : t('projects.details.show')}
                    {showActivities ? (
                        <Icon.ChevronDown />
                    ) : (
                        <Icon.ChevronRight />
                    )}
                </button>
            }
        >
            {showActivities && (
                <div className="divide-y divide-border/20">
                    {activities.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground/30">
                                <Icon.Activity className="h-8 w-8" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
                                {t('projects.details.noActivity')}
                            </p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div
                                key={activity._id}
                                className="group relative flex items-start gap-3 p-3 transition-colors hover:bg-muted/30 sm:gap-4 sm:p-5"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                    <span className="text-sm font-black">
                                        {activity.user?.username
                                            ?.charAt(0)
                                            ?.toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm font-bold text-foreground">
                                            {activity.user?.username ||
                                                'System'}
                                        </p>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                            {formatDistanceToNow(
                                                new Date(activity.createdAt),
                                                {
                                                    addSuffix: true,
                                                    locale:
                                                        i18n.language === 'pl'
                                                            ? pl
                                                            : enUS,
                                                },
                                            )}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {getActivityDescription(activity, t)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </ContentCard>
    );
};

export default ProjectActivities;
