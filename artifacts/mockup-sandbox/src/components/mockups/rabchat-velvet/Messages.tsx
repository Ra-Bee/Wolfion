import {
  Search,
  Plus,
  Camera,
  Check,
  CheckCheck,
  Mic,
  Image as ImageIcon,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

const INK = "#F5F5F5";
const SUB = "rgba(245,245,245,0.55)";

const velvetBg: React.CSSProperties = {
  background:
    "radial-gradient(60% 38% at 92% -4%, rgba(255,45,45,0.55) 0%, rgba(255,45,45,0) 60%)," +
    "radial-gradient(70% 50% at -10% 105%, rgba(123,97,255,0.65) 0%, rgba(123,97,255,0) 60%)," +
    "radial-gradient(40% 30% at 50% 25%, rgba(180,90,220,0.18) 0%, rgba(0,0,0,0) 70%)," +
    "linear-gradient(180deg, #0B0B0D 0%, #121216 60%, #0B0B0D 100%)",
};

const jewelBorder: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255,77,77,0.55), rgba(255,255,255,0.18) 38%, rgba(123,97,255,0.55) 70%, rgba(255,255,255,0.08))",
  padding: 1,
  borderRadius: 22,
};

const glassPanel: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(123,97,255,0.06) 100%)",
  backdropFilter: "blur(36px) saturate(160%)",
  WebkitBackdropFilter: "blur(36px) saturate(160%)",
  borderRadius: 21,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(123,97,255,0.18), 0 12px 30px -14px rgba(0,0,0,0.7)",
};

