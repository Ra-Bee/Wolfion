import { Sparkles, Mic, Paperclip, ArrowUp, FileText, MoreHorizontal } from "lucide-react";

const INK = "#0B2545";
const SUB = "#4A6585";

const skyBg: React.CSSProperties = {
  background:
    "radial-gradient(120% 80% at 80% 0%, #CDB4FF 0%, rgba(205,180,255,0) 55%)," +
    "radial-gradient(120% 80% at 0% 100%, #9BF6FF 0%, rgba(155,246,255,0) 50%)," +
    "linear-gradient(180deg, #E6F7FF 0%, #BDEBFF 55%, #CDEFFF 100%)",
};

const iridescentBorder: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(155,246,255,0.9), rgba(255,255,255,0.2) 35%, rgba(205,180,255,0.85) 70%, rgba(255,200,220,0.9))",
  padding: 1.5,
  borderRadius: 26,
};

const glassPanel: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)",
  backdropFilter: "blur(28px) saturate(160%)",
  WebkitBackdropFilter: "blur(28px) saturate(160%)",
  borderRadius: 24,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 30px -12px rgba(135,206,250,0.35)",
};

function IridescentRing({
  children,
  radius = 26,
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
      style={{ ...iridescentBorder, borderRadius: radius, ...style }}
    >
      <div
        style={{
          ...glassPanel,
          borderRadius: radius - 1.5,
          height: "100%",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2 max-w-[85%]">
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
        style={{
          background:
            "conic-gradient(from 210deg, #9BF6FF, #CDB4FF, #FFD6E7, #9BF6FF)",
          boxShadow: "0 4px 14px -4px rgba(205,180,255,0.7)",
        }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
      </div>
      <div
        style={{
          ...iridescentBorder,
          borderRadius: 20,
        }}
      >
        <div
          style={{
            background:
              "conic-gradient(from 200deg at 70% 30%, rgba(155,246,255,0.55), rgba(255,255,255,0.85) 40%, rgba(205,180,255,0.5))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: 18.5,
            padding: "10px 14px",
            color: INK,
            fontSize: 13,
            lineHeight: 1.45,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
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
  pill,
}: {
  text: string;
  pill?: { name: string; size: string };
}) {
  return (
    <div className="ml-auto max-w-[82%] flex flex-col items-end gap-1.5">
      {pill && (
        <div
          style={{ ...iridescentBorder, borderRadius: 14 }}
        >
          <div
            className="flex items-center gap-2 px-2.5 py-1.5"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 12.5,
            }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #9BF6FF 0%, #CDB4FF 100%)",
              }}
            >
              <FileText className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div style={{ color: INK, fontSize: 11, fontWeight: 600 }}>
                {pill.name}
              </div>
              <div style={{ color: SUB, fontSize: 10 }}>{pill.size}</div>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          background:
            "linear-gradient(135deg, #87CEFA 0%, #9BB8FF 50%, #CDB4FF 100%)",
          borderRadius: 18,
          padding: "10px 14px",
          color: "white",
          fontSize: 13,
          lineHeight: 1.45,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 22px -10px rgba(135,206,250,0.7)",
          maxWidth: "100%",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div style={{ ...iridescentBorder, borderRadius: 999 }}>
      <button
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 999,
          padding: "7px 14px",
          color: INK,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: "nowrap",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {label}
      </button>
    </div>
  );
}

export default function AIAssistant() {
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
      {/* iridescent halos */}
      <div
        className="absolute -top-20 -left-16 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(205,180,255,0.7) 0%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(155,246,255,0.7) 0%, transparent 60%)",
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

      {/* page indicator dots — sideflow */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 2 ? 18 : 5,
              height: 5,
              background:
                i === 2
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
      <div className="absolute top-12 left-4 right-4">
        <IridescentRing radius={26}>
          <div className="flex items-center gap-3 px-3.5 py-3">
            <div
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "conic-gradient(from 140deg, #9BF6FF, #CDB4FF, #FFD6E7, #9BF6FF)",
                boxShadow:
                  "0 6px 20px -6px rgba(205,180,255,0.85), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <Sparkles
                className="w-5 h-5 text-white"
                strokeWidth={2.5}
              />
              <div
                className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, white, transparent 70%)",
                  opacity: 0.9,
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
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(155,246,255,0.6), rgba(205,180,255,0.6))",
                    color: INK,
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
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.7)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <MoreHorizontal className="w-4 h-4" style={{ color: INK }} />
            </button>
          </div>
        </IridescentRing>
      </div>

      {/* CONVERSATION */}
      <div className="absolute top-[152px] left-4 right-4 bottom-[176px] flex flex-col gap-3 overflow-hidden">
        <div
          className="text-center text-[10px] font-medium tracking-wide"
          style={{ color: SUB }}
        >
          TODAY · 09:38
        </div>

        <UserBubble text="Hey Rabbi, can you summarize this lecture pdf for me?" />

        <UserBubble
          text="Just the key points please ✨"
          pill={{ name: "Lecture_07_Neural.pdf", size: "1.4 MB · 24 pages" }}
        />

        <AssistantBubble text="Of course! Here are the 3 key takeaways from your lecture:" />

        <div className="flex items-end gap-2 max-w-[85%] -mt-1">
          <div className="w-7 shrink-0" />
          <div
            style={{
              ...iridescentBorder,
              borderRadius: 20,
            }}
          >
            <div
              style={{
                background:
                  "conic-gradient(from 200deg at 70% 30%, rgba(155,246,255,0.55), rgba(255,255,255,0.85) 40%, rgba(205,180,255,0.5))",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: 18.5,
                padding: "10px 14px",
                color: INK,
                fontSize: 12.5,
                lineHeight: 1.5,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <div className="flex gap-2">
                <span className="font-bold" style={{ color: "#7B5FCC" }}>
                  1.
                </span>
                Backpropagation adjusts weights via gradient descent.
              </div>
              <div className="flex gap-2 mt-1">
                <span className="font-bold" style={{ color: "#7B5FCC" }}>
                  2.
                </span>
                Activation functions add non-linearity (ReLU dominates).
              </div>
              <div className="flex gap-2 mt-1">
                <span className="font-bold" style={{ color: "#7B5FCC" }}>
                  3.
                </span>
                Overfitting is mitigated with dropout & regularization.
              </div>
            </div>
          </div>
        </div>

        <UserBubble text="Perfect — quiz me on point 2?" />
      </div>

      {/* BOTTOM AREA: chips + input */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-col gap-2.5">
        <div className="flex gap-2 overflow-hidden">
          <Chip label="✦ Summarize" />
          <Chip label="Explain" />
          <Chip label="Translate" />
          <Chip label="Study help" />
        </div>

        <IridescentRing radius={28}>
          <div className="flex items-center gap-2 px-2 py-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,255,255,0.6)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <Paperclip className="w-4 h-4" style={{ color: INK }} />
            </button>
            <div
              className="flex-1 text-[13px] px-1"
              style={{ color: SUB }}
            >
              Ask Rabbi anything…
            </div>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,255,255,0.6)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <Mic className="w-4 h-4" style={{ color: INK }} />
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "conic-gradient(from 130deg, #9BF6FF, #87CEFA, #CDB4FF, #FFD6E7, #9BF6FF)",
                boxShadow:
                  "0 8px 22px -6px rgba(205,180,255,0.8), inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              <ArrowUp className="w-4 h-4 text-white" strokeWidth={3} />
            </button>
          </div>
        </IridescentRing>
      </div>

      {/* home indicator */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full"
        style={{ background: "rgba(11,37,69,0.35)" }}
      />
    </div>
  );
}
