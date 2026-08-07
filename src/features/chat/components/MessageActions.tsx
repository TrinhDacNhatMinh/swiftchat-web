import { useState, useRef, useEffect } from 'react';
import { Message } from '@/shared/types/models';
import { useMessageActions } from '@/features/chat/hooks/useMessageActions';
import { Modal } from '@/shared/components/common/Modal';
import { useDialog } from '@/contexts/DialogContext';
import { useTranslation } from 'react-i18next';

const QUICK_REACTIONS = ['❤️', '😆', '😲', '😢', '😡', '👍'];

interface MessageActionsProps {
  message: Message;
  conversationId: string;
  isMine: boolean;
  onReply: () => void;
  forceVisible?: boolean;   // long-press on mobile
  onDismiss?: () => void;   // callback để ẩn actions sau khi action được thực hiện
}

export function MessageActions({ message, conversationId, isMine, onReply, forceVisible, onDismiss }: MessageActionsProps) {
  const { t } = useTranslation();
  const { reactMessage, editMessage, unsendMessage, deleteForMe, pinMessage, unpinMessage } = useMessageActions();
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOption, setDeleteOption] = useState<'everyone' | 'me'>('everyone');
  const [editContent, setEditContent] = useState(message.content);
  const { confirm } = useDialog();
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (message.isUnsent) return null;

  const handleReact = (emoji: string) => {
    reactMessage({ conversationId, messageId: message.id, emoji });
    setShowEmojiPicker(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setShowMenu(false);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    editMessage({ conversationId, messageId: message.id, content: editContent.trim() });
    setIsEditing(false);
  };

  const handleUnsend = () => {
    unsendMessage({ conversationId, messageId: message.id });
    setShowMenu(false);
  };

  const handleDeleteForMe = () => {
    deleteForMe({ conversationId, messageId: message.id });
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handlePin = () => {
    if (message.isPinned) {
      unpinMessage({ conversationId, messageId: message.id });
    } else {
      pinMessage({ conversationId, messageId: message.id });
    }
    setShowMenu(false);
  };

  // Nếu đang edit mode, hiện inline editor
  if (isEditing) {
    return (
      <form onSubmit={submitEdit} className="w-full flex gap-2 mt-1">
        <input
          autoFocus
          className="flex-1 bg-surface-container rounded-xl px-3 py-1.5 text-sm text-on-surface border border-primary focus:outline-none"
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && setIsEditing(false)}
        />
        <button type="submit" className="px-3 py-1 text-xs bg-primary text-on-primary rounded-lg">Lưu</button>
        <button type="button" className="px-3 py-1 text-xs bg-surface-container text-on-surface rounded-lg" onClick={() => setIsEditing(false)}>Hủy</button>
      </form>
    );
  }

  return (
    <div
      ref={menuRef}
      className={`flex items-center gap-0.5 transition-opacity duration-150 ${isMine ? 'flex-row-reverse' : ''} ${
        forceVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {/* Quick emoji react */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(v => !v)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          aria-label={t('chat.react', 'Thả cảm xúc')}
          title={t('chat.react', 'Thả cảm xúc')}
        >
          <span className="material-symbols-outlined text-[16px]">add_reaction</span>
        </button>
        {showEmojiPicker && (
          <div className={`absolute bottom-full mb-1 bg-surface-container-highest border border-outline-variant rounded-2xl p-2 flex gap-1 z-50 ${isMine ? 'right-0' : 'left-0'}`}>
            {QUICK_REACTIONS.map(emoji => (
              <button
                key={emoji}
                className="text-xl w-8 h-8 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center"
                onClick={() => handleReact(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply */}
      <button
        onClick={() => { onReply(); onDismiss?.(); }}
        className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
        aria-label={t('chat.reply', 'Trả lời')}
        title={t('chat.reply', 'Trả lời')}
      >
        <span className="material-symbols-outlined text-[16px]">reply</span>
      </button>

      {/* More actions */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(v => !v)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          aria-label={t('chat.moreActions', 'Thêm hành động')}
          title={t('chat.moreActions', 'Thêm hành động')}
        >
          <span className="material-symbols-outlined text-[16px]">more_horiz</span>
        </button>

        {showMenu && (
          <div className={`absolute bottom-full mb-1 bg-surface-container-highest border border-outline-variant rounded-2xl py-1 w-44 z-50 ${isMine ? 'right-0' : 'left-0'}`}>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              {t('chat.copy')}
            </button>
            <button
              onClick={handlePin}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {message.isPinned ? 'keep_off' : 'push_pin'}
              </span>
              {message.isPinned ? t('chat.unpin') : t('chat.pin')}
            </button>
            {isMine ? (
              <>
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  {t('chat.edit')}
                </button>
                <div className="h-[1px] bg-outline-variant mx-3 my-1" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  {t('chat.delete', 'Xóa')}
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  if (await confirm({ title: t('chat.deleteForMeTitle'), message: t('chat.deleteForMeDesc'), confirmText: t('chat.delete'), cancelText: t('chat.cancel'), type: 'danger' })) {
                    handleDeleteForMe();
                  }
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                {t('chat.deleteForMeTitle')}
              </button>
            )}
          </div>
        )}
      </div>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title={t('chat.deleteModalTitle', 'Bạn muốn thu hồi tin nhắn này ở phía ai?')}
        maxWidth="max-w-[500px]"
      >
        <div className="flex flex-col p-4 gap-4">
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex items-center justify-center mt-1">
              <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors ${deleteOption === 'everyone' ? 'border-primary' : 'border-outline-variant group-hover:border-outline'}`}>
                {deleteOption === 'everyone' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-on-surface mb-1">{t('chat.unsendForEveryone', 'Thu hồi với mọi người')}</div>
              <div className="text-sm text-on-surface-variant leading-relaxed">
                {t('chat.unsendForEveryoneDesc', 'Tin nhắn này sẽ bị thu hồi với mọi người trong đoạn chat...')}
              </div>
            </div>
            <input 
              type="radio" 
              name="deleteOption" 
              className="hidden" 
              checked={deleteOption === 'everyone'}
              onChange={() => setDeleteOption('everyone')}
            />
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex items-center justify-center mt-1">
              <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors ${deleteOption === 'me' ? 'border-primary' : 'border-outline-variant group-hover:border-outline'}`}>
                {deleteOption === 'me' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-on-surface mb-1">{t('chat.deleteForYou', 'Thu hồi với bạn')}</div>
              <div className="text-sm text-on-surface-variant leading-relaxed">
                {t('chat.deleteForYouDesc', 'Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn...')}
              </div>
            </div>
            <input 
              type="radio" 
              name="deleteOption" 
              className="hidden" 
              checked={deleteOption === 'me'}
              onChange={() => setDeleteOption('me')}
            />
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-outline-variant/50 mt-2">
          <button 
            className="px-4 py-2 font-medium text-primary hover:bg-primary/10 rounded-full transition-colors"
            onClick={() => setShowDeleteModal(false)}
          >
            {t('chat.cancel', 'Hủy')}
          </button>
          <button 
            className="px-5 py-2 font-medium bg-primary text-on-primary hover:bg-primary/90 rounded-full transition-colors"
            onClick={() => {
              if (deleteOption === 'everyone') {
                handleUnsend();
              } else {
                handleDeleteForMe();
              }
              setShowDeleteModal(false);
            }}
          >
            {t('chat.remove', 'Gỡ')}
          </button>
        </div>
      </Modal>
    </div>
  );
};
