import i18n from '@/i18n';

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  const status = error?.response?.status;
  switch (status) {
    case 400:
      return i18n.t('errors.400', 'Dữ liệu đầu vào không hợp lệ.');
    case 401:
      return i18n.t('errors.401', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    case 403:
      return i18n.t('errors.403', 'Bạn không có quyền thực hiện thao tác này.');
    case 404:
      return i18n.t('errors.404', 'Không tìm thấy dữ liệu.');
    case 409:
      return i18n.t('errors.409', 'Dữ liệu đã tồn tại hoặc có xung đột.');
    case 429:
      return i18n.t('errors.429', 'Thao tác quá nhanh, vui lòng thử lại sau.');
    case 500:
      return i18n.t('errors.500', 'Lỗi hệ thống. Vui lòng thử lại sau.');
    default:
      return error?.message || i18n.t('errors.default', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
  }
};
