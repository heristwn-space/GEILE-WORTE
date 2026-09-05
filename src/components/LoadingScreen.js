"use client";

export default function LoadingScreen() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#fff9db] to-[#e8fbf3] overflow-hidden doodle-grid select-none">
      {/* Decorative floating shapes in background */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-[#ffd8a8] rounded-full opacity-60 animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-[#a9e34b] rounded-3xl opacity-40 rotate-12 animate-float-medium" />
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-[#ffc9c9] rounded-lg opacity-50 -rotate-12 animate-float-fast" />
      <div className="absolute bottom-1/4 left-1/5 w-20 h-20 bg-[#99e9f2] rounded-2xl opacity-50 rotate-45 animate-float-slow" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Cute Cartoon Icon */}
        <div className="relative w-36 h-36 flex items-center justify-center bg-white border-4 border-zinc-900 rounded-full shadow-[6px_6px_0px_0px_#18181b] animate-bounce">
          {/* Smiling Speech Bubble SVG */}
          <svg
            className="w-20 h-20 text-[#ff6f61] animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z" />
          </svg>
          
          {/* Animated Spinner Ring */}
          <div className="absolute -inset-2 border-4 border-dashed border-[#ff6f61] rounded-full animate-spin [animation-duration:15s]" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-wide drop-shadow-sm">
            GEILE WORTE
          </h1>
          <p className="flex items-center gap-1 text-zinc-600 font-semibold text-lg animate-pulse">
            Laden
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0s]" />
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
