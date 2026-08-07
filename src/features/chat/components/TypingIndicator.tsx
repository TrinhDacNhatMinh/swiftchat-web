interface TypingIndicatorProps {
  users: { userId: string; handle: string; avatarUrl?: string }[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-end gap-1.5 min-w-0 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, i) => (
          <div 
            key={user.userId} 
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
            style={{ zIndex: 3 - i }}
            title={user.handle}
          >
            <div className="w-full h-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden rounded-full">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.handle} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-xs text-on-surface-variant">
                  {user.handle?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-surface-container-high px-4 py-3 rounded-2xl relative flex items-center justify-center min-w-[64px]">
        {/* Invisible text with exact same classes as MessageBubble to guarantee identical height */}
        <span className="invisible text-[15px] leading-relaxed">hello</span>
        <div className="absolute flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant opacity-60 animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant opacity-60 animate-[bounce_1s_infinite]" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant opacity-60 animate-[bounce_1s_infinite]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
