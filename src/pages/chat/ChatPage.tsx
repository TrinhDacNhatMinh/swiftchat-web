import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavRail } from '@/shared/components/common/NavRail';
import { ConversationList } from '@/features/chat/components/ConversationList';
import { MessageThread } from '@/features/chat/components/MessageThread';
import { PeoplePanel } from '@/features/friends/components/PeoplePanel';
import { NotificationsPanel } from '@/features/notifications/components/NotificationsPanel';
import { ErrorBoundary } from '@/shared/components/common/ErrorBoundary';
import { GlobalSearch } from '@/shared/components/common/GlobalSearch';
import { useSocket } from '@/features/chat/hooks/useSocket';
import { usePresenceInit } from '@/features/chat/hooks/usePresenceInit';
import { usePresenceStream } from '@/features/chat/hooks/usePresenceStream';
import { useFriendStream } from '@/features/friends/hooks/useFriendStream';
import { useNotificationStream } from '@/features/notifications/hooks/useNotificationStream';
import { ProfilePanel } from '@/features/profile/components/ProfilePanel';

type NavTab = 'chats' | 'people' | 'notifications';

export function ChatPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Kích hoạt kết nối Socket khi vào Chat Page
  useSocket();
  // Seed presence store ngay khi vào app (bất kể tab nào)
  usePresenceInit();
  // Lắng nghe sự kiện online/offline realtime (bất kể có cuộc trò chuyện nào đang mở không)
  usePresenceStream();
  // Lắng nghe sự thay đổi của danh sách bạn bè/lời mời kết bạn
  useFriendStream();
  // Lắng nghe notification mới (toast + badge)
  useNotificationStream();

  // Khi click Message từ FriendList → chuyển sang tab chats + mở conversation
  const handleStartChat = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setActiveTab('chats');
  };

  return (
    <div className="bg-background text-on-surface h-screen w-screen overflow-hidden flex font-body-md text-body-md">
      {/* 1. Thanh Menu hẹp ngoài cùng bên trái */}
      <NavRail activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Panel bên trái — thay đổi theo tab */}
      {activeTab === 'chats' && (
        <ErrorBoundary name="ConversationList">
          <ConversationList
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'people' && (
        <ErrorBoundary name="PeoplePanel">
          <PeoplePanel onStartChat={handleStartChat} />
        </ErrorBoundary>
      )}

      {activeTab === 'notifications' && (
        <ErrorBoundary name="NotificationsPanel">
          <NotificationsPanel 
            onOpenConversation={handleStartChat}
            onSwitchTab={setActiveTab}
          />
        </ErrorBoundary>
      )}

      {/* 3. Khung màn hình Chat chiếm phần còn lại */}
      <ErrorBoundary name="MessageThread">
        <MessageThread conversationId={activeConversationId} />
      </ErrorBoundary>

      {/* Render Profile Panel directly based on global store state */}
      <ProfilePanel onStartChat={handleStartChat} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-secondary text-on-secondary px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-5 duration-300">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={isGlobalSearchOpen} 
        onClose={() => setIsGlobalSearchOpen(false)} 
        onStartChat={handleStartChat} 
      />
    </div>
  );
};
