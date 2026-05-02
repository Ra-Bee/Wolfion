import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { cancelReminder, scheduleReminder } from "@/lib/notifications";
import {
  makeSeedClasses,
  makeSeedPosts,
  makeSeedSkillExchanges,
  makeSeedStories,
  makeSeedStudyRooms,
  makeSeedUniversityEvents,
} from "@/lib/seed";
import { genId, readJSON, StorageKeys, writeJSON } from "@/lib/storage";
import type {
  Assignment,
  AppNotification,
  Chat,
  ChatMessage,
  ClassEntry,
  Exam,
  FriendRequest,
  Post,
  PostComment,
  SkillExchange,
  Story,
  StudyRoom,
  UniversityEvent,
} from "@/lib/types";

interface Ctx {
  ready: boolean;
  posts: Post[];
  stories: Story[];
  classes: ClassEntry[];
  assignments: Assignment[];
  exams: Exam[];
  chats: Chat[];
  messages: ChatMessage[];
  friends: Record<string, string[]>;
  friendRequests: FriendRequest[];
  studyRooms: StudyRoom[];
  skillExchanges: SkillExchange[];
  notifications: AppNotification[];
  universityEvents: UniversityEvent[];

  // posts
  createPost: (input: Omit<Post, "id" | "likes" | "comments" | "createdAt">) => Promise<Post>;
  togglePostLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  // stories
  createStory: (input: Omit<Story, "id" | "createdAt" | "expiresAt" | "views">) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;

  // classes / assignments / exams
  addClass: (c: Omit<ClassEntry, "id" | "ownerId">) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  addAssignment: (a: Omit<Assignment, "id" | "ownerId" | "done">) => Promise<void>;
  toggleAssignment: (id: string) => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;
  addExam: (e: Omit<Exam, "id" | "ownerId">) => Promise<void>;
  removeExam: (id: string) => Promise<void>;

  // messaging
  ensureDirectChat: (otherId: string) => Promise<Chat>;
  createGroupChat: (title: string, participantIds: string[]) => Promise<Chat>;
  sendMessage: (
    chatId: string,
    text: string,
    opts?: { imageUri?: string; ttlSeconds?: number },
  ) => Promise<void>;
  toggleSaveMessage: (id: string) => Promise<void>;
  markChatRead: (chatId: string) => Promise<void>;

  // friends
  sendFriendRequest: (toId: string) => Promise<void>;
  respondFriendRequest: (id: string, accept: boolean) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;

  // study rooms
  createStudyRoom: (r: Omit<StudyRoom, "id" | "hostId" | "participantIds" | "isLive">) => Promise<void>;
  joinStudyRoom: (id: string) => Promise<void>;
  leaveStudyRoom: (id: string) => Promise<void>;

  // skill exchange
  createSkillPost: (s: Omit<SkillExchange, "id" | "authorId" | "createdAt">) => Promise<void>;
  removeSkillPost: (id: string) => Promise<void>;

  // notifications
  dismissedSynth: string[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  pushNotification: (n: Omit<AppNotification, "id" | "ownerId" | "read" | "createdAt">) => Promise<void>;
  dismissSynthNotification: (synthId: string) => Promise<void>;
  dismissAllSynth: (synthIds: string[]) => Promise<void>;

  // university calendar
  addUniversityEvent: (e: Omit<UniversityEvent, "id" | "ownerId">) => Promise<void>;
  removeUniversityEvent: (id: string) => Promise<void>;
}

const AppDataContext = createContext<Ctx | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [friends, setFriends] = useState<Record<string, string[]>>({});
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [skillExchanges, setSkillExchanges] = useState<SkillExchange[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dismissedSynth, setDismissedSynth] = useState<string[]>([]);
  const [universityEvents, setUniversityEvents] = useState<UniversityEvent[]>([]);

