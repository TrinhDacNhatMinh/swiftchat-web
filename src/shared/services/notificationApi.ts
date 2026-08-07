import { axiosInstance } from '@/shared/lib/axios';
import { ApiResponse } from '@/shared/types/api';
import { Notification } from '@/shared/types/models';

export const notificationApi = {
  // Lấy danh sách thông báo
  getNotifications: async (params?: { limit?: number }) => {
    const response = await axiosInstance.get<ApiResponse<Notification[]>>(
      '/notifications',
      { params }
    );
    return response.data;
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async () => {
    const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data;
  },

  // Đánh dấu đã đọc tất cả
  markAllAsRead: async () => {
    const response = await axiosInstance.patch<ApiResponse<{ count: number }>>(
      '/notifications/read-all'
    );
    return response.data;
  },

  // Đánh dấu đã đọc 1 thông báo
  markAsRead: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse<{ success: boolean }>>(
      `/notifications/${id}/read`
    );
    return response.data;
  },
};
