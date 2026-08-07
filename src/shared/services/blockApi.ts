import { axiosInstance } from '@/shared/lib/axios';

export interface BlockedUser {
  id: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  blockedAt: string;
}

export interface BlockStatus {
  isBlocker: boolean;
  isBlocked: boolean;
}

export const blockApi = {
  /**
   * Chặn một người dùng
   */
  blockUser: async (targetUserId: string) => {
    const response = await axiosInstance.post(`/block/${targetUserId}`);
    return response.data;
  },

  /**
   * Bỏ chặn một người dùng
   */
  unblockUser: async (targetUserId: string) => {
    const response = await axiosInstance.delete(`/block/${targetUserId}`);
    return response.data;
  },

  /**
   * Lấy danh sách những người đã bị chặn
   */
  getBlockList: async (): Promise<BlockedUser[]> => {
    const response = await axiosInstance.get('/block');
    return response.data;
  },

  /**
   * Lấy trạng thái chặn giữa 2 người dùng
   */
  getBlockStatus: async (targetUserId: string): Promise<BlockStatus> => {
    const response = await axiosInstance.get(`/block/status/${targetUserId}`);
    return response.data;
  },
};
