import {
  Search,
  SquarePen,
  Settings2,
  CheckCheck,
  Mic,
  Camera,
  Image as ImageIcon,
} from "lucide-react";

const TEXT = "#F5F5F5";
const SUB = "rgba(245,245,245,0.55)";
const SUB2 = "rgba(245,245,245,0.75)";

const bezelStyle: React.CSSProperties = {
  background:
    "radial-gradient(110% 70% at 100% -10%, rgba(255,45,45,0.45) 0%, rgba(255,45,45,0) 55%)," +
    "radial-gradient(110% 70% at -10% 110%, rgba(123,97,255,0.40) 0%, rgba(123,97,255,0) 55%)," +
    "linear-gradient(180deg, #0B0B0D 0%, #121216 60%, #0B0B0D 100%)",
  boxShadow:
    "inset 0 0 0 1px rgba(255,255,255,0.07), 0 30px 80px -30px rgba(255,45,45,0.45)",
};

const glassPanel: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
  backdropFilter: "blur(36px) saturate(140%)",
  WebkitBackdropFilter: "blur(36px) saturate(140%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.06), 0 14px 40px -16px rgba(0,0,0,0.7)",
};

function GlassIcon({
  children,
  size = 36,
  active,
  radius = 11,
}: {
  children: React.ReactNode;
  size?: number;
  active?: boolean;
  radius?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: active
          ? "linear-gradient(160deg, rgba(255,77,77,0.55) 0%, rgba(123,97,255,0.45) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 60%, rgba(255,77,77,0.08) 100%)",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 18px -2px rgba(255,45,45,0.7)"
          : "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.08), 0 6px 14px -6px rgba(0,0,0,0.6)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: radius,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%)",
          opacity: 0.7,
        }}
      />
      <div className="relative" style={{ color: TEXT }}>
        {children}
      </div>
    </div>
  );
}

