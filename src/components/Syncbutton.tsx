"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSync() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/sync", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        setMessage("Sync gagal");
        return;
      }

      setMessage(`Sync sukses: ${data.found} data ditemukan`);
      router.refresh();
    } catch {
      setMessage("Sync error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-full bg-pink-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Syncing..." : "Sync Sekarang"}
      </button>

      {message && <p className="text-xs text-white/60">{message}</p>}
    </div>
  );
}