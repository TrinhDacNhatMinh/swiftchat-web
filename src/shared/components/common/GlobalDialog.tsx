import { Modal } from '@/shared/components/common/Modal';
import { useTranslation } from 'react-i18next';

interface GlobalDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type: 'info' | 'danger' | 'warning';
  isAlert: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GlobalDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type,
  isAlert,
  onConfirm,
  onCancel,
}: GlobalDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={isAlert ? onConfirm : onCancel} title={title}>
      <div className="p-6 pt-2 w-full">
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          {!isAlert && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              {cancelText || t('common.cancel', 'Hủy')}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'danger'
                ? 'bg-error text-on-error hover:opacity-90'
                : 'bg-primary text-on-primary hover:opacity-90'
            }`}
          >
            {confirmText || (isAlert ? t('common.ok', 'OK') : t('common.confirm', 'Xác nhận'))}
          </button>
        </div>
      </div>
    </Modal>
  );
};
