import {
  Sparkles,
  Mic,
  Paperclip,
  ArrowUp,
  MoreHorizontal,
  Phone,
  FileText,
  Languages,
  Lightbulb,
  ListChecks,
} from "lucide-react";

const TEXT = "#F5F5F5";
const SUB = "rgba(245,245,245,0.55)";

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

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2 max-w-[85%]">
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #FF2D2D 0%, #FF4D4D 45%, #7B61FF 100%)",
          boxShadow:
            "0 0 14px -2px rgba(255,45,45,0.85), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
      </div>
      <div
        style={{
          ...glassPanel,
          borderRadius: 18,
          padding: "10px 13px",
          color: TEXT,
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="ml-auto max-w-[82%]">
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(255,45,45,0.42) 0%, rgba(255,77,77,0.32) 50%, rgba(123,97,255,0.32) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRadius: 18,
          padding: "10px 14px",
          color: TEXT,
          fontSize: 13,
          lineHeight: 1.45,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,77,77,0.45), 0 0 22px -6px rgba(255,45,45,0.7)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Chip({
  label,
  icon,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className="flex items-center gap-1.5 shrink-0"
      style={{
        padding: "7px 12px 7px 8px",
        borderRadius: 999,
        background: active
          ? "linear-gradient(135deg, rgba(255,45,45,0.35), rgba(123,97,255,0.30))"
          : "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 0 0 1px rgba(255,77,77,0.5), 0 0 18px -4px rgba(255,45,45,0.8)"
          : "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.07)",
        color: TEXT,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

export default function AIChat() {
  return (
    <div
      style={{ width: 390, height: 844, ...bezelStyle }}
      className="relative overflow-hidden rounded-[44px]"
    >
      {/* aurora wash behind header */}
      <div
        className="absolute -top-24 left-0 right-0 h-72 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 0%, rgba(255,45,45,0.40) 0%, rgba(255,45,45,0) 65%)",
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
              width: i === 1 ? 18 : 5,
              height: 5,
              background:
                i === 1
                  ? "linear-gradient(90deg, #FF2D2D, #7B61FF)"
                  : "rgba(245,245,245,0.22)",
              boxShadow: i === 1 ? "0 0 8px rgba(255,45,45,0.8)" : "none",
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
      <div
        className="absolute top-12 left-4 right-4 flex items-center gap-3 px-3 py-2.5"
        style={{ ...glassPanel, borderRadius: 22 }}
      >
        <div
          className="relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background:
              "linear-gradient(135deg, #FF2D2D 0%, #FF4D4D 45%, #7B61FF 100%)",
            boxShadow:
              "0 0 22px -2px rgba(255,45,45,0.85), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
          <div
            className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full pointer-events-none"
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
            style={{ color: TEXT, fontSize: 15, fontWeight: 700 }}
          >
            Rabbi
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,45,45,0.35), rgba(123,97,255,0.35))",
                color: TEXT,
                boxShadow: "inset 0 0 0 1px rgba(255,77,77,0.4)",
              }}
            >
              AI · PRO
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 mt-0.5"
            style={{ color: SUB, fontSize: 11 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#FF4D4D",
                boxShadow: "0 0 10px #FF2D2D, 0 0 4px #FF4D4D",
              }}
            />
            online · ready to ignite
          </div>
        </div>
        <GlassIcon size={34} radius={11}>
          <Phone className="w-4 h-4" strokeWidth={2.2} />
        </GlassIcon>
        <GlassIcon size={34} radius={11}>
          <MoreHorizontal className="w-4 h-4" strokeWidth={2.2} />
        </GlassIcon>
      </div>

      {/* CONVERSATION */}
      <div className="absolute top-[148px] left-4 right-4 bottom-[180px] flex flex-col gap-3 overflow-hidden">
        <div
          className="text-center text-[10px] font-semibold tracking-[0.2em]"
          style={{ color: SUB }}
        >
          TODAY · 09:38
        </div>

        <UserBubble text="Hey Rabbi — break down quantum entanglement for me, gamer mode." />

        <AssistantBubble>
          <span style={{ color: TEXT }}>
            Locked in. Two particles get linked — measure one, the other instantly
            mirrors it, no matter the distance.
          </span>
        </AssistantBubble>

        <AssistantBubble>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <span style={{ color: "#FF6A6A", fontWeight: 700 }}>01</span>
              <span>Pair up two particles in shared state.</span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#FF6A6A", fontWeight: 700 }}>02</span>
              <span>Separate them across any distance.</span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: "#FF6A6A", fontWeight: 700 }}>03</span>
              <span>Measure A → B's state collapses instantly.</span>
            </div>
          </div>
        </AssistantBubble>

        <UserBubble text="🔥 Translate that one-liner to Japanese." />

        <div className="flex items-end gap-2 max-w-[60%]">
          <div
            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #FF2D2D 0%, #7B61FF 100%)",
              boxShadow: "0 0 14px -2px rgba(255,45,45,0.85)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div
            style={{
              ...glassPanel,
              borderRadius: 18,
              padding: "12px 16px",
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#FF4D4D",
                  boxShadow: "0 0 6px #FF2D2D",
                  opacity: i === 1 ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CHIPS */}
      <div className="absolute bottom-[78px] left-4 right-4 flex gap-2 overflow-hidden">
        <Chip
          active
          label="Summarize"
          icon={
            <ListChecks className="w-3 h-3" strokeWidth={2.5} color={TEXT} />
          }
        />
        <Chip
          label="Explain"
          icon={
            <Lightbulb className="w-3 h-3" strokeWidth={2.5} color={TEXT} />
          }
        />
        <Chip
          label="Translate"
          icon={
            <Languages className="w-3 h-3" strokeWidth={2.5} color={TEXT} />
          }
        />
        <Chip
          label="Notes"
          icon={<FileText className="w-3 h-3" strokeWidth={2.5} color={TEXT} />}
        />
      </div>

      {/* COMPOSER */}
      <div
        className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-2 py-2"
        style={{ ...glassPanel, borderRadius: 28 }}
      >
        <GlassIcon size={36} radius={12}>
          <Paperclip className="w-4 h-4" strokeWidth={2.2} />
        </GlassIcon>
        <div
          className="flex-1 text-[13px] px-1"
          style={{ color: SUB }}
        >
          Ask Rabbi anything…
        </div>
        <GlassIcon size={36} radius={12}>
          <Mic className="w-4 h-4" strokeWidth={2.2} />
        </GlassIcon>
        <button
          className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{
            background:
              "linear-gradient(135deg, #FF2D2D 0%, #FF4D4D 45%, #7B61FF 100%)",
            boxShadow:
              "0 0 26px -2px rgba(255,45,45,0.95), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.2)",
          }}
        >
          <ArrowUp className="w-5 h-5 text-white" strokeWidth={3} />
          <div
            className="absolute -top-0.5 left-1.5 w-3 h-3 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, white, transparent 70%)",
              opacity: 0.85,
            }}
          />
        </button>
      </div>

      {/* home indicator */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full"
        style={{ background: "rgba(245,245,245,0.35)" }}
      />
    </div>
  );
}
