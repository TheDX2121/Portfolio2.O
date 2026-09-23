"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Login failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-lg p-8 space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <p className="text-sm text-neutral-400 mt-1">Sign in to manage your portfolio content.</p>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400">
            Admin password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/40"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-white text-black text-sm font-medium py-2.5 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <a href="/" className="block text-center text-xs text-neutral-500 hover:text-white">
          ← Back to site
        </a>
      </form>
    </div>
  );
}
