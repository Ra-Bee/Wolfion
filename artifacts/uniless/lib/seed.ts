import type {
  ClassEntry,
  Post,
  PublicUser,
  SkillExchange,
  Story,
  StudyRoom,
  UnilessUser,
  UniversityEvent,
} from "./types";
import { genId } from "./storage";

const PALETTE = [
  "#3aa9ff",
  "#9BF6FF",
  "#CDB4FF",
  "#7ddfc6",
  "#ffd07a",
  "#ff8a8a",
  "#BDEBFF",
  "#a3d9ff",
];

export function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length] ?? PALETTE[0]!;
}

export const SEED_USERS: UnilessUser[] = [
  {
    id: "u_maya",
    email: "maya@unirab.app",
    passwordHash: "demo",
    displayName: "Maya Patel",
    username: "mayap",
    university: "Stanford University",
    major: "Computer Science",
    year: "Junior",
    bio: "Building cool things & drinking too much chai. CS junior into ML and design.",
    avatarColor: "#3aa9ff",
    privacy: "public",
    interests: ["machine learning", "design", "hiking"],
    skillsOffered: ["Python", "Figma", "Calculus tutoring"],
    skillsWanted: ["Spanish conversation", "Guitar basics"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: "u_jordan",
    email: "jordan@unirab.app",
    passwordHash: "demo",
    displayName: "Jordan Lee",
    username: "jordanl",
    university: "Stanford University",
    major: "Mechanical Engineering",
    year: "Sophomore",
    bio: "ME sophomore. Robotics club lead. Looking for study buddies for Thermo.",
    avatarColor: "#9BF6FF",
    privacy: "public",
    interests: ["robotics", "F1", "coffee"],
    skillsOffered: ["CAD", "SolidWorks", "Soldering"],
    skillsWanted: ["Differential equations", "Public speaking"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
  },
  {
    id: "u_sara",
    email: "sara@unirab.app",
    passwordHash: "demo",
    displayName: "Sara Kim",
    username: "sarak",
    university: "Stanford University",
    major: "Psychology",
    year: "Senior",
    bio: "Psych senior. Thesis on sleep & memory. Always down for boba breaks.",
    avatarColor: "#CDB4FF",
    privacy: "friends",
    interests: ["neuroscience", "yoga", "writing"],
    skillsOffered: ["Statistics (R)", "Essay editing"],
    skillsWanted: ["LaTeX", "Web design"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
  },
  {
    id: "u_diego",
    email: "diego@unirab.app",
    passwordHash: "demo",
    displayName: "Diego Alvarez",
    username: "diegoa",
    university: "Stanford University",
    major: "Economics",
    year: "Junior",
    bio: "Econ + minor in Music. Producing beats between problem sets.",
    avatarColor: "#7ddfc6",
    privacy: "public",
    interests: ["music", "finance", "soccer"],
    skillsOffered: ["Ableton Live", "Excel modeling"],
    skillsWanted: ["Mandarin basics", "Photography"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
];

export function toPublic(u: UnilessUser): PublicUser {
  const { passwordHash: _ph, email: _e, ...rest } = u;
  return rest;
}

export function makeSeedPosts(): Post[] {
  const now = Date.now();
  return [
    {
      id: genId("p"),
      authorId: "u_maya",
      text:
        "Just submitted my CS221 final project — built a tiny neural net that predicts the dining hall lunch lines. Accuracy: surprisingly OK.",
      category: "study",
      tags: ["cs221", "ml", "stanford"],
      privacy: "public",
      likes: ["u_jordan", "u_diego"],
      comments: [
        {
          id: genId("c"),
          authorId: "u_jordan",
          text: "drop the dataset 👀",
          createdAt: now - 1000 * 60 * 30,
        },
      ],
      createdAt: now - 1000 * 60 * 60 * 2,
    },
    {
      id: genId("p"),
      authorId: "u_jordan",
      text:
        "Robotics club meeting tonight at 7 in the Huang basement. Pizza included. New members welcome!",
      category: "events",
      tags: ["robotics", "club"],
      privacy: "public",
      likes: ["u_maya", "u_sara"],
      comments: [],
      createdAt: now - 1000 * 60 * 60 * 5,
    },
    {
      id: genId("p"),
      authorId: "u_sara",
      text:
        "Looking for 2 more people to join a thesis writing accumulator at Green Library tomorrow 10am-2pm. Quiet vibes, snacks provided.",
      category: "study",
      tags: ["studygroup", "thesis"],
      privacy: "friends",
      likes: ["u_maya"],
      comments: [],
      createdAt: now - 1000 * 60 * 60 * 9,
    },
    {
      id: genId("p"),
      authorId: "u_diego",
      text:
        "Anyone have good notes for ECON 50 Chapter 7? Mine got eaten by Notion sync 😩",
      category: "questions",
      tags: ["econ50", "notes"],
      privacy: "public",
      likes: ["u_maya"],
      comments: [],
      createdAt: now - 1000 * 60 * 60 * 14,
    },
    {
      id: genId("p"),
      authorId: "u_maya",
      text:
        "Sharing my CS161 midterm review sheet — covers DP, greedy, and graph algos. DM for the link!",
      category: "notes",
      tags: ["cs161", "midterm", "review"],
      privacy: "public",
      likes: ["u_jordan", "u_sara", "u_diego"],
      comments: [],
      createdAt: now - 1000 * 60 * 60 * 20,
    },
  ];
}

export function makeSeedStories(): Story[] {
  const now = Date.now();
  const tenHours = 1000 * 60 * 60 * 10;
  return [
    {
      id: genId("s"),
      authorId: "u_maya",
      text: "Library grind 📚",
      bgColor: "#3aa9ff",
      createdAt: now - tenHours,
      expiresAt: now + 1000 * 60 * 60 * 14,
      views: [],
    },
    {
      id: genId("s"),
      authorId: "u_diego",
      text: "Studio session 🎧",
      bgColor: "#CDB4FF",
      createdAt: now - 1000 * 60 * 60 * 3,
      expiresAt: now + 1000 * 60 * 60 * 21,
      views: [],
    },
    {
      id: genId("s"),
      authorId: "u_sara",
      text: "Sunset run 🌅",
      bgColor: "#9BF6FF",
      createdAt: now - 1000 * 60 * 60 * 6,
      expiresAt: now + 1000 * 60 * 60 * 18,
      views: [],
    },
  ];
}

export function makeSeedClasses(ownerId: string): ClassEntry[] {
  return [
    {
      id: genId("cls"),
      ownerId,
      name: "Algorithms",
      code: "CS161",
      professor: "Prof. Roughgarden",
      location: "Hewlett 200",
      dayOfWeek: 1,
      startTime: "10:30",
      endTime: "11:50",
      color: "#3aa9ff",
    },
    {
      id: genId("cls"),
      ownerId,
      name: "Linear Algebra",
      code: "MATH113",
      professor: "Prof. Wong",
      location: "380-380C",
      dayOfWeek: 2,
      startTime: "13:30",
      endTime: "14:50",
      color: "#CDB4FF",
    },
    {
      id: genId("cls"),
      ownerId,
      name: "Intro to Psychology",
      code: "PSYCH1",
      professor: "Prof. Eberhardt",
      location: "Cubberley Aud",
      dayOfWeek: 3,
      startTime: "09:00",
      endTime: "10:20",
      color: "#9BF6FF",
    },
    {
      id: genId("cls"),
      ownerId,
      name: "Algorithms",
      code: "CS161",
      professor: "Prof. Roughgarden",
      location: "Hewlett 200",
      dayOfWeek: 3,
      startTime: "10:30",
      endTime: "11:50",
      color: "#3aa9ff",
    },
    {
      id: genId("cls"),
      ownerId,
      name: "Creative Writing",
      code: "ENGL90",
      professor: "Prof. Tobar",
      location: "Pigott 200",
      dayOfWeek: 4,
      startTime: "15:00",
      endTime: "16:50",
      color: "#7ddfc6",
    },
  ];
}

export function makeSeedStudyRooms(): StudyRoom[] {
  const now = Date.now();
  return [
    {
      id: genId("sr"),
      hostId: "u_jordan",
      title: "Thermo problem set party",
      subject: "ME70",
      description:
        "Working through PSet 6. Bring questions and snacks. We'll go through problem 3 together first.",
      capacity: 6,
      participantIds: ["u_jordan", "u_sara"],
      scheduledFor: now + 1000 * 60 * 60 * 2,
      isLive: false,
    },
    {
      id: genId("sr"),
      hostId: "u_sara",
      title: "Stats office hours prep",
      subject: "STATS60",
      description: "Going over confidence intervals before tomorrow's OH.",
      capacity: 4,
      participantIds: ["u_sara"],
      scheduledFor: now + 1000 * 60 * 60 * 26,
      isLive: false,
    },
    {
      id: genId("sr"),
      hostId: "u_maya",
      title: "ML reading group",
      subject: "CS229",
      description: "Discussing the attention paper. Join anytime.",
      capacity: 8,
      participantIds: ["u_maya", "u_diego"],
      scheduledFor: now - 1000 * 60 * 30,
      isLive: true,
    },
  ];
}

export function makeSeedSkillExchanges(): SkillExchange[] {
  const now = Date.now();
  return [
    {
      id: genId("sx"),
      authorId: "u_maya",
      type: "offer",
      skill: "Calculus tutoring",
      description: "I aced MATH51-53. Happy to walk through problems for an hour.",
      exchangeFor: "Spanish conversation practice",
      createdAt: now - 1000 * 60 * 60 * 12,
    },
    {
      id: genId("sx"),
      authorId: "u_jordan",
      type: "offer",
      skill: "SolidWorks tutorial",
      description: "Can teach you a CAD model from scratch in one session.",
      exchangeFor: "Anything! Coffee maybe?",
      createdAt: now - 1000 * 60 * 60 * 36,
    },
    {
      id: genId("sx"),
      authorId: "u_sara",
      type: "request",
      skill: "LaTeX help for thesis",
      description: "Need help setting up bibliography and figures for my thesis.",
      exchangeFor: "Free essay editing for 1 paper",
      createdAt: now - 1000 * 60 * 60 * 5,
    },
    {
      id: genId("sx"),
      authorId: "u_diego",
      type: "offer",
      skill: "Beat production in Ableton",
      description: "I'll show you how to make a lofi beat in 90 minutes.",
      exchangeFor: "Photography session for album cover",
      createdAt: now - 1000 * 60 * 60 * 50,
    },
  ];
}

export function makeSeedUniversityEvents(ownerId: string): UniversityEvent[] {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  return [
    {
      id: genId("ue"),
      ownerId,
      title: "Midterm break begins",
      kind: "holiday",
      startsAt: now + 6 * day,
      endsAt: now + 9 * day,
      notes: "No classes Mon–Wed",
    },
    {
      id: genId("ue"),
      ownerId,
      title: "Course add/drop deadline",
      kind: "deadline",
      startsAt: now + 2 * day + 14 * 60 * 60 * 1000,
      notes: "Submit through Axess by 5pm",
    },
    {
      id: genId("ue"),
      ownerId,
      title: "Finals week",
      kind: "finals",
      startsAt: now + 38 * day,
      endsAt: now + 45 * day,
    },
    {
      id: genId("ue"),
      ownerId,
      title: "Spring registration opens",
      kind: "semester",
      startsAt: now + 18 * day + 9 * 60 * 60 * 1000,
    },
  ];
}
