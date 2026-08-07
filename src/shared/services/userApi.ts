import { axiosInstance } from '@/shared/lib/axios';
import { ApiResponse } from '@/shared/types/api';
import { User } from '@/shared/types/models';
import { FriendProfile } from '@/shared/services/friendApi';

export interface UpdateProfileDto {
  handle?: string;
  displayName?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export const userApi = {
  // Tìm kiếm người dùng
  searchUsers: async (q: string, scope: 'all' | 'friends' = 'all') => {
    const response = await axiosInstance.get<ApiResponse<FriendProfile[]>>(
      '/users/search',
      { params: { q, scope } }
    );
    return response.data;
  },

  // Xem thông tin user khác
  getUserById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  getUserByHandle: async (handle: string) => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/handle/${handle}`);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  updateMe: async (dto: UpdateProfileDto) => {
    const response = await axiosInstance.patch<ApiResponse<User>>('/users/me', dto);
    return response.data;
  },

  changePassword: async (dto: ChangePasswordDto) => {
    const response = await axiosInstance.post<ApiResponse<null>>('/users/me/change-password', dto);
    return response.data;
  },
};
