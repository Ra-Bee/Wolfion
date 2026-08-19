import { Search, Settings2, Plus, Edit3 } from "lucide-react";
import type { ReactNode } from "react";

function GlassIcon({
  children,
  size = 36,
  active = false,
}: {
  children: ReactNode;
  size?: number;
  active?: boolean;
}) {
  const radius = Math.round(size * 0.28);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015) 55%, rgba(0,0,0,0.35))",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 12px rgba(255,45,45,0.30)"
          : "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.6)",
      }}
      className="relative flex items-center justify-center border border-white/10 backdrop-blur-[18px]"
    >
      <div
        className="pointer-events-none absolute inset-x-1 top-0 h-1/2 rounded-t-[14px] opacity-60"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))",
        }}
      />
      <div className="relative text-white/85">{children}</div>
    </div>
  );
}

type Story = { id: number; img: number; name: string; online?: boolean };
type Conv = {
  id: number;
  img: number;
  name: string;
  last: string;
  time: string;
  unread?: number;
  muted?: boolean;
};

const stories: Story[] = [
  { id: 1, img: 12, name: "You", online: false },
  { id: 2, img: 32, name: "Aria", online: true },
  { id: 3, img: 47, name: "Kenji", online: true },
  { id: 4, img: 5, name: "Noor", online: false },
  { id: 5, img: 21, name: "Liv", online: true },
];

const convs: Conv[] = [
  {
    id: 1,
    img: 32,
    name: "Aria Vale",
    last: "Sent the revised brief — take a look.",
    time: "9:42 PM",
    unread: 2,
  },
  {
    id: 2,
    img: 47,
    name: "Kenji Park",
    last: "Voice message · 0:42",
    time: "9:14 PM",
    unread: 1,
  },
  {
    id: 3,
    img: 5,
    name: "Noor Hadid",
    last: "Confirmed for Thursday.",
    time: "8:30 PM",
  },
  {
    id: 4,
    img: 21,
    name: "Liv Andersen",
    last: "🎯 Done. Pushing the build now.",
    time: "7:11 PM",
    muted: true,
  },
  {
    id: 5,
    img: 18,
    name: "Mateo Cruz",
    last: "Let's pick this up tomorrow.",
    time: "Yesterday",
  },
  {
    id: 6,
    img: 60,
    name: "Sana Iyer",
    last: "Typing…",
    time: "Yesterday",
  },
];

