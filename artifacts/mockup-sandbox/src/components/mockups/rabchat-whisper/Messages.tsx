import { Search, Plus } from "lucide-react";

const skyBg: React.CSSProperties = {
  background:
    "linear-gradient(160deg, #E6F7FF 0%, #BDEBFF 55%, #CDEFFF 100%)",
};

const ink = "#0B2545";
const sub = "#4A6585";

function Glow({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className ?? ""}`}
      style={style}
    />
  );
}

type Active = { id: number; name: string; img: number };

const actives: Active[] = [
  { id: 1, name: "You", img: 47 },
  { id: 2, name: "Lina", img: 32 },
  { id: 3, name: "Omar", img: 12 },
  { id: 4, name: "Sara", img: 5 },
  { id: 5, name: "Kai", img: 60 },
];

type Convo = {
  id: number;
  name: string;
  preview: string;
  time: string;
  img: number;
  unread?: number;
  online?: boolean;
};

const convos: Convo[] = [
  {
    id: 1,
    name: "Lina Park",
    preview: "perfect — see you at 6 then",
    time: "9:41",
    img: 32,
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Study Group · Bio",
    preview: "Omar: I&rsquo;ll bring the notes",
    time: "9:12",
    img: 12,
    unread: 5,
  },
  {
    id: 3,
    name: "Sara Ahmed",
    preview: "thanks for the summary 🌿",
    time: "8:30",
    img: 5,
    online: true,
  },
  {
    id: 4,
    name: "Kai Tanaka",
    preview: "voice message · 0:24",
    time: "yesterday",
    img: 60,
    unread: 1,
  },
  {
    id: 5,
    name: "Mum",
    preview: "call me when you&rsquo;re free",
    time: "yesterday",
    img: 21,
  },
  {
    id: 6,
    name: "Noor Hassan",
    preview: "loved that playlist ☁︎",
    time: "Mon",
    img: 49,
  },
];

export default function Messages() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 390,
        height: 844,
        borderRadius: 44,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.55), 0 0 0 2px rgba(11,37,69,0.04)",
        ...skyBg,
      }}
    >
      {/* Diffuse halos */}
      <Glow
        style={{
          width: 340,
          height: 340,
          top: -110,
          left: -90,
          background:
            "radial-gradient(circle, rgba(155,246,255,0.5), rgba(155,246,255,0) 70%)",
        }}
      />
      <Glow
        style={{
          width: 360,
          height: 360,
          bottom: -130,
          right: -100,
          background:
            "radial-gradient(circle, rgba(205,180,255,0.45), rgba(205,180,255,0) 70%)",
        }}
      />
      <Glow
        style={{
          width: 200,
          height: 200,
          top: 380,
          right: 40,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)",
        }}
      />

      {/* SideFlow indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: i === 3 ? 14 : 4,
              height: 4,
              background:
                i === 3 ? "rgba(11,37,69,0.55)" : "rgba(11,37,69,0.18)",
            }}
          />
        ))}
      </div>

      {/* Status bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-3.5 text-[11px] font-medium tracking-wide"
        style={{ color: ink }}
      >
        <span>9:41</span>
        <span className="opacity-70">• • •</span>
      </div>

      {/* Header */}
      <div className="relative pt-14 px-7">
        <div
          className="text-[10px] uppercase tracking-[0.32em] font-light"
          style={{ color: sub }}
        >
          Inbox · 12
        </div>
        <div className="mt-1 flex items-end justify-between">
          <h1
            className="text-[34px] font-light leading-[1.05] tracking-[-0.01em]"
            style={{ color: ink }}
          >
            Messages
          </h1>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center mb-1"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <Search size={15} strokeWidth={1.4} style={{ color: ink }} />
          </button>
        </div>
      </div>

      {/* Active now */}
      <div className="relative mt-7 pl-7">
        <div
          className="text-[10px] uppercase tracking-[0.28em] font-light mb-3"
          style={{ color: sub }}
        >
          Active now
        </div>
        <div className="flex gap-4 pr-7">
          {actives.map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <div
                  className="w-[52px] h-[52px] rounded-full overflow-hidden"
                  style={{
                    border: "1px solid rgba(255,255,255,0.8)",
                  }}
                >
                  <img
                    src={`https://i.pravatar.cc/120?img=${a.img}`}
                    alt={a.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                  style={{
                    background: "#9BF6FF",
                    border: "1.5px solid #DDF3FF",
                    boxShadow: "0 0 8px rgba(155,246,255,0.7)",
                  }}
                />
              </div>
              <span
                className="text-[10px] font-light tracking-wide"
                style={{ color: sub }}
              >
                {a.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hairline */}
      <div
        className="mx-7 mt-6 h-px"
        style={{ background: "rgba(11,37,69,0.08)" }}
      />

      {/* Conversation list */}
      <div className="relative mt-3 px-3">
        {convos.map((c, idx) => (
          <div key={c.id}>
            <div className="flex items-center gap-3.5 px-4 py-3">
              <div className="relative">
                <div
                  className="w-[44px] h-[44px] rounded-full overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.7)" }}
                >
                  <img
                    src={`https://i.pravatar.cc/120?img=${c.img}`}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {c.online && (
                  <span
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                    style={{
                      background: "#9BF6FF",
                      border: "1.5px solid #DDF3FF",
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div
                    className="text-[14px] font-normal tracking-[0.005em] truncate"
                    style={{ color: ink }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="text-[10.5px] font-light tracking-wide ml-2"
                    style={{ color: sub }}
                  >
                    {c.time}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <div
                    className="text-[12px] font-light tracking-wide truncate pr-3"
                    style={{
                      color: c.unread ? ink : sub,
                      opacity: c.unread ? 0.9 : 0.75,
                    }}
                    dangerouslySetInnerHTML={{ __html: c.preview }}
                  />
                  {c.unread ? (
                    <div
                      className="min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-medium"
                      style={{
                        background: "rgba(155,246,255,0.7)",
                        color: ink,
                      }}
                    >
                      {c.unread}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {idx < convos.length - 1 && (
              <div
                className="ml-[72px] h-px"
                style={{ background: "rgba(11,37,69,0.05)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Floating new message pill */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-9">
        <button
          className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.75)",
            backdropFilter: "blur(34px) saturate(150%)",
            WebkitBackdropFilter: "blur(34px) saturate(150%)",
          }}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(11,37,69,0.92)",
              boxShadow: "0 0 22px rgba(155,246,255,0.55)",
            }}
          >
            <Plus size={14} strokeWidth={1.8} color="#fff" />
          </span>
          <span
            className="text-[12px] tracking-[0.14em] font-light uppercase"
            style={{ color: ink }}
          >
            New message
          </span>
        </button>
      </div>

      {/* Home indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-2 rounded-full"
        style={{
          width: 120,
          height: 4,
          background: "rgba(11,37,69,0.35)",
        }}
      />
    </div>
  );
}
