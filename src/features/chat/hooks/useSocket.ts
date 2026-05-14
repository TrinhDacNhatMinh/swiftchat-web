import { useEffect } from 'react';
import { socketInstance } from '@/shared/lib/socket';
import { useAuthStore } from '@/stores/auth.store';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Kết nối socket khi user đã đăng nhập
      socketInstance.connect(token);

      // Định kỳ gửi heartbeat để giữ session Redis không bị timeout (như mô tả trong docs Backend)
      const heartbeatInterval = setInterval(() => {
        socketInstance.emit('chat:heartbeat');
      }, 30000); // 30s

      return () => {
        clearInterval(heartbeatInterval);
        // Có thể cân nhắc việc không disconnect ngay lập tức nếu user chỉ chuyển trang, 
        // nhưng nếu là hook global ở mức <App /> thì unmount nghĩa là đóng tab.
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  return { socket: socketInstance };
};
