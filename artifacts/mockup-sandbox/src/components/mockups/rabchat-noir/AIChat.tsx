import {
  Sparkles,
  ChevronLeft,
  MoreHorizontal,
  Plus,
  Mic,
  ArrowUp,
  FileText,
  Languages,
  BookOpen,
} from "lucide-react";
import type { ReactNode } from "react";

function GlassIcon({
  children,
  size = 36,
  active = false,
  tone = "mono",
}: {
  children: ReactNode;
  size?: number;
  active?: boolean;
  tone?: "mono" | "redpurple";
}) {
  const radius = Math.round(size * 0.28);
  const bg =
    tone === "redpurple"
      ? "linear-gradient(160deg, rgba(255,45,45,0.55), rgba(123,97,255,0.55))"
      : "linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015) 55%, rgba(0,0,0,0.35))";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 14px rgba(255,45,45,0.35)"
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

export default function AIChat() {
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
      {/* Subtle aurora behind header */}
      <div
        className="absolute left-0 right-0 top-0 h-40 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(123,97,255,0.10), transparent 70%)",
        }}
      />
      {/* Grain hairline */}
      <div className="absolute inset-x-6 top-[112px] h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-7 pt-3 text-[11px] font-medium tracking-tight text-white/70">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span className="h-1 w-1 rounded-full bg-white/30" />
        </span>
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-4">
        <GlassIcon size={36}>
          <ChevronLeft size={16} strokeWidth={1.75} />
        </GlassIcon>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18), 0 0 10px rgba(255,45,45,0.25)",
              }}
            >
              <Sparkles size={13} strokeWidth={1.75} className="text-white/90" />
            </div>
            <span className="text-[15px] font-medium tracking-tight text-white/95">
              Rabchat AI
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D4D] shadow-[0_0_6px_#FF2D2D]" />
            <span className="text-[10.5px] tracking-[0.06em] text-white/45">
              ONLINE · GPT-4o
            </span>
          </div>
        </div>

        <GlassIcon size={36}>
          <MoreHorizontal size={16} strokeWidth={1.75} />
        </GlassIcon>
      </div>

      {/* Conversation */}
      <div className="relative mt-7 flex flex-col gap-4 px-5">
        {/* AI bubble */}
        <div className="flex max-w-[78%] gap-2.5">
          <div
            className="mt-auto h-7 w-7 flex-shrink-0 rounded-full border border-white/10"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          />
          <div
            className="rounded-2xl rounded-bl-md border border-white/10 px-4 py-2.5 backdrop-blur-[28px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            <p className="text-[13.5px] leading-snug tracking-tight text-white/90">
              Good evening. I prepared a brief on the Q3 deck — three pages,
              highlights only. Want a 30-second read?
            </p>
            <div className="mt-1 text-[10px] tracking-[0.06em] text-white/35">
              9:41 PM
            </div>
          </div>
        </div>

        {/* User bubble */}
        <div className="ml-auto flex max-w-[78%] justify-end">
          <div
            className="rounded-2xl rounded-br-md border border-[#FF2D2D]/25 px-4 py-2.5 backdrop-blur-[28px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,45,45,0.18), rgba(123,97,255,0.10))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.14), 0 0 14px rgba(255,45,45,0.18)",
            }}
          >
            <p className="text-[13.5px] leading-snug tracking-tight text-white/95">
              Yes — keep it tight. Highlights, no filler.
            </p>
            <div className="mt-1 text-right text-[10px] tracking-[0.06em] text-white/55">
              9:41 PM
            </div>
          </div>
        </div>

        {/* AI bubble — longer */}
        <div className="flex max-w-[82%] gap-2.5">
          <div
            className="mt-auto h-7 w-7 flex-shrink-0 rounded-full border border-white/10"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          />
          <div
            className="rounded-2xl rounded-bl-md border border-white/10 px-4 py-3 backdrop-blur-[28px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            <p className="text-[13.5px] leading-snug tracking-tight text-white/90">
              Revenue +18% QoQ. Churn down to 2.1%. APAC outperformed plan by
              twelve points. Risk: enterprise pipeline thinning in week 11.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="text-[10.5px] tracking-[0.06em] text-white/45">
                3 SOURCES
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="absolute inset-x-5 bottom-[112px] flex items-center gap-2">
        {[
          { icon: <FileText size={12} strokeWidth={1.75} />, label: "Summarize" },
          { icon: <BookOpen size={12} strokeWidth={1.75} />, label: "Explain" },
          { icon: <Languages size={12} strokeWidth={1.75} />, label: "Translate" },
        ].map((c) => (
          <button
            key={c.label}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11.5px] font-medium tracking-tight text-white/80 backdrop-blur-[28px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            <span className="text-white/60">{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="absolute inset-x-4 bottom-7">
        <div
          className="flex items-center gap-2 rounded-[26px] border border-white/10 p-2 pr-2 backdrop-blur-[36px]"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <GlassIcon size={36}>
            <Plus size={16} strokeWidth={1.75} />
          </GlassIcon>
          <input
            placeholder="Ask Rabchat anything"
            className="flex-1 bg-transparent text-[13.5px] tracking-tight text-white/90 placeholder:text-white/35 focus:outline-none"
          />
          <GlassIcon size={36}>
            <Mic size={16} strokeWidth={1.75} />
          </GlassIcon>
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15"
            style={{
              background:
                "radial-gradient(80% 80% at 30% 25%, rgba(255,255,255,0.45), rgba(255,255,255,0) 60%), linear-gradient(160deg, #FF2D2D 0%, #7B61FF 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 18px rgba(255,45,45,0.55), 0 0 28px rgba(123,97,255,0.35)",
            }}
          >
            <ArrowUp size={16} strokeWidth={2} className="text-white" />
          </button>
        </div>
        {/* page indicator */}
        <div className="mx-auto mt-3 flex w-fit items-center gap-1.5">
          <span className="h-1 w-4 rounded-full bg-white/55" />
          <span className="h-1 w-1.5 rounded-full bg-white/20" />
          <span className="h-1 w-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
