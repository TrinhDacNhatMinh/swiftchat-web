import { useMutation } from '@tanstack/react-query';
import { userApi, ChangePasswordDto } from '@/shared/services/userApi';

export const useSettings = () => {
  const changePassword = useMutation({
    mutationFn: (dto: ChangePasswordDto) => userApi.changePassword(dto),
  });

  return { changePassword };
};
