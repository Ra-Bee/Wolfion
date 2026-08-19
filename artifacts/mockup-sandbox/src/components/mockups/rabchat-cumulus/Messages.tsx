import { Search, Plus, CheckCheck, Camera, Mic } from "lucide-react";

const INK = "#0B2545";
const INK_2 = "#4A6585";

type Convo = {
  id: number;
  img: number;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
  sentByMe?: boolean;
  voice?: boolean;
};

const stories = [
  { img: 12, name: "You", isYou: true },
  { img: 32, name: "Aria", online: true },
  { img: 47, name: "Kenji", online: true },
  { img: 5, name: "Mira", online: true },
  { img: 23, name: "Theo", online: false },
];

const conversations: Convo[] = [
  {
    id: 1,
    img: 32,
    name: "Aria Chen",
    preview: "Sent you the lecture notes 💫",
    time: "now",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    img: 47,
    name: "Study Group · CS204",
    preview: "Kenji: ok let's meet at 4 then",
    time: "2m",
    unread: 5,
  },
  {
    id: 3,
    img: 5,
    name: "Mira Patel",
    preview: "Voice message",
    time: "18m",
    voice: true,
    online: true,
  },
  {
    id: 4,
    img: 23,
    name: "Theo Marsh",
    preview: "You: thanks, see you tomorrow",
    time: "1h",
    sentByMe: true,
  },
  {
    id: 5,
    img: 60,
    name: "Léa Dubois",
    preview: "Loved your story ✨",
    time: "3h",
    unread: 1,
  },
  {
    id: 6,
    img: 14,
    name: "Rabbi (AI)",
    preview: "Here's your daily summary →",
    time: "Mon",
  },
];

