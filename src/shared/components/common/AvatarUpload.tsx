import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadApi } from '@/shared/services/uploadApi';
import { useToast } from "@/contexts/ToastContext";
import { Modal } from '@/shared/components/common/Modal';

interface AvatarUploadProps {
  currentUrl?: string | null;
  nameFallback?: string;
  onUploadSuccess: (url: string) => void;
  isGroup?: boolean;
  canEdit?: boolean;
  className?: string;
}

export function AvatarUpload({ 
  currentUrl, 
  nameFallback = '?', 
  onUploadSuccess, 
  isGroup = false,
  canEdit = true,
  className = 'w-24 h-24'
}: AvatarUploadProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isUploading) return;
    setIsViewerOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ message: t('upload.invalidImageType', 'Please select a valid image file.'), type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ message: t('upload.fileTooLarge', 'File is too large. Max size is 5MB.'), type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res.data.url;
      if (url) {
        onUploadSuccess(url);
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast({ message: t('upload.failed', 'Failed to upload image. Please try again.'), type: 'error' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={`relative ${className} rounded-full overflow-hidden bg-surface-container-highest border-2 border-outline flex items-center justify-center text-on-surface-variant shrink-0 shadow-sm cursor-pointer hover:border-primary group`}
        onClick={handleClick}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          isGroup ? (
            <span className="material-symbols-outlined text-[32px]">group</span>
          ) : (
            <span className="font-bold text-xl">{nameFallback.charAt(0).toUpperCase()}</span>
          )
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Removed zoom_in overlay */}
      </div>

      <Modal 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)} 
        title={isGroup ? t('chat.groupAvatar', 'Ảnh đại diện nhóm') : t('chat.userAvatar', 'Ảnh đại diện')}
      >
        <div className="flex flex-col items-center p-6">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center border-[6px] border-surface-container shadow-elevation-2 mb-6">
            {currentUrl ? (
              <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              isGroup ? (
                <span className="material-symbols-outlined text-[100px] text-on-surface-variant">group</span>
              ) : (
                <span className="font-bold text-[100px] text-on-surface-variant">{nameFallback.charAt(0).toUpperCase()}</span>
              )
            )}
          </div>
          
          {canEdit && (
            <button
              onClick={() => {
                setIsViewerOpen(false);
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-semibold text-sm shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              {t('upload.changeAvatar', 'Đổi ảnh đại diện')}
            </button>
          )}
        </div>
      </Modal>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
