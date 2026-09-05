"use client";

import { useEffect } from "react";

export default function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass =
    type === "success"
      ? "bg-[#e8f5e9] border-[#2e7d32]"
      : type === "error"
      ? "bg-[#ffebee] border-[#c62828]"
      : "bg-[#fffde7] border-[#fbc02d]";

  const icon =
    type === "success" ? (
      <svg
        className="w-5 h-5 text-[#2e7d32]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ) : type === "error" ? (
      <svg
        className="w-5 h-5 text-[#c62828]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ) : (
      <svg
        className="w-5 h-5 text-[#fbc02d]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_#18181b] animate-playful-bounce pointer-events-auto ${bgClass}`}
      >
        <div className="flex-shrink-0">{icon}</div>
        <p className="text-zinc-900 font-semibold text-sm select-none">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-zinc-500 hover:text-zinc-900 transition-colors focus:outline-none"
          aria-label="Schließen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
