import type { Timestamp } from 'firebase/firestore'

export interface DailyLogComment {
  id: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: Timestamp; // Firestore Timestamp
}

export interface DailyLog {
  id: string;
  accountId: string;
  workspaceId: string;
  workspaceName: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  photoURLs: string[];
  recordedAt: Timestamp; // The actual time the event happened, editable by user
  createdAt: Timestamp; // The system time the log was created
  likes?: string[]; // Array of user IDs who liked the log
  likeCount?: number; // Denormalized count of likes
  commentCount?: number; // Denormalized count of comments
  comments?: DailyLogComment[]; // Locally held comments, not persisted
}
