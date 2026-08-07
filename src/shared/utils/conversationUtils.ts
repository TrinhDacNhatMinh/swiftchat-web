import { Conversation } from '@/shared/types/models';

export const getConversationDetails = (conversation: Conversation | undefined | null, currentUserId: string | undefined, t?: any) => {
  if (!conversation) {
    return { title: t ? t('chat.unknownChat', 'Unknown Chat') : 'Unknown Chat', avatarUrl: null, type: 'group' };
  }

  return {
    title: conversation.displayInfo?.title || (conversation.type === 'group' ? (t ? t('chat.unnamedGroup', 'Unnamed Group') : 'Unnamed Group') : (t ? t('chat.unknownUser', 'Unknown User') : 'Unknown User')),
    avatarUrl: conversation.displayInfo?.avatarUrl || null,
    type: conversation.type,
  };
};

export const getRoleLabel = (role: string, t: any) => {
  switch (role) {
    case 'leader': return t('chat.leader', 'Admin');
    case 'deputy': return t('chat.deputy', 'Phó nhóm');
    default: return t('chat.member', 'Thành viên');
  }
};
