interface TypingIndicatorProps {
  users: { userId: string; handle: string }[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  const label = users.length === 1
    ? `${users[0].handle} đang gõ...`
    : users.length === 2
    ? `${users[0].handle} và ${users[1].handle} đang gõ...`
    : `${users.length} người đang gõ...`;

  return (
    <div className="flex items-end gap-2 px-2 py-1 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-7 h-7 rounded-full bg-surface-container-high flex flex-shrink-0 items-center justify-center">
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">keyboard</span>
      </div>
      <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2.5 rounded-2xl rounded-bl-none">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-[12px] text-on-surface-variant italic">{label}</span>
      </div>
    </div>
  );
};
