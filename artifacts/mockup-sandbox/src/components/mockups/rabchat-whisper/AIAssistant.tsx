import { Mic, Paperclip, ArrowUp, FileText } from "lucide-react";

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

function Bubble({
  side,
  children,
}: {
  side: "user" | "ai";
  children: React.ReactNode;
}) {
  const isUser = side === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[78%] px-4 py-3 text-[13.5px] leading-[1.55] tracking-[0.005em] font-light"
        style={{
          color: ink,
          borderRadius: isUser ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
          background: isUser
            ? "rgba(255,255,255,0.62)"
            : "rgba(255,255,255,0.42)",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AIAssistant() {
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
      {/* Diffuse luminous halos (no shadows) */}
      <Glow
        className=""
        style={{
          width: 320,
          height: 320,
          top: -90,
          right: -80,
          background:
            "radial-gradient(circle, rgba(155,246,255,0.55), rgba(155,246,255,0) 70%)",
        }}
      />
      <Glow
        style={{
          width: 360,
          height: 360,
          bottom: -120,
          left: -100,
          background:
            "radial-gradient(circle, rgba(205,180,255,0.45), rgba(205,180,255,0) 70%)",
        }}
      />
      <Glow
        style={{
          width: 220,
          height: 220,
          top: 280,
          left: 90,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)",
        }}
      />

      {/* SideFlow page indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: i === 2 ? 14 : 4,
              height: 4,
              background:
                i === 2 ? "rgba(11,37,69,0.55)" : "rgba(11,37,69,0.18)",
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
          Assistant
        </div>
        <div className="mt-1 flex items-end justify-between">
          <h1
            className="text-[34px] font-light leading-[1.05] tracking-[-0.01em]"
            style={{ color: ink }}
          >
            Rabbi
          </h1>
          <div className="flex items-center gap-1.5 pb-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#9BF6FF",
                boxShadow: "0 0 10px 2px rgba(155,246,255,0.7)",
              }}
            />
            <span
              className="text-[11px] tracking-[0.18em] font-light"
              style={{ color: sub }}
            >
              listening
            </span>
          </div>
        </div>
        <div
          className="mt-5 h-px w-full"
          style={{ background: "rgba(11,37,69,0.08)" }}
        />
      </div>

      {/* Conversation */}
      <div className="relative px-6 mt-7 space-y-4">
        <div
          className="text-center text-[10px] tracking-[0.24em] uppercase font-light"
          style={{ color: sub }}
        >
          Today · 9:32
        </div>

        <Bubble side="user">
          Can you summarise chapter 4 of my biology notes?
        </Bubble>

        <Bubble side="ai">
          Of course. The chapter explores cellular respiration — how cells
          convert glucose into ATP through glycolysis, the Krebs cycle, and the
          electron transport chain.
        </Bubble>

        <div className="flex justify-end">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl"
              style={{ background: "rgba(155,246,255,0.35)" }}
            >
              <FileText size={14} strokeWidth={1.4} style={{ color: ink }} />
            </div>
            <div className="pr-1">
              <div
                className="text-[12px] font-normal"
                style={{ color: ink }}
              >
                bio_ch4.pdf
              </div>
              <div className="text-[10px]" style={{ color: sub }}>
                2.4 MB
              </div>
            </div>
          </div>
        </div>

        <Bubble side="ai">
          I&rsquo;ve attached a 5-bullet summary and three flashcards you can
          review tonight.
        </Bubble>
      </div>

      {/* Suggestion chips */}
      <div className="absolute left-0 right-0 bottom-[112px] px-6">
        <div className="flex gap-2 overflow-hidden">
          {[
            { label: "Summarize", accent: true },
            { label: "Explain" },
            { label: "Translate" },
            { label: "Study help" },
          ].map((c) => (
            <div
              key={c.label}
              className="px-3.5 py-2 rounded-full text-[11.5px] font-light tracking-wide whitespace-nowrap"
              style={{
                color: ink,
                background: c.accent
                  ? "rgba(155,246,255,0.55)"
                  : "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="absolute left-5 right-5 bottom-8">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-full"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(32px) saturate(140%)",
            WebkitBackdropFilter: "blur(32px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <Paperclip size={17} strokeWidth={1.3} style={{ color: sub }} />
          <div
            className="flex-1 text-[13px] font-light tracking-wide"
            style={{ color: "rgba(74,101,133,0.7)" }}
          >
            Ask Rabbi anything…
          </div>
          <Mic size={17} strokeWidth={1.3} style={{ color: sub }} />
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(11,37,69,0.92)",
              boxShadow: "0 0 24px rgba(155,246,255,0.5)",
            }}
          >
            <ArrowUp size={16} strokeWidth={1.6} color="#fff" />
          </button>
        </div>
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
