import { axiosInstance } from '@/shared/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import { Conversation, User } from '@/shared/types/models';

export interface CreateConversationDto {
  type: 'direct' | 'group';
  partnerId?: string; // For direct chat
  userIds?: string[]; // For group chat
  title?: string;
  avatarUrl?: string;
}

export interface UpdateGroupDto {
  title?: string;
  avatarUrl?: string;
}

export const conversationApi = {
  getList: async (params: { limit?: number; offset?: number; q?: string }) => {
    const response = await axiosInstance.get<PaginatedResponse<Conversation>>('/conversations', { params });
    return response.data;
  },

  create: async (dto: CreateConversationDto) => {
    const response = await axiosInstance.post<ApiResponse<Conversation>>('/conversations', dto);
    return response.data;
  },

  updateGroup: async (id: string, dto: UpdateGroupDto) => {
    const response = await axiosInstance.patch<ApiResponse<Conversation>>(`/conversations/${id}`, dto);
    return response.data;
  },

  deleteConversation: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/conversations/${id}`);
    return response.data;
  },

  getMembers: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<{ user: User; role: string }[]>>(`/conversations/${id}/members`);
    return response.data;
  },

  addMembers: async (id: string, userIds: string[]) => {
    const response = await axiosInstance.post<ApiResponse<null>>(`/conversations/${id}/members`, { userIds });
    return response.data;
  },

  /**
   * Removes or kicks a member. Pass 'me' to leave the group.
   */
  removeMember: async (id: string, targetUserId: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/conversations/${id}/members/${targetUserId}`);
    return response.data;
  },

  updateRole: async (id: string, targetUserId: string, role: 'deputy' | 'member') => {
    const response = await axiosInstance.patch<ApiResponse<null>>(`/conversations/${id}/members/${targetUserId}/role`, { role });
    return response.data;
  },

  transferLeadership: async (id: string, newLeaderId: string) => {
    const response = await axiosInstance.patch<ApiResponse<null>>(`/conversations/${id}/transfer-leadership`, { newLeaderId });
    return response.data;
  },

  muteConversation: async (id: string, duration: '1h' | '8h' | '24h' | 'forever' = 'forever') => {
    const response = await axiosInstance.post<ApiResponse<null>>(`/conversations/${id}/mute`, { duration });
    return response.data;
  },

  unmuteConversation: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/conversations/${id}/mute`);
    return response.data;
  },

  getReadReceipts: async (id: string) => {
    const response = await axiosInstance.get<any[]>(`/conversations/${id}/read-receipts`);
    return response.data;
  },
};
