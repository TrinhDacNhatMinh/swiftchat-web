import { axiosInstance } from '@/shared/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import { FriendRequest } from '@/shared/types/models';

export interface FriendProfile {
  id: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
  isEmailVerified?: boolean;
}

export interface FriendRequestWithProfiles extends FriendRequest {
  sender: FriendProfile;
  receiver: FriendProfile;
}

export const friendApi = {
  // Lấy danh sách bạn bè
  getFriends: async (params?: { limit?: number; offset?: number }) => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<FriendProfile>>>(
      '/friends',
      { params }
    );
    return response.data;
  },

  // Hủy kết bạn
  unfriend: async (userId: string) => {
    const response = await axiosInstance.delete<ApiResponse<{ success: boolean }>>(
      `/friends/${userId}`
    );
    return response.data;
  },

  // Gửi lời mời kết bạn
  sendRequest: async (receiverId: string) => {
    const response = await axiosInstance.post<ApiResponse<FriendRequestWithProfiles>>(
      '/friend-requests',
      { receiverId }
    );
    return response.data;
  },

  // Lấy danh sách lời mời đang chờ (đã nhận được)
  getPendingRequests: async () => {
    const response = await axiosInstance.get<ApiResponse<FriendRequestWithProfiles[]>>(
      '/friend-requests'
    );
    return response.data;
  },

  // Chấp nhận hoặc từ chối lời mời
  respondRequest: async (id: string, action: 'accepted' | 'rejected') => {
    const response = await axiosInstance.patch<ApiResponse<{ success: boolean }>>(
      `/friend-requests/${id}`,
      { action }
    );
    return response.data;
  },

  // Hủy lời mời kết bạn đã gửi
  cancelRequest: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<{ success: boolean }>>(
      `/friend-requests/${id}`
    );
    return response.data;
  },
};
