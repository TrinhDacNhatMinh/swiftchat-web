import { Modal } from '@/shared/components/common/Modal';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (conversationId: string) => void;
}

export function NewConversationModal({ isOpen, onClose }: NewConversationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tin nhắn mới">
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[48px] text-primary/50 mb-4">construction</span>
        <h3 className="text-lg font-medium text-on-surface mb-2">Tính năng đang phát triển</h3>
        <p className="text-sm text-on-surface-variant">
          Giao diện tạo tin nhắn mới đang được nâng cấp. Vui lòng quay lại sau!
        </p>
      </div>
    </Modal>
  );
};

