import { useState } from 'react';
import { User as UserIcon, MessageCircle, Send, Trash2 } from 'lucide-react';
import type { VideoComment } from '../../types';
import { resolveFileUrl } from '../../config';

interface CommentItemProps {
  comment: VideoComment;
  onReply: (content: string, parentId: number) => void;
  onReact: (commentId: number, type: string) => void;
  onDelete?: (commentId: number) => void;
  isAdmin: boolean;
  canReply?: boolean;
  currentUserId?: number;
  isReply?: boolean;
}

// Reaction icons are used via the labels map for simplicity

const REACTION_LABELS: Record<string, string> = {
  Like: '👍',
  Heart: '❤️',
  Wow: '😮',
  Smile: '😊',
};

export default function CommentItem({ 
  comment, 
  onReply, 
  onReact, 
  onDelete, 
  isAdmin, 
  canReply = true,
  currentUserId,
  isReply = false 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(replyText.trim(), comment.id);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const getReactionCount = (type: string) => 
    comment.reactions.filter(r => r.type === type).length;

  const hasUserReacted = (type: string) => 
    comment.reactions.some(r => r.type === type && r.userId === currentUserId);

  return (
    <div className={`flex gap-4 p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:border-primary-100 dark:hover:border-primary-900/50 relative group/comment ${isReply ? 'ml-8 md:ml-12 border-l-4 border-l-primary-100' : ''}`}>
      <div className={`${isReply ? 'w-10 h-10' : 'w-12 h-12'} rounded-2xl overflow-hidden shrink-0 shadow-sm`}>
        {comment.student.profileImage ? (
          <img src={resolveFileUrl(comment.student.profileImage)} alt={comment.student.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <UserIcon size={isReply ? 20 : 24} />
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className={`font-bold ${isReply ? 'text-xs' : 'text-sm'} text-gray-900 dark:text-white uppercase tracking-wide`}>
              {comment.student.name}
              {comment.student.role === 'Admin' && <span className="mr-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">أدمن</span>}
              {comment.student.role === 'Teacher' && <span className="mr-2 text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">مدرس</span>}
            </h4>
            <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full font-medium">
              {new Date(comment.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}
            </span>
          </div>

          <div className="flex items-center gap-1">
             {isAdmin && onDelete && (
                <button
                  onClick={() => { if(window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) onDelete(comment.id); }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover/comment:opacity-100"
                  title="حذف التعليق"
                >
                  <Trash2 size={16} />
                </button>
              )}
          </div>
        </div>
        
        <p className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap`}>
          {comment.content}
        </p>

        {/* Action Bar */}
        <div className="flex items-center gap-4 mt-3">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-full border border-gray-100 dark:border-gray-800">
            {Object.keys(REACTION_LABELS).map((type) => {
              const count = getReactionCount(type);
              const active = hasUserReacted(type);
              return (
                <button
                  key={type}
                  onClick={() => onReact(comment.id, type)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:scale-110 ${active ? 'bg-white dark:bg-gray-700 shadow-sm' : 'grayscale hover:grayscale-0'}`}
                  title={type}
                >
                  <span className="text-sm">{REACTION_LABELS[type]}</span>
                  {count > 0 && <span className={`text-[10px] font-bold ${active ? 'text-primary-600' : 'text-gray-400'}`}>{count}</span>}
                </button>
              );
            })}
          </div>

          {canReply && !isReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors"
            >
              <MessageCircle size={14} /> رد
            </button>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-4 flex gap-3 animate-fade-in">
             <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  className="w-full input-field resize-none min-h-[60px] text-xs py-2 px-3 focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
                <div className="flex justify-end mt-2 gap-2">
                   <button onClick={() => setIsReplying(false)} className="text-xs text-gray-500 hover:underline px-3 py-1">إلغاء</button>
                   <button 
                     onClick={handleReplySubmit} 
                     disabled={!replyText.trim()}
                     className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                   >
                     رد <Send size={12} className="-rotate-45" />
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Nested Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 space-y-4">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                onReply={onReply} 
                onReact={onReact} 
                onDelete={onDelete}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
