export interface User {
  _id: string;
  username: string;
  isOnline?: boolean;
  lastSeen?: Date;
  avatarUrl?: string;
}

export interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  createdAt?:Date;
}

export interface ChatSummary {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface SendMessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
}

export interface MarkAsReadPayload {
  userId: string;
  messageIds: string[];
}

export interface TypingStatus {
  fromUserId: string;
  toUserId: string;
  isTyping: boolean;
}