function StoryAvatar({
  img,
  name,
  online,
  isYou,
}: {
  img: number;
  name: string;
  online?: boolean;
  isYou?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          padding: 2,
          background: online
            ? "conic-gradient(from 140deg, #FF2D2D, #FF4D4D, #7B61FF, #FF2D2D)"
            : "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
          boxShadow: online
            ? "0 0 18px -2px rgba(255,45,45,0.85)"
            : "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden"
          style={{ background: "#0B0B0D" }}
        >
          <img
            src={`https://i.pravatar.cc/120?img=${img}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        {isYou && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #FF2D2D 0%, #7B61FF 100%)",
              boxShadow:
                "0 0 12px -1px rgba(255,45,45,0.9), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            <span
              className="text-white"
              style={{ fontSize: 14, lineHeight: 1, fontWeight: 700 }}
            >
              +
            </span>
          </div>
        )}
        {online && !isYou && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
            style={{
              background: "#FF4D4D",
              boxShadow:
                "0 0 10px #FF2D2D, 0 0 0 2px #0B0B0D",
            }}
          />
        )}
      </div>
      <div
        className="text-[10px] font-medium max-w-[60px] truncate"
        style={{ color: SUB2 }}
      >
        {isYou ? "Your story" : name}
      </div>
    </div>
  );
}

type LastMsg = {
  text: string;
  preview?: "text" | "voice" | "image" | "you";
};

function Row({
  img,
  name,
  msg,
  time,
  unread,
  online,
  pinned,
}: {
  img: number;
  name: string;
  msg: LastMsg;
  time: string;
  unread?: number;
  online?: boolean;
  pinned?: boolean;
}) {
  const previewIcon =
    msg.preview === "voice" ? (
      <Mic className="w-3 h-3" strokeWidth={2.4} style={{ color: "#FF6A6A" }} />
    ) : msg.preview === "image" ? (
      <ImageIcon
        className="w-3 h-3"
        strokeWidth={2.4}
        style={{ color: "#FF6A6A" }}
      />
    ) : msg.preview === "you" ? (
      <CheckCheck
        className="w-3.5 h-3.5"
        strokeWidth={2.4}
        style={{ color: "#FF6A6A" }}
      />
    ) : null;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div
        className="relative w-12 h-12 rounded-full shrink-0"
        style={{
          padding: online ? 2 : 1,
          background: online
            ? "conic-gradient(from 140deg, #FF2D2D, #FF4D4D, #7B61FF, #FF2D2D)"
            : "rgba(255,255,255,0.08)",
          boxShadow: online ? "0 0 14px -2px rgba(255,45,45,0.8)" : "none",
        }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden"
          style={{ background: "#0B0B0D" }}
        >
          <img
            src={`https://i.pravatar.cc/120?img=${img}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        {online && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
            style={{
              background: "#FF4D4D",
              boxShadow: "0 0 8px #FF2D2D, 0 0 0 2px #0B0B0D",
            }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div
            className="truncate"
            style={{ color: TEXT, fontSize: 14.5, fontWeight: 600 }}
          >
            {name}
          </div>
          {pinned && (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#FF4D4D",
                boxShadow: "0 0 6px #FF2D2D",
              }}
            />
          )}
        </div>
        <div
          className="flex items-center gap-1 mt-0.5 truncate"
          style={{ color: SUB, fontSize: 12 }}
        >
          {previewIcon}
          <span className="truncate">{msg.text}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div
          style={{
            color: unread ? "#FF6A6A" : SUB,
            fontSize: 10.5,
            fontWeight: unread ? 700 : 500,
          }}
        >
          {time}
        </div>
        {unread ? (
          <div
            className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #FF2D2D 0%, #FF4D4D 60%, #7B61FF 100%)",
              boxShadow:
                "0 0 14px -1px rgba(255,45,45,0.95), inset 0 1px 0 rgba(255,255,255,0.4)",
              color: "white",
              fontSize: 10.5,
              fontWeight: 800,
            }}
          >
            {unread}
          </div>
        ) : (
          <div className="h-5" />
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <div
      style={{ width: 390, height: 844, ...bezelStyle }}
      className="relative overflow-hidden rounded-[44px]"
    >
      {/* aurora wash */}
      <div
        className="absolute -top-24 left-0 right-0 h-72 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 100% at 60% 0%, rgba(255,45,45,0.45) 0%, rgba(255,45,45,0) 65%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,97,255,0.55) 0%, transparent 65%)",
          filter: "blur(12px)",
        }}
      />

      {/* status bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-7 pt-3 pb-1 z-10"
        style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}
      >
        <span>9:41</span>
        <span style={{ color: SUB, fontSize: 10, letterSpacing: 1.5 }}>
          ●●●● 5G
        </span>
      </div>

      {/* page indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 0 ? 18 : 5,
              height: 5,
              background:
                i === 0
                  ? "linear-gradient(90deg, #FF2D2D, #7B61FF)"
                  : "rgba(245,245,245,0.22)",
              boxShadow: i === 0 ? "0 0 8px rgba(255,45,45,0.8)" : "none",
            }}
          />
        ))}
      </div>

      {/* peek edges */}
      <div
        className="absolute left-0 top-32 bottom-32 w-1 rounded-r-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,45,45,0.6), rgba(123,97,255,0.6))",
          boxShadow: "0 0 12px rgba(255,45,45,0.6)",
        }}
      />
      <div
        className="absolute right-0 top-32 bottom-32 w-1 rounded-l-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(123,97,255,0.6), rgba(255,45,45,0.6))",
          boxShadow: "0 0 12px rgba(123,97,255,0.6)",
        }}
      />

      {/* HEADER */}
      <div className="absolute top-12 left-4 right-4 flex items-center justify-between">
        <div>
          <div
            style={{
              color: TEXT,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            Messages
          </div>
          <div
            className="flex items-center gap-1.5 mt-1.5"
            style={{ color: SUB, fontSize: 11 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#FF4D4D",
                boxShadow: "0 0 8px #FF2D2D",
              }}
            />
            12 active · 4 unread
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GlassIcon size={36} radius={12}>
            <Settings2 className="w-4 h-4" strokeWidth={2.2} />
          </GlassIcon>
          <GlassIcon size={36} radius={12}>
            <Search className="w-4 h-4" strokeWidth={2.2} />
          </GlassIcon>
        </div>
      </div>

      {/* SEARCH */}
      <div
        className="absolute top-[112px] left-4 right-4 flex items-center gap-2 px-3 py-2.5"
        style={{ ...glassPanel, borderRadius: 16 }}
      >
        <Search
          className="w-4 h-4"
          strokeWidth={2.4}
          style={{ color: SUB }}
        />
        <span style={{ color: SUB, fontSize: 13 }}>
          Search people, messages…
        </span>
        <div className="flex-1" />
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,45,45,0.35), rgba(123,97,255,0.35))",
            color: TEXT,
            boxShadow: "inset 0 0 0 1px rgba(255,77,77,0.4)",
          }}
        >
          ⌘ K
        </span>
      </div>

      {/* ACTIVE NOW STRIP */}
      <div className="absolute top-[170px] left-4 right-4">
        <div
          className="flex items-center justify-between mb-2"
          style={{ color: SUB, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5 }}
        >
          <span>ACTIVE NOW</span>
          <span style={{ color: "#FF6A6A" }}>SEE ALL</span>
        </div>
        <div className="flex items-start gap-3 overflow-hidden">
          <StoryAvatar img={12} name="You" isYou online />
          <StoryAvatar img={32} name="Aria" online />
          <StoryAvatar img={47} name="Kenji" online />
          <StoryAvatar img={56} name="Mara" online />
          <StoryAvatar img={5} name="Liu" />
          <StoryAvatar img={22} name="Theo" />
        </div>
      </div>

      {/* CONVERSATIONS */}
      <div
        className="absolute left-4 right-4"
        style={{
          top: 282,
          bottom: 96,
          ...glassPanel,
          borderRadius: 22,
          padding: 4,
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col">
          <Row
            img={32}
            name="Aria Voss"
            msg={{ text: "Final raid roster locked in 🔥", preview: "text" }}
            time="now"
            unread={3}
            online
            pinned
          />
          <div
            className="mx-3 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <Row
            img={47}
            name="Kenji Otsuka"
            msg={{ text: "Voice message · 0:42", preview: "voice" }}
            time="9:12"
            unread={1}
            online
          />
          <div
            className="mx-3 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <Row
            img={56}
            name="Mara Sinclair"
            msg={{ text: "Sent the brief — let me know", preview: "you" }}
            time="8:48"
            online
          />
          <div
            className="mx-3 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <Row
            img={15}
            name="Studio Squad"
            msg={{ text: "Liu: shared 4 photos", preview: "image" }}
            time="Yest"
            unread={12}
          />
          <div
            className="mx-3 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <Row
            img={22}
            name="Theo Park"
            msg={{ text: "Yo, queue up at 10?", preview: "text" }}
            time="Yest"
          />
          <div
            className="mx-3 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <Row
            img={9}
            name="Rabbi · AI"
            msg={{
              text: "Your daily brief is ready ✨",
              preview: "text",
            }}
            time="Mon"
          />
        </div>
      </div>

      {/* FAB */}
      <button
        className="absolute right-5 flex items-center gap-2 px-1 py-1 pr-4"
        style={{
          bottom: 24,
          borderRadius: 999,
          background:
            "linear-gradient(135deg, #FF2D2D 0%, #FF4D4D 45%, #7B61FF 100%)",
          boxShadow:
            "0 0 30px -2px rgba(255,45,45,0.95), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 0 1px rgba(255,255,255,0.18)",
          color: "white",
        }}
      >
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.20)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <SquarePen className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </span>
        <span className="text-[13px] font-bold tracking-wide">New chat</span>
      </button>

      {/* secondary FAB - camera */}
      <button
        className="absolute left-5 flex items-center justify-center"
        style={{
          bottom: 24,
          width: 52,
          height: 52,
          borderRadius: 999,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
          backdropFilter: "blur(36px) saturate(140%)",
          WebkitBackdropFilter: "blur(36px) saturate(140%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 22px -6px rgba(0,0,0,0.7)",
          color: TEXT,
        }}
      >
        <Camera className="w-5 h-5" strokeWidth={2.2} />
      </button>

      {/* home indicator */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full"
        style={{ background: "rgba(245,245,245,0.35)" }}
      />
    </div>
  );
}
