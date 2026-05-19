import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFriendRequests } from '@/features/friends/hooks/useFriendRequests';
import { FriendRequestList } from '@/features/friends/components/FriendRequestList';
import { FriendList } from '@/features/friends/components/FriendList';
import { UserSearchResults } from '@/features/friends/components/UserSearchResults';
import { useAuthStore } from '@/stores/auth.store';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface PeoplePanelProps {
  onStartChat: (conversationId: string) => void;
}

export function PeoplePanel({ onStartChat }: PeoplePanelProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [requestTab, setRequestTab] = useState<'received' | 'sent'>('received');
  const { user: me } = useAuthStore();
  const { data: requests } = useFriendRequests();
  const receivedRequests = requests?.filter(req => req.receiverId === me?.id) || [];
  const pendingCount = receivedRequests.length;
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSearching = debouncedSearchQuery.trim().length >= 2;

  return (
    <aside className="fixed left-[72px] top-0 h-screen w-[360px] bg-surface-container-low border-r border-outline-variant flex flex-col z-40">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <h2 className="text-[22px] font-bold text-on-surface tracking-tight mb-4">{t('nav.people', 'People')}</h2>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('chat.search', 'Tìm kiếm...')}
            className="w-full bg-surface-container rounded-full pl-9 pr-9 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-outline-variant transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden px-2 pb-4">
        {isSearching ? (
          /* Search Results mode */
          <div className="flex flex-col h-full overflow-hidden">
            <p className="px-4 py-2 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest shrink-0">
              {t('chat.searchResults', 'Kết quả tìm kiếm')}
            </p>
            <div className="flex-1 overflow-y-auto">
              <UserSearchResults query={debouncedSearchQuery} onStartChat={onStartChat} />
            </div>
          </div>
        ) : (
          /* Normal mode: Requests + Friends */
          <>
            {/* Tabs — Threads underline style (monochrome) */}
            <div className="flex px-4 mt-2 mb-4 border-b border-outline-variant/30 shrink-0">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                  activeTab === 'friends'
                    ? 'text-on-surface'
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                {activeTab === 'friends' && <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-on-surface rounded-full" />}
                {t('friends.friends', 'Bạn bè')}
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors relative flex items-center justify-center gap-2 ${
                  activeTab === 'requests'
                    ? 'text-on-surface'
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                {activeTab === 'requests' && <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-on-surface rounded-full" />}
                {t('friends.requests', 'Lời mời')}
                {pendingCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center leading-none">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'friends' ? (
                <FriendList onStartChat={onStartChat} />
              ) : (
                <div className="flex flex-col">
                  <div className="flex px-4 mb-3 gap-2 shrink-0">
                    <button
                      onClick={() => setRequestTab('received')}
                      className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-colors ${
                        requestTab === 'received'
                          ? 'bg-on-surface text-surface'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t('friends.received', 'Đã nhận')} {pendingCount > 0 && `(${pendingCount})`}
                    </button>
                    <button
                      onClick={() => setRequestTab('sent')}
                      className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-colors ${
                        requestTab === 'sent'
                          ? 'bg-on-surface text-surface'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t('friends.sent', 'Đã gửi')}
                    </button>
                  </div>
                  <FriendRequestList type={requestTab} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
