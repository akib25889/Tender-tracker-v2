import React, { useState } from 'react';
import { useTenders } from '../../context/TenderContext';
import { Tender } from '../../types/tender';
import { MessageSquare, Send, Trash2, Shield, Smile } from 'lucide-react';
import { Card } from './Card';

const QUICK_REPLIES = [
  'Acknowledged, I will review this.',
  'Thanks, I will follow up shortly.',
  'This is blocked pending additional information.',
  'Approved from my side.',
];

const QUICK_EMOJIS = ['👍', '✅', '🎯', '🙌', '⚠️', '💬'];

interface TenderCommentsSectionProps {
  tender: Tender;
}

export const TenderCommentsSection: React.FC<TenderCommentsSectionProps> = ({
  tender,
}) => {
  const { addComment, deleteComment, currentUser } = useTenders();
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const comments = tender.comments || [];

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(tender.id, commentText.trim());
    setCommentText('');
  };

  const insertIntoDraft = (value: string) => {
    setCommentText((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${value}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'BUSINESS_HEAD':
        return 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]';
      case 'EXECUTIVE_MANAGER':
        return 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]';
      case 'SENIOR_MANAGER':
        return 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]';
      case 'TENDER_ANALYST':
        return 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]';
      default:
        return 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-strong)]';
    }
  };

  return (
    <Card
      title={`Team Discussion & Remarks (${comments.length})`}
      subtitle="Cross-departmental commentary, blocker alerts, and tender debrief remarks"
      headerAction={
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Real-Time Thread</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Comment Input Box */}
        <form onSubmit={handlePost} className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pl-9">
            <span className="shrink-0 font-semibold text-[var(--text-secondary)]">Quick reply:</span>
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => insertIntoDraft(reply)}
                className="shrink-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-subtle)] px-2 py-1 text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              >
                {reply}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--accent-on)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="flex-1">
              <div className="relative">
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Leave a comment as ${currentUser.name} (${currentUser.role.replace('_', ' ')})...`}
                  className="w-full p-2.5 pr-10 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  className="absolute bottom-2 right-2 rounded-md p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--accent)]"
                  title="Add emoji"
                  aria-label="Add emoji"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-10 right-0 z-20 flex gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 shadow-lg">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          insertIntoDraft(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="rounded-md p-1 text-base transition-colors hover:bg-[var(--accent-soft)]"
                        title={`Add ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pl-9">
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
              <Shield className="w-3 h-3 text-[var(--accent)]" />
              <span>
                Posting as{' '}
                <strong className="text-[var(--text-primary)]">{currentUser.name}</strong>
              </span>
            </div>
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)] disabled:opacity-40 text-[var(--accent-on)] rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>

        {/* Comment Thread List */}
        {comments.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
            No comments yet. Start the team discussion above!
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)] pt-2 space-y-3">
            {comments.map((comment) => {
              const canDelete = true;

              return (
                <div key={comment.id} className="pt-3 first:pt-0 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-hover)] text-[var(--accent-on)] flex items-center justify-center text-[10px] font-bold">
                        {comment.authorAvatar || 'U'}
                      </div>
                      <span className="font-semibold text-xs text-[var(--text-primary)]">
                        {comment.authorName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getRoleBadge(
 comment.authorRole
                        )}`}
                      >
                        {comment.authorRole.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteComment(tender.id, comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--crit)] p-1 transition-all"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 pl-8 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

