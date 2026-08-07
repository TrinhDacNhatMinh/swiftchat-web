import { axiosInstance } from '@/shared/lib/axios';
import { ApiResponse } from '@/shared/types/api';

export interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
}

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Axios tự động set Content-Type: multipart/form-data kèm boundary
    const response = await axiosInstance.post<ApiResponse<UploadResponse>>('/upload', formData);
    return response.data;
  },
};