export default function Messages() {
  return (
    <div
      style={{ width: 390, height: 844 }}
      className="relative overflow-hidden rounded-[44px] ring-1 ring-white/70 shadow-[0_30px_80px_-20px_rgba(135,206,250,0.45)]"
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(170deg, #E6F7FF 0%, #BDEBFF 55%, #CDEFFF 100%)",
        }}
      />

      {/* Diffused orbs */}
      <div
        className="absolute -top-24 right-[-60px] w-[300px] h-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(155,246,255,0.85) 0%, rgba(155,246,255,0) 70%)",
          filter: "blur(22px)",
        }}
      />
      <div
        className="absolute top-[300px] -left-20 w-[280px] h-[280px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(205,180,255,0.7) 0%, rgba(205,180,255,0) 70%)",
          filter: "blur(26px)",
        }}
      />
      <div
        className="absolute bottom-[-100px] right-[-40px] w-[320px] h-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(135,206,250,0.7) 0%, rgba(135,206,250,0) 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* Faint vapor */}
      <svg viewBox="0 0 390 140" className="absolute top-8 left-0 w-full pointer-events-none" style={{ opacity: 0.45 }}>
        <defs>
          <radialGradient id="m-wisp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="60" rx="200" ry="40" fill="url(#m-wisp)" />
      </svg>

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-7 pt-3 text-[13px] font-semibold" style={{ color: INK }}>
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 rounded-[2px] border border-[#0B2545]/70 relative">
            <div className="absolute inset-0.5 right-1 bg-[#0B2545]/80 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Peek edges */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 rounded-r-full bg-white/50" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-32 rounded-l-full bg-white/50" />

      {/* Header */}
      <div className="relative px-5 pt-3 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-medium tracking-wider uppercase" style={{ color: INK_2 }}>
            Inbox
          </div>
          <div className="text-[28px] font-semibold leading-tight" style={{ color: INK }}>
            Messages
          </div>
        </div>
        <button
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.74)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.95), 0 12px 26px -10px rgba(135,206,250,0.55)",
          }}
        >
          <Search size={18} style={{ color: INK }} />
        </button>
      </div>

      {/* Search pill */}
      <div className="relative px-5 mt-3">
        <div
          className="rounded-full flex items-center gap-2 px-4 py-2.5"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 24px -10px rgba(135,206,250,0.4)",
          }}
        >
          <Search size={14} style={{ color: INK_2 }} />
          <span className="text-[13px]" style={{ color: "#4A6585aa" }}>
            Search people, groups, AI…
          </span>
        </div>
      </div>

      {/* Active now strip */}
      <div className="relative px-5 mt-4">
        <div className="text-[11px] font-medium mb-2 flex items-center justify-between" style={{ color: INK_2 }}>
          <span className="uppercase tracking-wider">Active now</span>
          <span className="text-[#87CEFA] font-semibold normal-case tracking-normal">See all</span>
        </div>
        <div className="flex gap-3.5 overflow-hidden">
          {stories.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 w-[58px]">
              <div className="relative">
                {/* Halo */}
                <div
                  className="absolute -inset-1.5 rounded-full"
                  style={{
                    background:
                      i === 0
                        ? "radial-gradient(circle, rgba(205,180,255,0.7) 0%, rgba(205,180,255,0) 70%)"
                        : "radial-gradient(circle, rgba(155,246,255,0.7) 0%, rgba(155,246,255,0) 70%)",
                    filter: "blur(4px)",
                  }}
                />
                <div
                  className="relative w-[52px] h-[52px] rounded-full p-[2px]"
                  style={{
                    background: s.isYou
                      ? "linear-gradient(135deg,#CDB4FF,#9BF6FF)"
                      : s.online
                      ? "linear-gradient(135deg,#9BF6FF,#87CEFA)"
                      : "rgba(255,255,255,0.85)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <img
                    src={`https://i.pravatar.cc/120?img=${s.img}`}
                    alt={s.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                {s.isYou ? (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                    style={{
                      background: "linear-gradient(135deg,#87CEFA,#9BF6FF)",
                    }}
                  >
                    <Plus size={11} className="text-white" strokeWidth={3} />
                  </div>
                ) : s.online ? (
                  <div className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-[#34D399] border-2 border-white" />
                ) : null}
              </div>
              <span
                className="text-[10.5px] font-medium truncate w-full text-center"
                style={{ color: INK }}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="relative px-4 mt-4">
        <div
          className="rounded-[28px] p-2"
          style={{
            background: "rgba(255,255,255,0.66)",
            backdropFilter: "blur(34px)",
            WebkitBackdropFilter: "blur(34px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.95), 0 24px 50px -22px rgba(135,206,250,0.55)",
          }}
        >
          <div className="divide-y divide-white/60">
            {conversations.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-2.5 py-2.5">
                <div className="relative">
                  <div
                    className="absolute -inset-1 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(155,246,255,0.55) 0%, rgba(155,246,255,0) 70%)",
                      filter: "blur(4px)",
                    }}
                  />
                  <img
                    src={`https://i.pravatar.cc/120?img=${c.img}`}
                    alt={c.name}
                    className="relative w-11 h-11 rounded-full object-cover border-2 border-white"
                    style={{ boxShadow: "0 6px 14px -6px rgba(135,206,250,0.6)" }}
                  />
                  {c.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#34D399] border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="text-[14px] font-semibold truncate"
                      style={{ color: INK }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="text-[10.5px] flex-shrink-0"
                      style={{ color: c.unread ? "#87CEFA" : INK_2 }}
                    >
                      {c.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {c.sentByMe && <CheckCheck size={13} className="text-[#87CEFA] flex-shrink-0" />}
                    {c.voice && <Mic size={12} className="text-[#87CEFA] flex-shrink-0" />}
                    <span
                      className="text-[12px] truncate"
                      style={{
                        color: c.unread ? INK : INK_2,
                        fontWeight: c.unread ? 600 : 400,
                      }}
                    >
                      {c.preview}
                    </span>
                  </div>
                </div>

                {c.unread ? (
                  <div
                    className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10.5px] font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg,#87CEFA 0%,#9BF6FF 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 14px -4px rgba(135,206,250,0.7)",
                    }}
                  >
                    {c.unread}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating new-message FAB */}
      <button
        className="absolute right-5 bottom-10 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full"
        style={{
          background:
            "linear-gradient(135deg,#87CEFA 0%,#9BF6FF 60%,#CDB4FF 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.7), 0 18px 36px -10px rgba(135,206,250,0.85), 0 0 30px rgba(155,246,255,0.5)",
          color: "white",
        }}
      >
        {/* halo */}
        <span
          className="absolute inset-0 rounded-full -z-10"
          style={{
            background:
              "radial-gradient(circle, rgba(155,246,255,0.6) 0%, rgba(155,246,255,0) 70%)",
            filter: "blur(10px)",
          }}
        />
        <Plus size={18} strokeWidth={2.5} />
        <span className="text-[13.5px] font-semibold">New chat</span>
      </button>

      {/* Camera quick action (small) */}
      <button
        className="absolute left-5 bottom-10 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.74)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.95), 0 14px 28px -10px rgba(135,206,250,0.55)",
        }}
      >
        <Camera size={18} style={{ color: INK }} />
      </button>

      {/* Page indicator */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="rounded-full"
            style={{
              width: i === 3 ? 18 : 5,
              height: 5,
              background:
                i === 3 ? "linear-gradient(90deg,#87CEFA,#9BF6FF)" : "rgba(11,37,69,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
