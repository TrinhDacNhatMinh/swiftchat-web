import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userApi } from '@/shared/services/userApi';
import { messageApi } from '@/shared/services/messageApi';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { useProfilePanelStore } from '@/stores/profilePanel.store';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (conversationId: string) => void;
}

export function GlobalSearch({ isOpen, onClose, onStartChat }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'messages'>('users');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { t } = useTranslation();
  const { openProfile } = useProfilePanelStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key inside the component if needed (though ChatPage might handle it)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Queries
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['searchUsers', debouncedQuery],
    queryFn: () => userApi.searchUsers(debouncedQuery, 'all'),
    enabled: isOpen && activeTab === 'users' && debouncedQuery.length > 0,
  });

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['searchMessages', debouncedQuery],
    queryFn: () => messageApi.search({ q: debouncedQuery, limit: 20 }),
    enabled: isOpen && activeTab === 'messages' && debouncedQuery.length > 0,
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-scrim/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div 
        className="relative bg-surface-container-low w-full max-w-2xl rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[80vh] border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-6 py-4 border-b border-outline-variant/50 gap-4">
          <span className="material-symbols-outlined text-primary text-[28px]">search</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-xl font-body-lg text-on-surface placeholder-on-surface-variant/50"
            placeholder={t('common.search', 'Search users, messages...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="text-[12px] font-medium bg-surface-variant text-on-surface-variant px-2 py-1 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-2 border-b border-outline-variant/50 gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'users' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Users
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'messages' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Messages
            {activeTab === 'messages' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {debouncedQuery.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant/50 py-20">
              <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">keyboard</span>
              <p>Type something to start searching</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <>
                  {isLoadingUsers ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : usersData?.data?.length ? (
                    <div className="space-y-1">
                      {usersData.data.filter((u: any) => !!u?.handle).map((user: any) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-4 p-3 hover:bg-surface-variant/50 rounded-xl cursor-pointer transition-colors"
                          onClick={() => {
                            onClose();
                            openProfile(user.handle);
                          }}
                        >
                          <UserAvatar user={{ avatarUrl: user.avatarUrl, displayName: user.displayName || user.handle }} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-on-surface truncate">{user.displayName || user.handle}</div>
                            <div className="text-sm text-on-surface-variant truncate">@{user.handle}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-on-surface-variant">No users found for "{debouncedQuery}"</div>
                  )}
                </>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <>
                  {isLoadingMessages ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messagesData?.data?.data?.length ? (
                    <div className="space-y-1">
                      {messagesData.data.data.map((msg: any) => (
                        <div
                          key={msg.id}
                          className="flex flex-col p-3 hover:bg-surface-variant/50 rounded-xl cursor-pointer transition-colors"
                          onClick={() => {
                            onClose();
                            onStartChat(msg.conversationId);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                            <span className="text-xs font-medium text-on-surface-variant truncate flex-1">
                              {/* Có thể hiển thị tên người gửi nếu có, backend message search cần trả về sender info */}
                              Conversation
                            </span>
                            <span className="text-[10px] text-on-surface-variant">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-on-surface line-clamp-2">
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-on-surface-variant">No messages found for "{debouncedQuery}"</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
