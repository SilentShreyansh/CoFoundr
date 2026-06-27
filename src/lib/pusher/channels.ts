// Shared channel/event names so client and server agree.
export const chatChannel = (chatId: string) => `presence-chat-${chatId}`;
export const userChannel = (userId: string) => `private-user-${userId}`;

export const ChatEvent = {
  NewMessage: "new-message",
  DeleteMessage: "delete-message",
  Typing: "typing",
  Read: "read",
} as const;

export const UserEvent = {
  Notification: "notification",
} as const;
