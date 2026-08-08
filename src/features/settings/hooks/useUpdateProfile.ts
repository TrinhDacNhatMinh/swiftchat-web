import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, UpdateProfileDto } from '@/shared/services/userApi';
import { useAuthStore } from '@/stores/auth.store';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => userApi.updateMe(dto),
    onSuccess: (res: any) => {
      // res might be wrapped in ApiResponse, so we need to extract data if it's there
      const updatedUser = res.data || res;

      // Update the user in the global store
      if (user) {
        setUser({ ...user, ...updatedUser });
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (user?.handle) {
        queryClient.invalidateQueries({ queryKey: ['profile', user.handle] });
      }
    },
  });
};
