import { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSendMessage } from '@/features/chat/hooks/useSendMessage';
import { socketInstance } from '@/shared/lib/socket';
import { uploadApi } from '@/shared/services/uploadApi';
import { useToast } from '@/contexts/ToastContext';
import { Message } from '@/shared/types/models';

interface MessageInputProps {
  conversationId: string;
  replyTo?: Pick<Message, 'id' | 'content' | 'senderId'> | null;
  onCancelReply?: () => void;
}

export function MessageInput({ conversationId, replyTo, onCancelReply }: MessageInputProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<string>('text');
  const { mutate: sendMessage, isPending } = useSendMessage();
  const typingTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !pendingAttachment) || isPending || uploadingFile) return;

    sendMessage({
      conversationId,
      content: content.trim() || '',
      type: pendingAttachment ? attachmentType : 'text',
      clientTempId: `temp_${Date.now()}`,
      ...(pendingAttachment ? { attachments: [pendingAttachment] } : {}),
      ...(replyTo ? { replyToMessageId: replyTo.id } : {}),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketInstance.emit('chat:stop_typing', { conversationId });

    setContent('');
    setPendingAttachment(null);
    setAttachmentType('text');
    setPreviewUrl(null);
    setPreviewFile(null);
    onCancelReply?.();
    // Restore focus so user can continue typing immediately after sending
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    // Chỉ emit khi chưa emit gần đây (debounce pattern) - tránh spam socket mỗi keystroke
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketInstance.emit('chat:typing', { conversationId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketInstance.emit('chat:stop_typing', { conversationId });
    }, 2000);
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPreviewFile(file);
    setUploadingFile(true);
    
    // Determine type
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';

    try {
      const res: any = await uploadApi.uploadImage(file);
      // Backend returns { url, publicId, ... } directly (no data wrapper)
      const url = res?.url || res?.data?.url;
      if (url) {
        setPendingAttachment(url);
        setAttachmentType(type);
      } else {
        console.error('[Upload] Could not extract URL from response:', res);
        toast({ message: t('chat.uploadFailed', 'Tải file thất bại. Vui lòng thử lại.'), type: 'error' });
        setPreviewUrl(null);
        setPreviewFile(null);
        setPendingAttachment(null);
        setAttachmentType('text');
      }
    } catch (err) {
      console.error('[Upload] Error uploading file:', err);
      toast({ message: t('chat.uploadFailed', 'Tải file thất bại. Vui lòng thử lại.'), type: 'error' });
      setPreviewUrl(null);
      setPreviewFile(null);
      setPendingAttachment(null);
      setAttachmentType('text');
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const removeAttachment = () => {
    setPreviewUrl(null);
    setPreviewFile(null);
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSend = (content.trim() || pendingAttachment) && !uploadingFile;

  return (
    <div className="border-t border-outline-variant/30 bg-surface/90 backdrop-blur-xl z-10 w-full">
      {/* Reply preview banner */}
      {replyTo && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-0">
          <div className="flex-1 border-l-4 border-primary pl-3 py-1 bg-surface-container rounded-r-xl shadow-sm">
            <p className="text-[11px] text-primary font-bold mb-0.5">Trả lời</p>
            <p className="text-[13px] text-on-surface-variant truncate">{replyTo.content || t('chat.attachment', '📎 Tệp đính kèm')}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
      {/* Attachment + Form */}
      <div className="px-6 pt-3 pb-4">
      {/* Attachment preview */}
      {previewFile && (
        <div className="relative inline-block mb-3 ml-1">
          {previewFile.type.startsWith('image/') ? (
            <img
              alt="attachment preview"
              className="h-20 w-20 object-cover rounded-2xl border border-outline-variant/50 shadow-sm"
              src={previewUrl!}
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl border border-outline-variant/50 bg-surface-container flex flex-col items-center justify-center p-1 shadow-sm">
              <span className="material-symbols-outlined text-[32px] opacity-70">insert_drive_file</span>
              <span className="text-[10px] truncate w-full text-center opacity-70 px-1">{previewFile.name}</span>
            </div>
          )}
          {uploadingFile && (
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px] animate-spin">progress_activity</span>
            </div>
          )}
          {!uploadingFile && (
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center shadow-md border-2 border-surface"
              onClick={removeAttachment}
            >
              <span className="material-symbols-outlined text-[12px]">close</span>
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 w-full">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          accept="image/*,video/*,.pdf,.doc,.docx"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
          type="file"
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
        </button>

        {/* Input Field */}
        <div className="flex-1 relative group w-full">
          <input
            ref={inputRef}
            value={content}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            className="w-full bg-surface-container border border-outline-variant/50 rounded-full py-2.5 px-5 pr-12 text-on-surface text-[15px] focus:outline-none focus:border-primary focus:bg-surface transition-all placeholder:text-on-surface-variant shadow-sm"
            placeholder={replyTo ? t('chat.replyPlaceholder', 'Nhập tin nhắn trả lời...') : t('chat.messagePlaceholder', 'Message...')}
            type="text"
            disabled={isPending}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <button type="button" className="w-8 h-8 rounded-full hover:bg-surface-bright flex items-center justify-center text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">mood</span>
            </button>
          </div>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend || isPending}
          className="w-10 h-10 rounded-full bg-on-surface text-surface flex items-center justify-center hover:opacity-80 active:scale-95 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px] fill">send</span>
        </button>
      </form>
      </div>
    </div>
  );
};
