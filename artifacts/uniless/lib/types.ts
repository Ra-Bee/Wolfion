export type Privacy = "public" | "friends" | "private";

export interface FieldPrivacy {
  bio: Privacy;
  major: Privacy;
  year: Privacy;
  interests: Privacy;
  skills: Privacy;
  linkedin: Privacy;
  cv: Privacy;
}

export const DEFAULT_FIELD_PRIVACY: FieldPrivacy = {
  bio: "public",
  major: "public",
  year: "public",
  interests: "public",
  skills: "public",
  linkedin: "friends",
  cv: "friends",
};

export interface UnilessUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  username: string;
  university: string;
  major: string;
  year: string;
  bio: string;
  linkedinUrl?: string;
  cv?: string;
  avatarColor: string;
  privacy: Privacy;
  fieldPrivacy?: FieldPrivacy;
  interests: string[];
  skillsOffered: string[];
  skillsWanted: string[];
  createdAt: number;
}

export interface PublicUser {
  id: string;
  displayName: string;
  username: string;
  university: string;
  major: string;
  year: string;
  bio: string;
  linkedinUrl?: string;
  cv?: string;
  avatarColor: string;
  privacy: Privacy;
  fieldPrivacy?: FieldPrivacy;
  interests: string[];
  skillsOffered: string[];
  skillsWanted: string[];
  createdAt: number;
}

export type PostCategory = "study" | "questions" | "events" | "notes";

export const POST_CATEGORIES: PostCategory[] = ["study", "questions", "events", "notes"];

export const POST_MAX_CHARS = 280;

export interface Post {
  id: string;
  authorId: string;
  text: string;
  category: PostCategory;
  images?: string[];
  tags: string[];
  privacy: Privacy;
  likes: string[];
  comments: PostComment[];
  createdAt: number;
}

export interface PostComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface Story {
  id: string;
  authorId: string;
  text: string;
  bgColor: string;
  imageUri?: string;
  createdAt: number;
  expiresAt: number;
  views: string[];
}

export interface ClassEntry {
  id: string;
  ownerId: string;
  name: string;
  code: string;
  professor: string;
  location: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  color: string;
}

export interface Assignment {
  id: string;
  ownerId: string;
  title: string;
  classId?: string;
  dueAt: number;
  notes: string;
  done: boolean;
  priority: "low" | "med" | "high";
  reminderId?: string;
}

export interface Exam {
  id: string;
  ownerId: string;
  title: string;
  classId?: string;
  startsAt: number;
  location: string;
  notes: string;
  reminderId?: string;
}

export interface Chat {
  id: string;
  participantIds: string[];
  isGroup: boolean;
  title?: string;
  lastMessageAt: number;
}

export type MessageAttachmentKind = "photo" | "video" | "audio" | "pdf" | "file";

export interface MessageAttachment {
  kind: MessageAttachmentKind;
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  authorId: string;
  text: string;
  imageUri?: string;
  attachment?: MessageAttachment;
  expiresAt?: number;
  saved?: boolean;
  readBy?: string[];
  createdAt: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

export interface StudyRoom {
  id: string;
  hostId: string;
  title: string;
  subject: string;
  description: string;
  capacity: number;
  participantIds: string[];
  scheduledFor: number;
  isLive: boolean;
}

export interface SkillExchange {
  id: string;
  authorId: string;
  type: "offer" | "request";
  skill: string;
  description: string;
  exchangeFor: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  category: "social" | "academic" | "system" | "ai";
  read: boolean;
  createdAt: number;
}

export type ThemePref = "system" | "light" | "dark";

export interface UniversityEvent {
  id: string;
  ownerId: string;
  title: string;
  kind: "semester" | "holiday" | "midterm" | "finals" | "deadline" | "custom";
  startsAt: number;
  endsAt?: number;
  notes?: string;
}