function JewelRing({
  children,
  radius = 22,
  className,
  style,
}: {
  children: React.ReactNode;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ ...jewelBorder, borderRadius: radius, ...style }}
    >
      <div
        style={{
          ...glassPanel,
          borderRadius: radius - 1,
          height: "100%",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function GlassIcon({
  children,
  size = 36,
  active = false,
  radius = 11,
}: {
  children: React.ReactNode;
  size?: number;
  active?: boolean;
  radius?: number;
}) {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: active
          ? "linear-gradient(160deg, rgba(255,77,77,0.35) 0%, rgba(123,97,255,0.35) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, rgba(123,97,255,0.10) 100%)",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px -6px rgba(255,77,77,0.55), 0 0 0 1px rgba(255,255,255,0.10)"
          : "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {children}
      <div
        className="absolute inset-x-1 top-0.5 h-1/2 pointer-events-none"
        style={{
          borderRadius: radius - 2,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
    </div>
  );
}

function StoryAvatar({
  img,
  name,
  online = false,
  isMe = false,
}: {
  img: number;
  name: string;
  online?: boolean;
  isMe?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 w-14">
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: online
            ? "conic-gradient(from 130deg, #FF2D2D, #C13AB8, #7B61FF, #FF4D4D, #FF2D2D)"
            : "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(123,97,255,0.18))",
          padding: 2,
          boxShadow: online
            ? "0 0 14px rgba(255,77,77,0.65), inset 0 1px 0 rgba(255,255,255,0.4)"
            : "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden relative"
          style={{ background: "#121216" }}
        >
          <img
            src={`https://i.pravatar.cc/120?img=${img}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        {isMe && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FF2D2D, #7B61FF)",
              boxShadow:
                "0 0 10px rgba(255,77,77,0.7), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <div
        className="text-[10px] truncate w-full text-center"
        style={{ color: INK, fontWeight: 600 }}
      >
        {name}
      </div>
    </div>
  );
}

function Row({
  img,
  name,
  msg,
  time,
  unread = 0,
  online = false,
  read = false,
  sentByMe = false,
  pinned = false,
  voice = false,
  photo = false,
}: {
  img: number;
  name: string;
  msg: string;
  time: string;
  unread?: number;
  online?: boolean;
  read?: boolean;
  sentByMe?: boolean;
  pinned?: boolean;
  voice?: boolean;
  photo?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div
        className="relative w-12 h-12 rounded-full"
        style={{
          background: online
            ? "conic-gradient(from 130deg, #FF2D2D, #7B61FF, #FF2D2D)"
            : "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(123,97,255,0.16))",
          padding: online ? 1.5 : 1,
          boxShadow: online ? "0 0 12px rgba(255,77,77,0.55)" : undefined,
        }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden"
          style={{ background: "#121216" }}
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
              background: "#5DDBA0",
              boxShadow: "0 0 8px #5DDBA0, inset 0 1px 0 rgba(255,255,255,0.5)",
              border: "2px solid #121216",
            }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div
            className="truncate"
            style={{ color: INK, fontSize: 14.5, fontWeight: 600 }}
          >
            {name}
          </div>
          {pinned && (
            <span
              className="text-[9px] px-1 py-0.5 rounded font-bold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,45,45,0.25), rgba(123,97,255,0.25))",
                color: INK,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              }}
            >
              PIN
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1 mt-0.5 text-[12px]"
          style={{ color: unread > 0 ? "rgba(245,245,245,0.85)" : SUB }}
        >
          {sentByMe &&
            (read ? (
              <CheckCheck
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#7B61FF" }}
                strokeWidth={2.5}
              />
            ) : (
              <Check
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: SUB }}
                strokeWidth={2.5}
              />
            ))}
          {voice && (
            <Mic
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "#FF4D4D" }}
              strokeWidth={2.5}
            />
          )}
          {photo && (
            <ImageIcon
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "#7B61FF" }}
              strokeWidth={2.5}
            />
          )}
          <span className="truncate" style={{ fontWeight: unread > 0 ? 600 : 400 }}>
            {msg}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div
          className="text-[10.5px]"
          style={{ color: unread > 0 ? "#FF4D4D" : SUB, fontWeight: 600 }}
        >
          {time}
        </div>
        {unread > 0 ? (
          <div
            className="min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 text-[10.5px] font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, #FF2D2D 0%, #7B61FF 100%)",
              boxShadow:
                "0 0 12px rgba(255,77,77,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
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
      className="relative overflow-hidden rounded-[44px]"
      style={{
        width: 390,
        height: 844,
        ...velvetBg,
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px -30px rgba(123,97,255,0.55)",
      }}
    >
      {/* diffused orbs */}
      <div
        className="absolute -top-24 -right-16 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,45,0.55) 0%, transparent 65%)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-16 w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,97,255,0.7) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      {/* aurora behind header */}
      <div
        className="absolute top-10 left-0 right-0 h-32 pointer-events-none opacity-70"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 0%, rgba(180,90,220,0.35) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* status bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-7 pt-3 pb-1 z-10"
        style={{ color: INK, fontSize: 13, fontWeight: 600 }}
      >
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
          <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
          <BatteryFull className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </div>

      {/* page indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 2 ? 18 : 5,
              height: 5,
              background:
                i === 2
                  ? "linear-gradient(90deg, #FF2D2D, #7B61FF)"
                  : "rgba(245,245,245,0.22)",
              boxShadow:
                i === 2 ? "0 0 10px rgba(255,77,77,0.6)" : undefined,
            }}
          />
        ))}
      </div>

      {/* peek edges */}
      <div
        className="absolute left-0 top-28 bottom-28 w-1.5 rounded-r-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,45,45,0.55), rgba(123,97,255,0.55))",
          boxShadow: "0 0 16px rgba(255,77,77,0.4)",
        }}
      />
      <div
        className="absolute right-0 top-28 bottom-28 w-1.5 rounded-l-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(123,97,255,0.55), rgba(255,45,45,0.55))",
          boxShadow: "0 0 16px rgba(123,97,255,0.4)",
        }}
      />

      {/* HEADER */}
      <div className="absolute top-12 left-4 right-4 flex items-center justify-between">
        <div>
          <div
            className="text-[26px] font-bold leading-none"
            style={{
              background:
                "linear-gradient(135deg, #F5F5F5 0%, #FFB8B8 50%, #C7B8FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: -0.5,
            }}
          >
            Messages
          </div>
          <div
            className="text-[11px] mt-1 flex items-center gap-1.5"
            style={{ color: SUB }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#5DDBA0",
                boxShadow: "0 0 8px #5DDBA0",
              }}
            />
            12 online · 4 unread
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GlassIcon size={38} radius={12}>
            <Search className="w-4 h-4" style={{ color: INK }} />
          </GlassIcon>
          <GlassIcon size={38} radius={12}>
            <Camera className="w-4 h-4" style={{ color: INK }} />
          </GlassIcon>
        </div>
      </div>

      {/* SEARCH PILL */}
      <div className="absolute top-[110px] left-4 right-4">
        <JewelRing radius={20}>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Search className="w-4 h-4" style={{ color: SUB }} strokeWidth={2.5} />
            <div className="flex-1 text-[12.5px]" style={{ color: SUB }}>
              Search messages, people…
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,45,45,0.22), rgba(123,97,255,0.22))",
                color: INK,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              }}
            >
              ⌘ K
            </span>
          </div>
        </JewelRing>
      </div>

      {/* ACTIVE NOW */}
      <div className="absolute top-[170px] left-0 right-0">
        <div
          className="px-4 text-[10px] font-semibold tracking-[0.18em] mb-2"
          style={{ color: SUB }}
        >
          ACTIVE NOW
        </div>
        <div className="flex gap-3 px-4 overflow-hidden">
          <StoryAvatar img={12} name="You" isMe />
          <StoryAvatar img={32} name="Aria" online />
          <StoryAvatar img={45} name="Kai" online />
          <StoryAvatar img={5} name="Mira" online />
          <StoryAvatar img={68} name="Leo" />
          <StoryAvatar img={23} name="Zoe" online />
        </div>
      </div>

      {/* CONVERSATION LIST */}
      <div className="absolute top-[290px] left-3 right-3 bottom-[100px]">
        <JewelRing radius={26}>
          <div className="py-1.5">
            <Row
              img={32}
              name="Aria Stone"
              msg="loved that — see you at 8 ✨"
              time="now"
              unread={3}
              online
              pinned
            />
            <div className="h-px mx-3" style={{ background: "rgba(255,255,255,0.06)" }} />
            <Row
              img={45}
              name="Kai · Design"
              msg="Voice message"
              time="9:32"
              unread={1}
              online
              voice
            />
            <div className="h-px mx-3" style={{ background: "rgba(255,255,255,0.06)" }} />
            <Row
              img={5}
              name="Mira"
              msg="okay sending the brief now"
              time="9:14"
              sentByMe
              read
              online
            />
            <div className="h-px mx-3" style={{ background: "rgba(255,255,255,0.06)" }} />
            <Row
              img={68}
              name="Leo · Founders"
              msg="📷 Photo"
              time="8:48"
              photo
            />
            <div className="h-px mx-3" style={{ background: "rgba(255,255,255,0.06)" }} />
            <Row
              img={23}
              name="Zoe Park"
              msg="thanks! talk tomorrow"
              time="Yest"
              sentByMe
              read
            />
          </div>
        </JewelRing>
      </div>

      {/* FAB */}
      <div className="absolute bottom-20 right-5">
        <button
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "conic-gradient(from 130deg, #FF2D2D, #FF4D4D, #C13AB8, #7B61FF, #FF2D2D)",
            boxShadow:
              "0 16px 38px -8px rgba(255,45,45,0.7), 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={3} />
          <div
            className="absolute inset-1 rounded-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)",
            }}
          />
        </button>
      </div>

      {/* home indicator */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full"
        style={{ background: "rgba(245,245,245,0.4)" }}
      />
    </div>
  );
}