  // initial load + first-run seed
  useEffect(() => {
    (async () => {
      const seeded = await readJSON<boolean>(StorageKeys.seeded, false);
      if (!seeded) {
        await writeJSON(StorageKeys.posts, makeSeedPosts());
        await writeJSON(StorageKeys.stories, makeSeedStories());
        await writeJSON(StorageKeys.studyRooms, makeSeedStudyRooms());
        await writeJSON(StorageKeys.skillExchanges, makeSeedSkillExchanges());
        await writeJSON(StorageKeys.friends, {
          u_maya: ["u_jordan", "u_sara"],
          u_jordan: ["u_maya"],
          u_sara: ["u_maya"],
          u_diego: [],
        });
        await writeJSON(StorageKeys.seeded, true);
      }
      setPosts(await readJSON<Post[]>(StorageKeys.posts, []));
      setStories(await readJSON<Story[]>(StorageKeys.stories, []));
      setClasses(await readJSON<ClassEntry[]>(StorageKeys.classes, []));
      setAssignments(await readJSON<Assignment[]>(StorageKeys.assignments, []));
      setExams(await readJSON<Exam[]>(StorageKeys.exams, []));
      setChats(await readJSON<Chat[]>(StorageKeys.chats, []));
      setMessages(await readJSON<ChatMessage[]>(StorageKeys.messages, []));
      setFriends(await readJSON<Record<string, string[]>>(StorageKeys.friends, {}));
      setFriendRequests(await readJSON<FriendRequest[]>(StorageKeys.friendRequests, []));
      setStudyRooms(await readJSON<StudyRoom[]>(StorageKeys.studyRooms, []));
      setSkillExchanges(await readJSON<SkillExchange[]>(StorageKeys.skillExchanges, []));
      setNotifications(await readJSON<AppNotification[]>(StorageKeys.notifications, []));
      setDismissedSynth(await readJSON<string[]>(StorageKeys.dismissedSynth, []));
      setUniversityEvents(await readJSON<UniversityEvent[]>(StorageKeys.universityEvents, []));
      setReady(true);
    })();
  }, []);

  // seed user-specific classes on first login
  useEffect(() => {
    if (!user) return;
    (async () => {
      const all = await readJSON<ClassEntry[]>(StorageKeys.classes, []);
      const mine = all.filter((c) => c.ownerId === user.id);
      if (mine.length === 0) {
        const seeded = makeSeedClasses(user.id);
        const next = [...all, ...seeded];
        await writeJSON(StorageKeys.classes, next);
        setClasses(next);
      }
      // seed university events for this owner if none
      const allUE = await readJSON<UniversityEvent[]>(StorageKeys.universityEvents, []);
      if (!allUE.some((e) => e.ownerId === user.id)) {
        const seededUE = makeSeedUniversityEvents(user.id);
        const nextUE = [...allUE, ...seededUE];
        await writeJSON(StorageKeys.universityEvents, nextUE);
        setUniversityEvents(nextUE);
      }
      // seed an assignment if none
      const allA = await readJSON<Assignment[]>(StorageKeys.assignments, []);
      if (!allA.some((a) => a.ownerId === user.id)) {
        const sample: Assignment[] = [
          {
            id: genId("a"),
            ownerId: user.id,
            title: "CS161 PSet 4",
            dueAt: Date.now() + 1000 * 60 * 60 * 30,
            notes: "Problem 3 has the trick with amortized analysis",
            done: false,
            priority: "high",
          },
          {
            id: genId("a"),
            ownerId: user.id,
            title: "Linear Algebra reading",
            dueAt: Date.now() + 1000 * 60 * 60 * 50,
            notes: "Chapter 4: eigenvalues",
            done: false,
            priority: "med",
          },
          {
            id: genId("a"),
            ownerId: user.id,
            title: "Email TA about extension",
            dueAt: Date.now() + 1000 * 60 * 60 * 8,
            notes: "",
            done: false,
            priority: "low",
          },
        ];
        const next = [...allA, ...sample];
        await writeJSON(StorageKeys.assignments, next);
        setAssignments(next);
      }
    })();
  }, [user]);

