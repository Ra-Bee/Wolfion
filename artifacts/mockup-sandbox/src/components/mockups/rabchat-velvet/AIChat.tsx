import {
  Sparkles,
  Mic,
  Paperclip,
  ArrowUp,
  MoreHorizontal,
  Languages,
  BookOpen,
  FileText,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

const INK = "#F5F5F5";
const SUB = "rgba(245,245,245,0.55)";

const velvetBg: React.CSSProperties = {
  background:
    "radial-gradient(60% 38% at 88% -4%, rgba(255,45,45,0.55) 0%, rgba(255,45,45,0) 60%)," +
    "radial-gradient(70% 50% at -10% 105%, rgba(123,97,255,0.6) 0%, rgba(123,97,255,0) 60%)," +
    "radial-gradient(40% 30% at 50% 30%, rgba(180,90,220,0.18) 0%, rgba(0,0,0,0) 70%)," +
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

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2 max-w-[86%]">
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
        style={{
          background:
            "conic-gradient(from 210deg, #FF2D2D, #B042D6, #7B61FF, #FF2D2D)",
          boxShadow:
            "0 6px 18px -4px rgba(123,97,255,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
      </div>
      <div style={{ ...jewelBorder, borderRadius: 18 }}>
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
            backdropFilter: "blur(30px) saturate(160%)",
            WebkitBackdropFilter: "blur(30px) saturate(160%)",
            borderRadius: 17,
            padding: "10px 14px",
            color: INK,
            fontSize: 13,
            lineHeight: 1.5,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(123,97,255,0.18)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function UserBubble({
  text,
  attachment,
}: {
  text: string;
  attachment?: { name: string; meta: string };
}) {
  return (
    <div className="ml-auto max-w-[84%] flex flex-col items-end gap-1.5">
      {attachment && (
        <div style={{ ...jewelBorder, borderRadius: 14 }}>
          <div
            className="flex items-center gap-2 px-2.5 py-1.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,45,45,0.18), rgba(123,97,255,0.18))",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              borderRadius: 13,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #FF2D2D 0%, #7B61FF 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <FileText className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div style={{ color: INK, fontSize: 11, fontWeight: 600 }}>
                {attachment.name}
              </div>
              <div style={{ color: SUB, fontSize: 10 }}>{attachment.meta}</div>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          background:
            "linear-gradient(135deg, #FF2D2D 0%, #C13AB8 50%, #7B61FF 100%)",
          borderRadius: 18,
          padding: "10px 14px",
          color: "white",
          fontSize: 13,
          lineHeight: 1.5,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 26px -10px rgba(255,45,45,0.6), 0 0 0 1px rgba(255,77,77,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Chip({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div style={{ ...jewelBorder, borderRadius: 999 }}>
      <button
        className="flex items-center gap-1.5"
        style={{
          background: active
            ? "linear-gradient(135deg, rgba(255,45,45,0.28), rgba(123,97,255,0.28))"
            : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderRadius: 999,
          padding: "7px 12px 7px 8px",
          color: INK,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: "nowrap",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{
            background: active
              ? "linear-gradient(135deg, #FF2D2D, #7B61FF)"
              : "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(123,97,255,0.18))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          {icon}
        </span>
        {label}
      </button>
    </div>
  );
}

export default function AIChat() {
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
        className="absolute -bottom-28 -left-16 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,97,255,0.65) 0%, transparent 65%)",
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
              width: i === 1 ? 18 : 5,
              height: 5,
              background:
                i === 1
                  ? "linear-gradient(90deg, #FF2D2D, #7B61FF)"
                  : "rgba(245,245,245,0.22)",
              boxShadow:
                i === 1 ? "0 0 10px rgba(255,77,77,0.6)" : undefined,
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
      <div className="absolute top-12 left-4 right-4">
        <JewelRing radius={24}>
          <div className="flex items-center gap-3 px-3 py-3">
            <div
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "conic-gradient(from 140deg, #FF2D2D, #C13AB8, #7B61FF, #FF4D4D, #FF2D2D)",
                boxShadow:
                  "0 8px 22px -6px rgba(123,97,255,0.85), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              <div
                className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, white, transparent 70%)",
                  opacity: 0.85,
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="flex items-center gap-1.5"
                style={{ color: INK, fontSize: 15, fontWeight: 700 }}
              >
                Rabbi
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF2D2D, #7B61FF)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                  }}
                >
                  AI
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 mt-0.5"
                style={{ color: SUB, fontSize: 11 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#5DDBA0",
                    boxShadow: "0 0 8px #5DDBA0",
                  }}
                />
                online · ready to help
              </div>
            </div>
            <GlassIcon size={34} radius={11}>
              <MoreHorizontal className="w-4 h-4" style={{ color: INK }} />
            </GlassIcon>
          </div>
        </JewelRing>
      </div>

      {/* CONVERSATION */}
      <div className="absolute top-[150px] left-4 right-4 bottom-[180px] flex flex-col gap-3 overflow-hidden">
        <div
          className="text-center text-[10px] font-medium tracking-[0.18em]"
          style={{ color: SUB }}
        >
          TODAY · 09:38
        </div>

        <UserBubble text="Hey Rabbi — summarize this lecture for me?" />
        <UserBubble
          text="Just the key points ✨"
          attachment={{ name: "Lecture_07_Neural.pdf", meta: "1.4 MB · 24 pages" }}
        />

        <AssistantBubble text="Of course. Here are the 3 takeaways from your lecture:" />

        <div className="flex items-end gap-2 max-w-[86%] -mt-1">
          <div className="w-7 shrink-0" />
          <div style={{ ...jewelBorder, borderRadius: 18 }}>
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
                backdropFilter: "blur(30px) saturate(160%)",
                WebkitBackdropFilter: "blur(30px) saturate(160%)",
                borderRadius: 17,
                padding: "10px 14px",
                color: INK,
                fontSize: 12.5,
                lineHeight: 1.55,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(123,97,255,0.18)",
              }}
            >
              {[
                "Backpropagation tunes weights via gradient descent.",
                "Activation functions add non-linearity (ReLU dominates).",
                "Dropout & regularization curb overfitting.",
              ].map((line, i) => (
                <div className="flex gap-2 mt-0.5 first:mt-0" key={i}>
                  <span
                    className="font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF4D4D, #7B61FF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {i + 1}.
                  </span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        <UserBubble text="Perfect — quiz me on point 2?" />
      </div>

      {/* BOTTOM AREA: chips + input */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-col gap-2.5">
        <div className="flex gap-2 overflow-hidden">
          <Chip
            icon={<Sparkles className="w-3 h-3 text-white" strokeWidth={2.8} />}
            label="Summarize"
            active
          />
          <Chip
            icon={<BookOpen className="w-3 h-3 text-white" strokeWidth={2.5} />}
            label="Explain"
          />
          <Chip
            icon={<Languages className="w-3 h-3 text-white" strokeWidth={2.5} />}
            label="Translate"
          />
        </div>

        <JewelRing radius={26}>
          <div className="flex items-center gap-2 px-2 py-2">
            <GlassIcon size={36} radius={12}>
              <Paperclip className="w-4 h-4" style={{ color: INK }} />
            </GlassIcon>
            <div
              className="flex-1 text-[13px] px-1"
              style={{ color: SUB }}
            >
              Ask Rabbi anything…
            </div>
            <GlassIcon size={36} radius={12}>
              <Mic className="w-4 h-4" style={{ color: INK }} />
            </GlassIcon>
            <button
              className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "conic-gradient(from 130deg, #FF2D2D, #FF4D4D, #C13AB8, #7B61FF, #FF2D2D)",
                boxShadow:
                  "0 10px 26px -6px rgba(255,45,45,0.7), 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <ArrowUp className="w-4 h-4 text-white" strokeWidth={3} />
              <div
                className="absolute inset-1 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)",
                }}
              />
            </button>
          </div>
        </JewelRing>
      </div>

      {/* home indicator */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full"
        style={{ background: "rgba(245,245,245,0.4)" }}
      />
    </div>
  );
}
