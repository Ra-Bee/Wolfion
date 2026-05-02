import { Search, Plus, Camera, CheckCheck } from "lucide-react";

const INK = "#0B2545";
const SUB = "#4A6585";

const skyBg: React.CSSProperties = {
  background:
    "radial-gradient(110% 70% at 100% 0%, #CDB4FF 0%, rgba(205,180,255,0) 55%)," +
    "radial-gradient(120% 70% at 0% 100%, #9BF6FF 0%, rgba(155,246,255,0) 50%)," +
    "linear-gradient(180deg, #E6F7FF 0%, #BDEBFF 55%, #CDEFFF 100%)",
};

const iridescentBorder: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(155,246,255,0.9), rgba(255,255,255,0.2) 35%, rgba(205,180,255,0.85) 70%, rgba(255,200,220,0.9))",
  padding: 1.5,
  borderRadius: 26,
};

function IridescentRing({
  children,
  radius = 26,
  style,
}: {
  children: React.ReactNode;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        ...iridescentBorder,
        borderRadius: radius,
        ...style,
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          borderRadius: radius - 1.5,
          height: "100%",
          width: "100%",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function StoryAvatar({
  img,
  label,
  online,
  isMe,
}: {
  img: string;
  label: string;
  online?: boolean;
  isMe?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-[58px] shrink-0">
      <div
        className="relative w-14 h-14 rounded-full p-[2px]"
        style={{
          background:
            "conic-gradient(from 130deg, #9BF6FF, #87CEFA, #CDB4FF, #FFD6E7, #9BF6FF)",
        }}
      >
        <div
          className="w-full h-full rounded-full p-[2px]"
          style={{ background: "rgba(255,255,255,0.85)" }}
        >
          <img
            src={img}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        {isMe && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #9BF6FF, #CDB4FF)",
              boxShadow: "0 0 0 2px white",
            }}
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
        {online && !isMe && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
            style={{
              background: "#5DDBA0",
              boxShadow: "0 0 0 2px white, 0 0 8px #5DDBA0",
            }}
          />
        )}
      </div>
      <div
        className="text-[10.5px] font-medium truncate w-full text-center"
        style={{ color: INK }}
      >
        {label}
      </div>
    </div>
  );
}