export default function Messages() {
  return (
    <div
      style={{ width: 390, height: 844 }}
      className="relative overflow-hidden rounded-[44px] ring-1 ring-white/10"
    >
      {/* Base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,45,45,0.12), transparent 55%)," +
            "radial-gradient(120% 90% at 0% 100%, rgba(123,97,255,0.10), transparent 60%)," +
            "linear-gradient(180deg, #0B0B0D 0%, #0A0A0C 100%)",
        }}
      />
      <div
        className="absolute left-0 right-0 top-0 h-40 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(123,97,255,0.10), transparent 70%)",
        }}
      />

      {/* Status */}
      <div className="relative flex items-center justify-between px-7 pt-3 text-[11px] font-medium tracking-tight text-white/70">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span className="h-1 w-1 rounded-full bg-white/30" />
        </span>
      </div>

      {/* Header */}
      <div className="relative flex items-end justify-between px-5 pt-5">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
            Inbox
          </div>
          <div className="mt-1 text-[28px] font-medium leading-none tracking-tight text-white">
            Messages
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GlassIcon size={36}>
            <Search size={16} strokeWidth={1.75} />
          </GlassIcon>
          <GlassIcon size={36}>
            <Settings2 size={16} strokeWidth={1.75} />
          </GlassIcon>
        </div>
      </div>

      {/* Search field */}
      <div className="relative mt-5 px-5">
        <div
          className="flex items-center gap-2 rounded-2xl border border-white/10 px-3.5 py-2.5 backdrop-blur-[28px]"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          <Search size={14} strokeWidth={1.75} className="text-white/45" />
          <span className="text-[13px] tracking-tight text-white/40">
            Search people, messages, files
          </span>
        </div>
      </div>

      {/* Active strip */}
      <div className="relative mt-5 px-5">
        <div className="flex items-center justify-between">
          {stories.map((s) => (
            <div key={s.id} className="flex w-12 flex-col items-center">
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  padding: 2,
                  background: s.online
                    ? "linear-gradient(140deg, #FF2D2D, #7B61FF)"
                    : "linear-gradient(140deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
                  boxShadow: s.online
                    ? "0 0 12px rgba(255,45,45,0.40)"
                    : "none",
                }}
              >
                <div
                  className="h-full w-full overflow-hidden rounded-full border border-white/10"
                  style={{ background: "#0B0B0D" }}
                >
                  <img
                    src={`https://i.pravatar.cc/120?img=${s.img}`}
                    alt={s.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {s.id === 1 && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#0B0B0D]"
                    style={{
                      background:
                        "linear-gradient(160deg, #FF2D2D, #7B61FF)",
                      boxShadow: "0 0 6px rgba(255,45,45,0.6)",
                    }}
                  >
                    <Plus size={9} strokeWidth={2.5} className="text-white" />
                  </div>
                )}
              </div>
              <div className="mt-1.5 truncate text-[10.5px] font-medium tracking-tight text-white/70">
                {s.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hairline divider */}
      <div className="relative mx-5 mt-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Section label */}
      <div className="relative mt-4 flex items-center justify-between px-5">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/40">
          Recent
        </span>
        <span className="flex items-center gap-1.5 text-[10.5px] tracking-[0.06em] text-white/45">
          <span className="h-1 w-1 rounded-full bg-[#FF4D4D] shadow-[0_0_4px_#FF2D2D]" />
          3 NEW
        </span>
      </div>

      {/* Conversations */}
      <div className="relative mt-2 flex flex-col">
        {convs.map((c, i) => (
          <div key={c.id}>
            <div className="flex items-center gap-3 px-5 py-2.5">
              <div className="relative">
                <div
                  className="h-11 w-11 overflow-hidden rounded-full border border-white/10"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  <img
                    src={`https://i.pravatar.cc/120?img=${c.img}`}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[14px] font-medium tracking-tight text-white/95">
                    {c.name}
                  </span>
                  <span className="ml-2 flex-shrink-0 text-[10.5px] tracking-tight text-white/40">
                    {c.time}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span
                    className={`truncate text-[12.5px] tracking-tight ${
                      c.unread ? "text-white/75" : "text-white/45"
                    }`}
                  >
                    {c.last}
                  </span>
                  {c.unread ? (
                    <span
                      className="ml-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white"
                      style={{
                        background: "#FF2D2D",
                        boxShadow:
                          "0 0 8px rgba(255,45,45,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
                      }}
                    >
                      {c.unread}
                    </span>
                  ) : c.muted ? (
                    <span className="ml-2 text-[10.5px] tracking-[0.06em] text-white/30">
                      MUTED
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {i < convs.length - 1 && (
              <div className="mx-5 h-px bg-white/[0.05]" />
            )}
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        className="absolute bottom-10 right-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/15"
        style={{
          background:
            "radial-gradient(80% 80% at 30% 25%, rgba(255,255,255,0.40), rgba(255,255,255,0) 60%), linear-gradient(160deg, #FF2D2D 0%, #7B61FF 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 22px rgba(255,45,45,0.55), 0 0 36px rgba(123,97,255,0.35)",
        }}
      >
        <Edit3 size={18} strokeWidth={2} className="text-white" />
      </button>

      {/* Page indicator */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
        <span className="h-1 w-1.5 rounded-full bg-white/20" />
        <span className="h-1 w-4 rounded-full bg-white/55" />
        <span className="h-1 w-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
