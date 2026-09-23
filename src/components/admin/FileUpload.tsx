"use client";

import { useRef, useState } from "react";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
}
function isAudioUrl(url: string) {
  return /\.(mp3|wav|ogg|m4a)(\?|#|$)/i.test(url);
}

export default function FileUpload({
  label,
  value,
  onChange,
  accept = "image/*,video/*",
  kind = "media",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  kind?: "media" | "audio";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed.");
      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md bg-white text-black text-xs font-medium px-3 py-2 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload file"}
        </button>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste a URL"
          className="flex-1 min-w-[160px] rounded-md bg-neutral-900 border border-white/10 px-3 py-2 text-xs"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-neutral-500 hover:text-white underline"
          >
            Clear
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {value && (
        <div className="mt-1">
          {kind === "audio" || isAudioUrl(value) ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <audio controls src={value} className="w-full max-w-sm" />
          ) : isVideoUrl(value) ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video controls src={value} className="h-28 rounded border border-white/10" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-28 rounded border border-white/10 object-cover" />
          )}
        </div>
      )}
    </div>
  );
}