function ConvRow({
  img,
  name,
  preview,
  time,
  unread,
  sent,
  active,
}: {
  img: string;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  sent?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <div
        className="relative w-12 h-12 rounded-full p-[1.5px] shrink-0"
        style={{
          background: active
            ? "conic-gradient(from 130deg, #9BF6FF, #CDB4FF, #FFD6E7, #9BF6FF)"
            : "linear-gradient(135deg, rgba(155,246,255,0.5), rgba(205,180,255,0.5))",
        }}
      >
        <img
          src={img}
          alt=""
          className="w-full h-full rounded-full object-cover"
          style={{ border: "1.5px solid white" }}
        />
        {active && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
            style={{
              background: "#5DDBA0",
              boxShadow: "0 0 0 2px white",
            }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div
            className="font-semibold truncate"
            style={{ color: INK, fontSize: 14 }}
          >
            {name}
          </div>
          <div
            className="text-[10.5px] font-medium shrink-0"
            style={{ color: unread ? "#7B5FCC" : SUB }}
          >
            {time}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div
            className="text-[12px] truncate flex items-center gap-1"
            style={{
              color: unread ? INK : SUB,
              fontWeight: unread ? 600 : 400,
            }}
          >
            {sent && (
              <CheckCheck
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#87CEFA" }}
              />
            )}
            {preview}
          </div>
          {unread ? (
            <div
              className="rounded-full text-[10px] font-bold text-white px-1.5 min-w-[18px] h-[18px] flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #87CEFA, #CDB4FF)",
                boxShadow: "0 4px 10px -3px rgba(205,180,255,0.8)",
              }}
            >
              {unread}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const stories = [
    { img: "https://i.pravatar.cc/120?img=12", label: "You", isMe: true },
    { img: "https://i.pravatar.cc/120?img=32", label: "Aria", online: true },
    { img: "https://i.pravatar.cc/120?img=47", label: "Kenji", online: true },
    { img: "https://i.pravatar.cc/120?img=23", label: "Maya", online: true },
    { img: "https://i.pravatar.cc/120?img=58", label: "Theo", online: true },
  ];

  const convs = [
    {
      img: "https://i.pravatar.cc/120?img=32",
      name: "Aria Patel",
      preview: "That study deck looks amazing ✨",
      time: "now",
      unread: 2,
      active: true,
    },
    {
      img: "https://i.pravatar.cc/120?img=47",
      name: "Kenji Tanaka",
      preview: "Library at 4? I'll grab the room",
      time: "9:24",
      unread: 1,
      active: true,
    },
    {
      img: "https://i.pravatar.cc/120?img=23",
      name: "Maya Okonkwo",
      preview: "You: Sent the notes 📎",
      time: "8:51",
      sent: true,
    },
    {
      img: "https://i.pravatar.cc/120?img=58",
      name: "Theo Bergström",
      preview: "🎵 Voice message · 0:47",
      time: "yesterday",
      unread: 4,
    },
    {
      img: "https://i.pravatar.cc/120?img=15",
      name: "Linguistics 301",
      preview: "Prof Lee: Quiz moved to Friday",
      time: "Tue",
    },
    {
      img: "https://i.pravatar.cc/120?img=44",
      name: "Sofia Reyes",
      preview: "You: see you tomorrow",
      time: "Mon",
      sent: true,
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[44px]"
      style={{
        width: 390,
        height: 844,
        ...skyBg,
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.7), 0 30px 80px -30px rgba(135,206,250,0.5)",
      }}
    >
      {/* halos */}
      <div
        className="absolute -top-24 -right-16 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(205,180,255,0.7) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute top-1/2 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(155,246,255,0.6) 0%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      {/* status bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-7 pt-3 pb-1"
        style={{ color: INK, fontSize: 13, fontWeight: 600 }}
      >
        <span>9:41</span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <span>􀙇</span>
          <span>􀛨</span>
          <span>􀛪</span>
        </span>
      </div>

      {/* page indicator dots */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 3 ? 18 : 5,
              height: 5,
              background:
                i === 3
                  ? "linear-gradient(90deg, #9BF6FF, #CDB4FF)"
                  : "rgba(11,37,69,0.2)",
            }}
          />
        ))}
      </div>

      {/* peek edges */}
      <div
        className="absolute left-0 top-24 bottom-24 w-1.5 rounded-r-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(155,246,255,0.5), rgba(205,180,255,0.5))",
        }}
      />
      <div
        className="absolute right-0 top-24 bottom-24 w-1.5 rounded-l-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(205,180,255,0.5), rgba(255,200,220,0.5))",
        }}
      />

      {/* HEADER */}
      <div className="absolute top-12 left-4 right-4 flex items-center justify-between">
        <div>
          <div
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: SUB }}
          >
            Inbox
          </div>
          <div
            className="text-[28px] leading-tight font-semibold"
            style={{
              background:
                "linear-gradient(135deg, #0B2545 0%, #5B4BB8 60%, #7B5FCC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            Messages
          </div>
        </div>
        <div style={{ ...iridescentBorder, borderRadius: 999 }}>
          <button
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 999,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
            }}
          >
            <Search className="w-4.5 h-4.5" style={{ color: INK }} />
          </button>
        </div>
      </div>

      {/* STORIES STRIP */}
      <div className="absolute top-[124px] left-0 right-0 px-4">
        <IridescentRing radius={26}>
          <div className="flex gap-1 overflow-hidden px-2.5 py-3">
            {stories.map((s, i) => (
              <StoryAvatar key={i} {...s} />
            ))}
          </div>
        </IridescentRing>
      </div>

      {/* CONVERSATION LIST */}
      <div className="absolute top-[238px] left-4 right-4 bottom-[88px]">
        <IridescentRing radius={28}>
          <div className="py-1.5">
            {convs.map((c, i) => (
              <div key={i}>
                <ConvRow {...c} />
                {i < convs.length - 1 && (
                  <div
                    className="mx-4 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(155,180,220,0.35), transparent)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </IridescentRing>
      </div>

      {/* FAB */}
      <div className="absolute bottom-7 right-5">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #9BF6FF, #87CEFA, #CDB4FF, #FFD6E7, #9BF6FF)",
            filter: "blur(14px)",
            opacity: 0.7,
            transform: "scale(1.15)",
          }}
        />
        <div
          className="relative w-14 h-14 rounded-full p-[2px]"
          style={{
            background:
              "conic-gradient(from 130deg, #9BF6FF, #87CEFA, #CDB4FF, #FFD6E7, #9BF6FF)",
          }}
        >
          <button
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 30px -8px rgba(135,206,250,0.6)",
            }}
          >
            <Plus className="w-6 h-6" style={{ color: "#5B4BB8" }} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* small camera quick action */}
      <div className="absolute bottom-9 left-5">
        <div style={{ ...iridescentBorder, borderRadius: 999 }}>
          <button
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 999,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
            }}
          >
            <Camera className="w-4.5 h-4.5" style={{ color: INK }} />
          </button>
        </div>
      </div>

      {/* home indicator */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full"
        style={{ background: "rgba(11,37,69,0.35)" }}
      />
    </div>
  );
}
