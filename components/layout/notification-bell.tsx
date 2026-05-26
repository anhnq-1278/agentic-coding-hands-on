type Props = {
  unreadCount?: number;
};

/**
 * mms_A1.6_Notification — bell icon button with optional red dot badge.
 * For UI-only pass: visual only, no panel wiring.
 */
export function NotificationBell({ unreadCount = 0 }: Props) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      aria-label={
        hasUnread ? `${unreadCount} unread notifications` : "Notifications"
      }
      className="relative flex h-10 w-10 items-center justify-center rounded-[4px] text-saa-text-primary transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {hasUnread && (
        <span
          aria-hidden
          className="absolute right-[6px] top-[6px] h-2 w-2 rounded-full bg-saa-badge"
        />
      )}
    </button>
  );
}
