"use client";

export default function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 z-[60] bg-zinc-950/75 flex items-center justify-center p-4">
      <div className="relative w-full max-w-[320px] bg-white border-4 border-zinc-900 rounded-[1.5rem] shadow-[8px_8px_0px_0px_#18181b] p-6 text-center animate-playful-bounce select-none">

        {/* Icon */}
        <div className="w-14 h-14 mx-auto mb-4 bg-[#fff3cd] border-3 border-zinc-900 rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_#18181b]">
          <svg className="w-7 h-7 text-[#e67e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="font-adigiana text-xl font-black text-zinc-900 mb-1">
          Sign Out?
        </h3>

        {/* Description */}
        <p className="text-zinc-500 font-semibold text-sm mb-6 leading-relaxed">
          Are you sure you want to sign out?<br />
          Your progress is saved automatically.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-900 rounded-full py-2.5 text-sm font-extrabold text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#ff6f61] hover:bg-[#e05a50] border-2 border-zinc-900 rounded-full py-2.5 text-sm font-extrabold text-white shadow-[2px_2px_0px_0px_#18181b] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
