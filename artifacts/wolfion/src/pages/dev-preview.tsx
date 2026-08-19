import { useState } from "react";
import { Smartphone, Monitor, RotateCw } from "lucide-react";

type Device = {
  name: string;
  width: number;
  height: number;
};

const DEVICES: Device[] = [
  { name: "iPhone 13 / 14", width: 390, height: 844 },
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 14 Pro Max", width: 430, height: 932 },
  { name: "Android (Pixel)", width: 412, height: 915 },
  { name: "Android (Galaxy)", width: 360, height: 800 },
];

export default function DevPreviewPage() {
  const [device, setDevice] = useState<Device>(DEVICES[0]);
  const [landscape, setLandscape] = useState(false);
  const [path, setPath] = useState("/");
  const [pathInput, setPathInput] = useState("/");
  const [iframeKey, setIframeKey] = useState(0);

  const w = landscape ? device.height : device.width;
  const h = landscape ? device.width : device.height;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const previewUrl = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    setPath(pathInput || "/");
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col">
      {/* Top toolbar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Smartphone className="h-4 w-4" /> Mobile Preview
        </div>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* Device picker */}
        <select
          value={device.name}
          onChange={(e) => {
            const next = DEVICES.find((d) => d.name === e.target.value);
            if (next) setDevice(next);
          }}
          className="text-sm border border-neutral-300 dark:border-neutral-700 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900"
          data-testid="select-device"
        >
          {DEVICES.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name} — {d.width}×{d.height}
            </option>
          ))}
        </select>

        <button
          onClick={() => setLandscape((l) => !l)}
          className="text-xs flex items-center gap-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
          data-testid="btn-rotate"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {landscape ? "Portrait" : "Landscape"}
        </button>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* URL bar */}
        <form onSubmit={handleGo} className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="/shop"
            className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md px-2 py-1.5 bg-white dark:bg-neutral-900"
            data-testid="input-path"
          />
          <button
            type="submit"
            className="text-xs px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md font-medium"
            data-testid="btn-go"
          >
            Go
          </button>
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="text-xs px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-md"
            data-testid="btn-reload"
          >
            Reload
          </button>
        </form>

        {/* Quick links */}
        <div className="flex items-center gap-1.5 text-xs">
          {["/", "/sign-in", "/shop", "/products", "/cart", "/settings", "/admin-dashboard"].map((p) => (
            <button
              key={p}
              onClick={() => {
                setPath(p);
                setPathInput(p);
              }}
              className={`px-2 py-1 rounded border ${
                path === p
                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs flex items-center gap-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Monitor className="h-3.5 w-3.5" /> Open desktop view
          </a>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div className="flex flex-col items-center gap-3">
          {/* Device frame */}
          <div
            className="relative bg-black rounded-[44px] shadow-2xl p-3"
            style={{ width: w + 24, height: h + 24 }}
          >
            {/* Notch (only in portrait) */}
            {!landscape && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-2xl z-10 pointer-events-none" />
            )}

            {/* Screen */}
            <div
              className="relative bg-white rounded-[32px] overflow-hidden"
              style={{ width: w, height: h }}
            >
              <iframe
                key={iframeKey}
                src={previewUrl}
                title="Mobile preview"
                className="block border-0"
                style={{ width: w, height: h }}
                data-testid="preview-iframe"
              />
            </div>
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {device.name} · {w} × {h}
          </div>
        </div>
      </div>
    </div>
  );
}
