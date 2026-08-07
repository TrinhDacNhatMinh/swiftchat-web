import { axiosInstance } from '@/shared/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import { Message } from '@/shared/types/models';

export const messageApi = {
  // Lấy lịch sử tin nhắn (cursor pagination)
  getHistory: async (conversationId: string, params: { cursor?: string; limit?: number }) => {
    const response = await axiosInstance.get<PaginatedResponse<Message>>(
      `/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  // Tìm kiếm tin nhắn
  search: async (params: { q: string; conversationId?: string; cursor?: string; limit?: number }) => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Message>>>(
      '/messages/search',
      { params }
    );
    return response.data;
  },
};