  const persistPosts = useCallback(async (next: Post[]) => {
    setPosts(next);
    await writeJSON(StorageKeys.posts, next);
  }, []);
  const persistStories = useCallback(async (next: Story[]) => {
    setStories(next);
    await writeJSON(StorageKeys.stories, next);
  }, []);
  const persistClasses = useCallback(async (next: ClassEntry[]) => {
    setClasses(next);
    await writeJSON(StorageKeys.classes, next);
  }, []);
  const persistAssignments = useCallback(async (next: Assignment[]) => {
    setAssignments(next);
    await writeJSON(StorageKeys.assignments, next);
  }, []);
  const persistExams = useCallback(async (next: Exam[]) => {
    setExams(next);
    await writeJSON(StorageKeys.exams, next);
  }, []);
  const persistChats = useCallback(async (next: Chat[]) => {
    setChats(next);
    await writeJSON(StorageKeys.chats, next);
  }, []);
  const persistMessages = useCallback(async (next: ChatMessage[]) => {
    setMessages(next);
    await writeJSON(StorageKeys.messages, next);
  }, []);
  const persistFriends = useCallback(async (next: Record<string, string[]>) => {
    setFriends(next);
    await writeJSON(StorageKeys.friends, next);
  }, []);
  const persistFriendRequests = useCallback(async (next: FriendRequest[]) => {
    setFriendRequests(next);
    await writeJSON(StorageKeys.friendRequests, next);
  }, []);
  const persistStudyRooms = useCallback(async (next: StudyRoom[]) => {
    setStudyRooms(next);
    await writeJSON(StorageKeys.studyRooms, next);
  }, []);
  const persistSkillExchanges = useCallback(async (next: SkillExchange[]) => {
    setSkillExchanges(next);
    await writeJSON(StorageKeys.skillExchanges, next);
  }, []);
  const persistNotifications = useCallback(async (next: AppNotification[]) => {
    setNotifications(next);
    await writeJSON(StorageKeys.notifications, next);
  }, []);
  const persistDismissedSynth = useCallback(async (next: string[]) => {
    setDismissedSynth(next);
    await writeJSON(StorageKeys.dismissedSynth, next);
  }, []);
  const persistUniversityEvents = useCallback(async (next: UniversityEvent[]) => {
    setUniversityEvents(next);
    await writeJSON(StorageKeys.universityEvents, next);
  }, []);

  const addUniversityEvent: Ctx["addUniversityEvent"] = useCallback(
    async (e) => {
      if (!user) return;
      const item: UniversityEvent = { ...e, id: genId("ue"), ownerId: user.id };
      await persistUniversityEvents([...universityEvents, item]);
    },
    [universityEvents, persistUniversityEvents, user],
  );
  const removeUniversityEvent: Ctx["removeUniversityEvent"] = useCallback(
    async (id) => persistUniversityEvents(universityEvents.filter((e) => e.id !== id)),
    [universityEvents, persistUniversityEvents],
  );

  const pushNotification: Ctx["pushNotification"] = useCallback(
    async (n) => {
      if (!user) return;
      const next: AppNotification[] = [
        {
          id: genId("n"),
          ownerId: user.id,
          read: false,
          createdAt: Date.now(),
          ...n,
        },
        ...notifications,
      ];
      await persistNotifications(next);
    },
    [notifications, persistNotifications, user],
  );

  const createPost: Ctx["createPost"] = useCallback(
    async (input) => {
      const post: Post = {
        ...input,
        id: genId("p"),
        likes: [],
        comments: [],
        createdAt: Date.now(),
      };
      await persistPosts([post, ...posts]);
      return post;
    },
    [posts, persistPosts],
  );

  const togglePostLike: Ctx["togglePostLike"] = useCallback(
    async (postId) => {
      if (!user) return;
      const next = posts.map((p) => {
        if (p.id !== postId) return p;
        const has = p.likes.includes(user.id);
        return { ...p, likes: has ? p.likes.filter((u) => u !== user.id) : [...p.likes, user.id] };
      });
      await persistPosts(next);
    },
    [posts, persistPosts, user],
  );

