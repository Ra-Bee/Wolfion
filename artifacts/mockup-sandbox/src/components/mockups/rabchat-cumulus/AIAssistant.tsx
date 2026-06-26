import { Sparkles, Mic, Paperclip, ArrowUp, FileText, MoreHorizontal, ChevronLeft } from "lucide-react";

const INK = "#0B2545";
const INK_2 = "#4A6585";

function VaporWisp() {
  return (
    <svg
      viewBox="0 0 390 160"
      className="absolute -top-2 left-0 right-0 w-full pointer-events-none"
      style={{ opacity: 0.55 }}
    >
      <defs>
        <radialGradient id="wisp1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="80" rx="160" ry="40" fill="url(#wisp1)" />
      <ellipse cx="280" cy="50" rx="120" ry="28" fill="url(#wisp1)" />
    </svg>
  );
}

export default function AIAssistant() {
  return (
    <div
      style={{ width: 390, height: 844 }}
      className="relative overflow-hidden rounded-[44px] ring-1 ring-white/70 shadow-[0_30px_80px_-20px_rgba(135,206,250,0.45)]"
    >
      {/* Sky gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(170deg, #E6F7FF 0%, #BDEBFF 55%, #CDEFFF 100%)",
        }}
      />

      {/* Diffused orbs */}
      <div
        className="absolute -top-20 -left-16 w-[280px] h-[280px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(155,246,255,0.85) 0%, rgba(155,246,255,0) 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute top-[260px] -right-24 w-[320px] h-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(205,180,255,0.75) 0%, rgba(205,180,255,0) 70%)",
          filter: "blur(24px)",
        }}
      />
      <div
        className="absolute bottom-[-80px] left-[-40px] w-[300px] h-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(135,206,250,0.7) 0%, rgba(135,206,250,0) 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* Vapor wisp behind header */}
      <VaporWisp />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-7 pt-3 text-[13px] font-semibold" style={{ color: INK }}>
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 rounded-[2px] border border-[#0B2545]/70 relative">
            <div className="absolute inset-0.5 right-1 bg-[#0B2545]/80 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Peek edges - hint of neighbor cards */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 rounded-r-full bg-white/50" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-32 rounded-l-full bg-white/50" />

      {/* Header */}
      <div className="relative px-5 pt-3">
        <div
          className="rounded-[26px] p-3.5 flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 40px -18px rgba(135,206,250,0.55), 0 0 0 1px rgba(135,206,250,0.08)",
          }}
        >
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/60 border border-white/80">
            <ChevronLeft size={18} style={{ color: INK }} />
          </button>

          {/* Avatar with halo */}
          <div className="relative">
            <div
              className="absolute -inset-1.5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(155,246,255,0.9) 0%, rgba(155,246,255,0) 70%)",
                filter: "blur(6px)",
              }}
            />
            <div
              className="relative w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #9BF6FF 0%, #87CEFA 50%, #CDB4FF 100%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.9), 0 6px 14px -4px rgba(135,206,250,0.6)",
              }}
            >
              <Sparkles size={20} className="text-white drop-shadow" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#9BF6FF] border-2 border-white" />
          </div>

          <div className="flex-1">
            <div className="text-[16px] font-semibold leading-tight" style={{ color: INK }}>
              Rabbi
            </div>
            <div className="text-[11px] flex items-center gap-1.5" style={{ color: INK_2 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              Online · learning
            </div>
          </div>

          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/60 border border-white/80">
            <MoreHorizontal size={18} style={{ color: INK }} />
          </button>
        </div>
      </div>

      {/* Conversation thread */}
      <div className="relative px-5 mt-5 space-y-3">
        {/* User bubble */}
        <div className="flex justify-end">
          <div
            className="max-w-[78%] rounded-[22px] rounded-br-md px-4 py-2.5 text-[13.5px] leading-snug text-white"
            style={{
              background:
                "linear-gradient(135deg, #87CEFA 0%, #9BF6FF 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.55), 0 12px 26px -12px rgba(135,206,250,0.7)",
            }}
          >
            Can you explain photosynthesis in 2 lines?
          </div>
        </div>

        {/* Assistant bubble */}
        <div className="flex justify-start">
          <div
            className="max-w-[82%] rounded-[22px] rounded-bl-md px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.95), 0 14px 32px -14px rgba(135,206,250,0.5)",
              color: INK,
            }}
          >
            <div className="text-[13.5px] leading-snug">
              Plants turn sunlight, water, and CO₂ into glucose and oxygen inside their leaves —
              that's photosynthesis. It powers nearly every food chain on Earth. 🌿
            </div>
          </div>
        </div>

        {/* User bubble with file pill */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end gap-1.5 max-w-[80%]">
            <div
              className="rounded-[18px] px-3 py-2 flex items-center gap-2"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px -10px rgba(135,206,250,0.55)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#CDB4FF,#87CEFA)",
                }}
              >
                <FileText size={15} className="text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold" style={{ color: INK }}>
                  Biology_Ch4.pdf
                </div>
                <div className="text-[10.5px]" style={{ color: INK_2 }}>
                  2.4 MB · 18 pages
                </div>
              </div>
            </div>
            <div
              className="rounded-[22px] rounded-br-md px-4 py-2 text-[13.5px] leading-snug text-white"
              style={{
                background:
                  "linear-gradient(135deg, #87CEFA 0%, #9BF6FF 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), 0 12px 26px -12px rgba(135,206,250,0.7)",
              }}
            >
              Summarize this for tomorrow's quiz?
            </div>
          </div>
        </div>

        {/* Assistant short reply */}
        <div className="flex justify-start">
          <div
            className="rounded-[22px] rounded-bl-md px-4 py-2.5"
            style={{
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.95), 0 14px 32px -14px rgba(135,206,250,0.5)",
              color: INK,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#87CEFA] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#87CEFA]/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#87CEFA]/40" />
              <span className="text-[12px] ml-1.5" style={{ color: INK_2 }}>
                Reading…
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom dock: chips + input */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-3">
        {/* Suggestion chips */}
        <div className="flex gap-2 mb-3 overflow-hidden">
          {[
            { label: "Summarize", emoji: "✨" },
            { label: "Explain", emoji: "💡" },
            { label: "Translate", emoji: "🌐" },
            { label: "Study help", emoji: "📚" },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 18px -8px rgba(135,206,250,0.5)",
                color: INK,
              }}
            >
              <span>{c.emoji}</span>
              {c.label}
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div
          className="rounded-[28px] p-2 pl-3 flex items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.74)",
            backdropFilter: "blur(36px)",
            WebkitBackdropFilter: "blur(36px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.95), 0 18px 40px -16px rgba(135,206,250,0.55)",
          }}
        >
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/70 border border-white/80">
            <Paperclip size={16} style={{ color: INK_2 }} />
          </button>
          <input
            placeholder="Ask Rabbi anything…"
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#4A6585]/70"
            style={{ color: INK }}
            readOnly
          />
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/70 border border-white/80">
            <Mic size={16} style={{ color: INK_2 }} />
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#87CEFA 0%,#9BF6FF 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 22px -8px rgba(135,206,250,0.8)",
            }}
          >
            <ArrowUp size={18} className="text-white" />
          </button>
        </div>

        {/* page indicator dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: i === 2 ? 18 : 5,
                height: 5,
                background:
                  i === 2 ? "linear-gradient(90deg,#87CEFA,#9BF6FF)" : "rgba(11,37,69,0.25)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
