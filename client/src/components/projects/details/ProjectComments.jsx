import React from 'react';
import * as Icon from 'lucide-react';
import ContentCard from './ContentCard';
import CommentItem from './CommentItem';
import { useTranslation } from 'react-i18next';

const EMPTY_COMMENTS = [];

const ProjectComments = ({
    comments = EMPTY_COMMENTS,
    newComment,
    setNewComment,
    handleAddComment,
    handleDeleteComment,
    handleReplyComment,
    currentUser,
    isAdmin,
}) => {
    const { t } = useTranslation();

    return (
        <ContentCard
            icon={<Icon.Message />}
            title={`${t('projects.details.commentsTitle')} (${comments.length})`}
        >
            <div className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === 'Enter' && handleAddComment()
                        }
                        aria-label={t('projects.details.addCommentPlaceholder')}
                        placeholder={t(
                            'projects.details.addCommentPlaceholder',
                        )}
                        className="flex-1 rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    />
                    <button
                        type="button"
                        onClick={handleAddComment}
                        className="flex-shrink-0 rounded-lg bg-primary p-3 text-primary-foreground hover:bg-primary/90 sm:p-2 sm:px-4"
                    >
                        <Icon.Send />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                        {t('projects.details.noComments')}
                    </p>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            onDelete={handleDeleteComment}
                            onReply={handleReplyComment}
                            currentUserId={currentUser?._id}
                            isAdmin={isAdmin}
                            t={t}
                        />
                    ))
                )}
            </div>
        </ContentCard>
    );
};

export default ProjectComments;