  const addComment: Ctx["addComment"] = useCallback(
    async (postId, text) => {
      if (!user || !text.trim()) return;
      const c: PostComment = {
        id: genId("c"),
        authorId: user.id,
        text: text.trim(),
        createdAt: Date.now(),
      };
      const next = posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, c] } : p));
      await persistPosts(next);
    },
    [posts, persistPosts, user],
  );

  const deletePost: Ctx["deletePost"] = useCallback(
    async (postId) => {
      const next = posts.filter((p) => p.id !== postId);
      await persistPosts(next);
    },
    [posts, persistPosts],
  );

  const createStory: Ctx["createStory"] = useCallback(
    async (input) => {
      const now = Date.now();
      const s: Story = {
        ...input,
        id: genId("s"),
        createdAt: now,
        expiresAt: now + 1000 * 60 * 60 * 24,
        views: [],
      };
      await persistStories([s, ...stories]);
    },
    [stories, persistStories],
  );

  const viewStory: Ctx["viewStory"] = useCallback(
    async (storyId) => {
      if (!user) return;
      const next = stories.map((s) =>
        s.id === storyId && !s.views.includes(user.id) ? { ...s, views: [...s.views, user.id] } : s,
      );
      await persistStories(next);
    },
    [stories, persistStories, user],
  );

  const addClass: Ctx["addClass"] = useCallback(
    async (c) => {
      if (!user) return;
      const cls: ClassEntry = { ...c, id: genId("cls"), ownerId: user.id };
      await persistClasses([...classes, cls]);
    },
    [classes, persistClasses, user],
  );
  const removeClass: Ctx["removeClass"] = useCallback(
    async (id) => persistClasses(classes.filter((c) => c.id !== id)),
    [classes, persistClasses],
  );

  const addAssignment: Ctx["addAssignment"] = useCallback(
    async (a) => {
      if (!user) return;
      const id = genId("a");
      // schedule a local reminder 1h before due (if in future)
      const remindAt = a.dueAt - 60 * 60 * 1000;
      const reminderId =
        remindAt > Date.now()
          ? await scheduleReminder({
              title: "Assignment due soon",
              body: `${a.title} is due in 1 hour`,
              when: remindAt,
            })
          : null;
      const item: Assignment = {
        ...a,
        id,
        ownerId: user.id,
        done: false,
        reminderId: reminderId ?? undefined,
      };
      await persistAssignments([...assignments, item]);
    },
    [assignments, persistAssignments, user],
  );
  const toggleAssignment: Ctx["toggleAssignment"] = useCallback(
    async (id) => {
      const next = assignments.map((a) => (a.id === id ? { ...a, done: !a.done } : a));
      const target = next.find((a) => a.id === id);
      if (target?.done && target.reminderId) {
        await cancelReminder(target.reminderId);
        target.reminderId = undefined;
      }
      await persistAssignments(next);
    },
    [assignments, persistAssignments],
  );
  const removeAssignment: Ctx["removeAssignment"] = useCallback(
    async (id) => {
      const target = assignments.find((a) => a.id === id);
      if (target?.reminderId) await cancelReminder(target.reminderId);
      await persistAssignments(assignments.filter((a) => a.id !== id));
    },
    [assignments, persistAssignments],
  );

  const addExam: Ctx["addExam"] = useCallback(
    async (e) => {
      if (!user) return;
      const remindAt = e.startsAt - 24 * 60 * 60 * 1000;
      const reminderId =
        remindAt > Date.now()
          ? await scheduleReminder({
              title: "Exam tomorrow",
              body: `${e.title} starts in 24 hours${e.location ? ` at ${e.location}` : ""}`,
              when: remindAt,
            })
          : null;
      const item: Exam = { ...e, id: genId("ex"), ownerId: user.id, reminderId: reminderId ?? undefined };
      await persistExams([...exams, item]);
    },
    [exams, persistExams, user],
  );
  const removeExam: Ctx["removeExam"] = useCallback(
    async (id) => {
      const target = exams.find((e) => e.id === id);
      if (target?.reminderId) await cancelReminder(target.reminderId);
      await persistExams(exams.filter((e) => e.id !== id));
    },
    [exams, persistExams],
  );

  const ensureDirectChat: Ctx["ensureDirectChat"] = useCallback(
    async (otherId) => {
      if (!user) throw new Error("not authed");
      const found = chats.find(
        (c) =>
          !c.isGroup &&
          c.participantIds.length === 2 &&
          c.participantIds.includes(user.id) &&
          c.participantIds.includes(otherId),
      );
      if (found) return found;
      const c: Chat = {
        id: genId("ch"),
        participantIds: [user.id, otherId],
        isGroup: false,
        lastMessageAt: Date.now(),
      };
      await persistChats([c, ...chats]);
      return c;
    },
    [chats, persistChats, user],
  );

  const createGroupChat: Ctx["createGroupChat"] = useCallback(
    async (title, participantIds) => {
      if (!user) throw new Error("not authed");
      const c: Chat = {
        id: genId("ch"),
        participantIds: Array.from(new Set([user.id, ...participantIds])),
        isGroup: true,
        title,
        lastMessageAt: Date.now(),
      };
      await persistChats([c, ...chats]);
      return c;
    },
    [chats, persistChats, user],
  );

  const sendMessage: Ctx["sendMessage"] = useCallback(
    async (chatId, text, opts) => {
      if (!user) return;
      const trimmed = text.trim();
      if (!trimmed && !opts?.imageUri) return;
      const now = Date.now();
      const expiresAt =
        opts?.ttlSeconds && opts.ttlSeconds > 0 ? now + opts.ttlSeconds * 1000 : undefined;
      const msg: ChatMessage = {
        id: genId("m"),
        chatId,
        authorId: user.id,
        text: trimmed,
        imageUri: opts?.imageUri,
        expiresAt,
        readBy: [user.id],
        createdAt: now,
      };
      // also drop already-expired messages from store on every write
      const pruned = [...messages, msg].filter(
        (m) => m.saved || !m.expiresAt || m.expiresAt > now,
      );
      await persistMessages(pruned);
      const updatedChats = chats.map((c) =>
        c.id === chatId ? { ...c, lastMessageAt: msg.createdAt } : c,
      );
      await persistChats(updatedChats);

      const chat = updatedChats.find((c) => c.id === chatId);
      if (chat && !chat.isGroup) {
        const otherId = chat.participantIds.find((p) => p !== user.id);
        if (otherId) {
          setTimeout(async () => {
            const replies = [
              "haha that's wild",
              "100%",
              "let's do it",
              "want to study together later?",
              "send me your notes when you can",
              "sounds good — same place as last time?",
            ];
            const replyNow = Date.now();
            const reply: ChatMessage = {
              id: genId("m"),
              chatId,
              authorId: otherId,
              text: replies[Math.floor(Math.random() * replies.length)]!,
              readBy: [otherId],
              createdAt: replyNow,
            };
            const after = await readJSON<ChatMessage[]>(StorageKeys.messages, []);
            const next = [...after, reply].filter(
              (m) => m.saved || !m.expiresAt || m.expiresAt > replyNow,
            );
            await writeJSON(StorageKeys.messages, next);
            setMessages(next);
            const cs = await readJSON<Chat[]>(StorageKeys.chats, []);
            const csNext = cs.map((c) => (c.id === chatId ? { ...c, lastMessageAt: reply.createdAt } : c));
            await writeJSON(StorageKeys.chats, csNext);
            setChats(csNext);
          }, 1800);
        }
      }
    },
    [messages, persistMessages, chats, persistChats, user],
  );

  const toggleSaveMessage: Ctx["toggleSaveMessage"] = useCallback(
    async (id) => {
      const next = messages.map((m) => (m.id === id ? { ...m, saved: !m.saved } : m));
      await persistMessages(next);
    },
    [messages, persistMessages],
  );

  const markChatRead: Ctx["markChatRead"] = useCallback(
    async (chatId) => {
      if (!user) return;
      let changed = false;
      const next = messages.map((m) => {
        if (m.chatId !== chatId) return m;
        const readers = m.readBy ?? [];
        if (readers.includes(user.id)) return m;
        changed = true;
        return { ...m, readBy: [...readers, user.id] };
      });
      if (changed) await persistMessages(next);
    },
    [messages, persistMessages, user],
  );

  const sendFriendRequest: Ctx["sendFriendRequest"] = useCallback(
    async (toId) => {
      if (!user || toId === user.id) return;
      const exists = friendRequests.some(
        (r) => r.fromId === user.id && r.toId === toId && r.status === "pending",
      );
      if (exists) return;
      const r: FriendRequest = {
        id: genId("fr"),
        fromId: user.id,
        toId,
        status: "pending",
        createdAt: Date.now(),
      };
      await persistFriendRequests([r, ...friendRequests]);
    },
    [friendRequests, persistFriendRequests, user],
  );

  const respondFriendRequest: Ctx["respondFriendRequest"] = useCallback(
    async (id, accept) => {
      if (!user) return;
      const req = friendRequests.find((r) => r.id === id);
      if (!req) return;
      const updated = friendRequests.map((r) =>
        r.id === id ? { ...r, status: (accept ? "accepted" : "declined") as "accepted" | "declined" } : r,
      );
      await persistFriendRequests(updated);
      if (accept) {
        const next = { ...friends };
        next[req.fromId] = Array.from(new Set([...(next[req.fromId] ?? []), req.toId]));
        next[req.toId] = Array.from(new Set([...(next[req.toId] ?? []), req.fromId]));
        await persistFriends(next);
      }
    },
    [friendRequests, friends, persistFriendRequests, persistFriends, user],
  );

  const removeFriend: Ctx["removeFriend"] = useCallback(
    async (id) => {
      if (!user) return;
      const next = { ...friends };
      next[user.id] = (next[user.id] ?? []).filter((x) => x !== id);
      next[id] = (next[id] ?? []).filter((x) => x !== user.id);
      await persistFriends(next);
    },
    [friends, persistFriends, user],
  );

  const createStudyRoom: Ctx["createStudyRoom"] = useCallback(
    async (r) => {
      if (!user) return;
      const room: StudyRoom = {
        ...r,
        id: genId("sr"),
        hostId: user.id,
        participantIds: [user.id],
        isLive: false,
      };
      await persistStudyRooms([room, ...studyRooms]);
    },
    [studyRooms, persistStudyRooms, user],
  );

  const joinStudyRoom: Ctx["joinStudyRoom"] = useCallback(
    async (id) => {
      if (!user) return;
      const next = studyRooms.map((r) =>
        r.id === id && !r.participantIds.includes(user.id)
          ? { ...r, participantIds: [...r.participantIds, user.id] }
          : r,
      );
      await persistStudyRooms(next);
    },
    [studyRooms, persistStudyRooms, user],
  );

  const leaveStudyRoom: Ctx["leaveStudyRoom"] = useCallback(
    async (id) => {
      if (!user) return;
      const next = studyRooms.map((r) =>
        r.id === id ? { ...r, participantIds: r.participantIds.filter((p) => p !== user.id) } : r,
      );
      await persistStudyRooms(next);
    },
    [studyRooms, persistStudyRooms, user],
  );

  const createSkillPost: Ctx["createSkillPost"] = useCallback(
    async (s) => {
      if (!user) return;
      const item: SkillExchange = {
        ...s,
        id: genId("sx"),
        authorId: user.id,
        createdAt: Date.now(),
      };
      await persistSkillExchanges([item, ...skillExchanges]);
    },
    [skillExchanges, persistSkillExchanges, user],
  );

  const removeSkillPost: Ctx["removeSkillPost"] = useCallback(
    async (id) => persistSkillExchanges(skillExchanges.filter((s) => s.id !== id)),
    [skillExchanges, persistSkillExchanges],
  );

  const markNotificationRead: Ctx["markNotificationRead"] = useCallback(
    async (id) => persistNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [notifications, persistNotifications],
  );

  const markAllNotificationsRead: Ctx["markAllNotificationsRead"] = useCallback(
    async () => persistNotifications(notifications.map((n) => ({ ...n, read: true }))),
    [notifications, persistNotifications],
  );

  const dismissSynthNotification: Ctx["dismissSynthNotification"] = useCallback(
    async (synthId) => {
      if (dismissedSynth.includes(synthId)) return;
      await persistDismissedSynth([...dismissedSynth, synthId]);
    },
    [dismissedSynth, persistDismissedSynth],
  );

  const dismissAllSynth: Ctx["dismissAllSynth"] = useCallback(
    async (synthIds) => {
      const next = Array.from(new Set([...dismissedSynth, ...synthIds]));
      await persistDismissedSynth(next);
    },
    [dismissedSynth, persistDismissedSynth],
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      posts,
      stories,
      classes,
      assignments,
      exams,
      chats,
      messages,
      friends,
      friendRequests,
      studyRooms,
      skillExchanges,
      notifications,
      universityEvents,
      addUniversityEvent,
      removeUniversityEvent,
      createPost,
      togglePostLike,
      addComment,
      deletePost,
      createStory,
      viewStory,
      addClass,
      removeClass,
      addAssignment,
      toggleAssignment,
      removeAssignment,
      addExam,
      removeExam,
      ensureDirectChat,
      createGroupChat,
      sendMessage,
      toggleSaveMessage,
      markChatRead,
      sendFriendRequest,
      respondFriendRequest,
      removeFriend,
      createStudyRoom,
      joinStudyRoom,
      leaveStudyRoom,
      createSkillPost,
      removeSkillPost,
      dismissedSynth,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      dismissSynthNotification,
      dismissAllSynth,
    }),
    [
      ready,
      posts,
      stories,
      classes,
      assignments,
      exams,
      chats,
      messages,
      friends,
      friendRequests,
      studyRooms,
      skillExchanges,
      notifications,
      universityEvents,
      addUniversityEvent,
      removeUniversityEvent,
      createPost,
      togglePostLike,
      addComment,
      deletePost,
      createStory,
      viewStory,
      addClass,
      removeClass,
      addAssignment,
      toggleAssignment,
      removeAssignment,
      addExam,
      removeExam,
      ensureDirectChat,
      createGroupChat,
      sendMessage,
      toggleSaveMessage,
      markChatRead,
      sendFriendRequest,
      respondFriendRequest,
      removeFriend,
      createStudyRoom,
      joinStudyRoom,
      leaveStudyRoom,
      createSkillPost,
      removeSkillPost,
      dismissedSynth,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      dismissSynthNotification,
      dismissAllSynth,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): Ctx {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
