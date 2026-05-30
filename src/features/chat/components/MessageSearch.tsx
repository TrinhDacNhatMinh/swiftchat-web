import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageApi } from '@/shared/services/messageApi';

import { Message } from '@/shared/types/models';
import { useAuthStore } from '@/stores/auth.store';
import { useTranslation } from 'react-i18next';

interface MessageSearchProps {
  conversationId: string;
  senderMap: Map<string, { name: string; avatarUrl?: string }>;
  onClose: () => void;
  onSelectMessage: (messageId: string) => void;
}

export function MessageSearch({ conversationId, senderMap, onClose, onSelectMessage }: MessageSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['messages', 'search', conversationId, submittedQuery],
    queryFn: () => messageApi.search({ q: submittedQuery, conversationId, limit: 20 }),
    enabled: submittedQuery.trim().length > 0,
  });

  const results: Message[] = Array.isArray(data) 
    ? data 
    : ((data as any)?.data?.items || (data as any)?.data || []);

  return (
    <aside className="w-[320px] h-full bg-surface border-l border-outline-variant flex flex-col shrink-0 absolute right-0 top-0 z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.05)] transition-transform">
      {/* Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-outline-variant shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h3 className="font-headline-sm font-semibold text-on-surface flex-1">{t('chat.searchMessages', 'Tìm kiếm tin nhắn')}</h3>
      </div>

      <div className="p-4 border-b border-outline-variant shrink-0">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
          <input
            autoFocus
            className="w-full bg-surface-container rounded-xl pl-10 pr-10 py-2.5 text-sm text-on-surface border border-outline-variant focus:outline-none focus:border-primary transition-colors"
            placeholder={t('chat.searchKeyword', 'Nhập từ khóa...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSubmittedQuery(searchTerm);
              }
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSubmittedQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!submittedQuery ? (
          <div className="p-8 text-center text-on-surface-variant flex flex-col items-center gap-3 opacity-60">
            <span className="material-symbols-outlined text-[48px]">search</span>
            <p className="text-sm">{t('chat.searchMessagesDesc', 'Nhập từ khóa để tìm kiếm tin nhắn trong đoạn chat này.')}</p>
          </div>
        ) : isLoading ? (
          <div className="p-4 text-center text-on-surface-variant text-sm">{t('common.searching', 'Đang tìm kiếm...')}</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-on-surface-variant text-sm">{t('chat.noSearchResults', 'Không tìm thấy kết quả nào cho "{{keyword}}"', { keyword: submittedQuery })}</div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {results.map((msg) => {
              const isMine = msg.senderId === user?.id;
              const date = new Date(msg.createdAt || '').toLocaleString('vi-VN', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              const senderInfo = senderMap.get(msg.senderId);
              const displayName = isMine ? t('common.you', 'Bạn') : senderInfo?.name || t('chat.otherPerson', 'Người khác');
              const avatar = isMine ? user?.avatarUrl : senderInfo?.avatarUrl;

              return (
                <button
                  key={msg.id}
                  onClick={() => onSelectMessage(msg.id)}
                  className="w-full text-left p-4 hover:bg-surface-container-high transition-colors focus:bg-surface-container-highest focus:outline-none flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 overflow-hidden flex items-center justify-center text-on-surface-variant font-medium text-xs">
                    {avatar ? (
                      <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-on-surface truncate pr-2">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/70 flex-shrink-0">{date}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
