import React, { useState } from 'react';
import * as Icon from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import i18n from '../../../i18n';

const CommentItem = ({
    comment,
    onDelete,
    onReply,
    currentUserId,
    isAdmin,
    t,
}) => {
    const [showReplies, setShowReplies] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const canDelete = comment.author._id === currentUserId || isAdmin;

    const handleReply = async () => {
        if (!replyText.trim()) return;
        await onReply(comment._id, replyText);
        setReplyText('');
        setIsReplying(false);
        setShowReplies(true);
    };

    return (
        <div className="relative border-l-2 border-border pb-6 pl-6">
            <div className="absolute left-[-5px] top-2 h-2.5 w-2.5 rounded-full border border-border bg-muted-foreground" />

            <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted font-semibold text-muted-foreground">
                    {comment.author.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:bg-muted/30">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">
                                    {comment.author.username}
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                    {formatDistanceToNow(
                                        new Date(comment.createdAt),
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
                            {canDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(comment._id)}
                                    className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95 sm:h-8 sm:w-8"
                                >
                                    <Icon.Trash className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                            {comment.content}
                        </p>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline"
                        >
                            {t('projects.details.reply')}
                        </button>
                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowReplies(!showReplies)}
                                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            >
                                {showReplies ? (
                                    <Icon.ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                    <Icon.ChevronRight className="h-3.5 w-3.5" />
                                )}
                                {comment.replies.length}{' '}
                                {t('projects.details.replies', {
                                    count: comment.replies.length,
                                })}
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                aria-label={t(
                                    'projects.details.replyPlaceholder',
                                )}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleReply()
                                }
                                placeholder={t(
                                    'projects.details.replyPlaceholder',
                                )}
                                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                            />{' '}
                            <button
                                type="button"
                                onClick={handleReply}
                                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                            >
                                <Icon.Send />
                            </button>
                        </div>
                    )}

                    {showReplies &&
                        comment.replies &&
                        comment.replies.length > 0 && (
                            <div className="mt-3 space-y-3">
                                {comment.replies.map((reply) => (
                                    <div key={reply._id} className="flex gap-2">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                                            {reply.author.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="rounded-lg border border-border bg-card p-2">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {reply.author.username}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                reply.createdAt,
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                                locale:
                                                                    i18n.language ===
                                                                    'pl'
                                                                        ? pl
                                                                        : enUS,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/80">
                                                    {reply.content}
                                                </p>
                                            </div>{' '}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
