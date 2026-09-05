"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function MainMenuScreen({
  session,
  onStartGame,
  isSoundOn,
  setIsSoundOn,
  musicVolume,
  setMusicVolume,
  sfxVolume,
  setSfxVolume,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    username: session?.user?.user_metadata?.username || "Spieler",
    gender: session?.user?.user_metadata?.gender || "Männlich",
    email: session?.user?.email || "gast@spiel.de",
  });

  // Fetch profiles table data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("username, gender")
            .eq("id", session.user.id)
            .single();

          if (data) {
            setProfile({
              username: data.username || session.user.user_metadata?.username || "Spieler",
              gender: data.gender || session.user.user_metadata?.gender || "Männlich",
              email: session.user.email || "gast@spiel.de",
            });
          }
        } catch (err) {
          console.warn("Could not load user profile from profiles table:", err);
        }
      }
    };

    fetchProfile();
  }, [session]);


  const handleStartGame = () => {
    if (onStartGame) {
      onStartGame();
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
  };

  // Helper to generate initials from username (e.g. Andrian Budi -> AB)
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-zinc-950 p-4 overflow-hidden select-none">

      {/* 1. PORTRAIT ORIENTATION CHECK OVERLAY */}
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-br from-[#ffd8a8] to-[#ff922b] text-zinc-950 text-center p-6 portrait:flex landscape:hidden select-none">
        <div className="mb-6 border-4 border-zinc-950 p-4 rounded-2xl bg-white shadow-[6px_6px_0px_0px_#18181b] animate-bounce">
          <svg
            className="w-16 h-16 text-[#ff6f61] animate-[spin_4s_linear_infinite]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Bitte drehen Sie Ihr Handy!</h2>
        <p className="text-zinc-800 font-bold max-w-sm">
          Please rotate your phone to landscape mode to play the game properly.
        </p>
      </div>

      {/* 2. ASPECT RATIO CONTAINER (16:9 LOCKED) */}
      <div className="relative w-[min(100%,calc(90vh*16/9))] max-w-[1000px] aspect-video bg-cover bg-center border-4 border-zinc-900 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] overflow-hidden bg-[url('/assets/image-fix/background-awal.jpg')]">

        {/* LOGOUT BUTTON (TOP RIGHT) */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="absolute top-4 right-4 z-20 flex items-center justify-center gap-1.5 bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full px-3 py-1.5 text-xs font-extrabold text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer pointer-events-auto"
        >
          <svg
            className="w-3.5 h-3.5 text-zinc-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Abmelden
        </button>

        {/* 3. GAME TITLE AREA (CENTER TOP) */}
        <div className="absolute top-[12%] left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center animate-playful-bounce select-none pointer-events-none">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <span className="text-stroke-white text-5xl md:text-7xl font-black tracking-wider block font-adigiana uppercase text-[#ff6f61]">
              GEILE
            </span>
            <span className="text-stroke-white text-5xl md:text-7xl font-black tracking-wider block font-adigiana uppercase text-[#ff6f61]">
              WORTE
            </span>
          </div>
        </div>

        {/* 4. SETTINGS MODAL POPUP */}
        {isSettingsOpen && (
          <div className="absolute inset-0 z-30 bg-zinc-950/70 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-sm bg-white border-4 border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] shadow-[6px_6px_0px_0px_#18181b] p-4 md:p-6 max-h-[95%] flex flex-col overflow-y-auto pointer-events-auto select-none">

              {/* Close Cross */}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors font-extrabold text-xl cursor-pointer"
                aria-label="Schließen"
              >
                ✕
              </button>

              {/* Header */}
              <h3 className="font-adigiana text-2xl md:text-3xl font-extrabold text-zinc-900 text-center mb-3 md:mb-4 pb-1.5 md:pb-2 border-b-3 border-zinc-100">
                Einstellungen
              </h3>

              {/* User Avatar & Profile details */}
              <div className="flex items-center gap-3 bg-[#fffde7] border-3 border-zinc-900 rounded-2xl p-2.5 md:p-3.5 shadow-[3px_3px_0px_0px_#18181b] mb-4 md:mb-6">
                {/* Initials Avatar generator */}
                <div className="w-11 h-11 md:w-14 md:h-14 bg-[#ff6f61] border-3 border-zinc-900 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-extrabold shadow-[2px_2px_0px_0px_#18181b] flex-shrink-0">
                  {getInitials(profile.username)}
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <h4 className="text-zinc-900 font-extrabold text-sm md:text-base truncate">
                    {profile.username}
                  </h4>
                  <p className="text-zinc-500 font-bold text-[10px] md:text-xs truncate">
                    {profile.email}
                  </p>
                  <span className="inline-block mt-0.5 md:mt-1 bg-[#e8fbf3] text-[#2e7d32] border-2 border-zinc-900 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-extrabold self-start shadow-[1px_1px_0px_0px_#18181b]">
                    {profile.gender}
                  </span>
                </div>
              </div>

              {/* Volume Sliders */}
              <div className="flex flex-col gap-3 md:gap-4 text-left">
                {/* Music Volume */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-zinc-700 font-extrabold text-xs md:text-sm flex justify-between">
                    <span>Musik-Lautstärke</span>
                    <span className="text-zinc-500">{musicVolume}%</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 border-2 border-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#ff6f61]"
                    />
                  </div>
                </div>

                {/* SFX Volume */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-zinc-700 font-extrabold text-xs md:text-sm flex justify-between">
                    <span>Effekt-Lautstärke (SFX)</span>
                    <span className="text-zinc-500">{sfxVolume}%</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9H4.5A1.5 1.5 0 003 10.5v3A1.5 1.5 0 004.5 15h3.25L12 18.75z" />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sfxVolume}
                      onChange={(e) => setSfxVolume(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 border-2 border-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#ff6f61]"
                    />
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="font-adigiana mt-4 md:mt-6 w-full bg-[#ff6f61] border-3 border-zinc-900 rounded-full py-2 md:py-2.5 px-4 text-white font-extrabold text-base md:text-lg shadow-[3px_3px_0px_0px_#18181b] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
              >
                Schließen
              </button>

            </div>
          </div>
        )}

        {/* 5. BUTTONS / INTERACTION LAYER */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pointer-events-none">
          {/* Spacer */}
          <div className="h-10" />

          {/* Bottom actions row */}
          <div className="flex items-end justify-between w-full mt-auto">

            {/* SOUND QUICK BUTTON (BOTTOM LEFT) */}
            <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
              <div className="relative">
                {/* Ripples when active */}
                {isSoundOn && (
                  <>
                    <div className="absolute inset-0 bg-[#ff6f61] rounded-full animate-ripple opacity-30 pointer-events-none" />
                    <div className="absolute inset-0 bg-[#ff6f61] rounded-full animate-ripple [animation-delay:0.6s] opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-[#ff6f61] rounded-full animate-ripple [animation-delay:1.2s] opacity-10 pointer-events-none" />
                  </>
                )}
                <button
                  onClick={() => setIsSoundOn(!isSoundOn)}
                  className="relative z-10 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-[#ff6f61] border-3 border-zinc-900 rounded-full shadow-[3px_3px_0px_0px_#18181b] hover:scale-110 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer"
                  aria-label="Sound Umschalten"
                >
                  {isSoundOn ? (
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9H4.5A1.5 1.5 0 003 10.5v3A1.5 1.5 0 004.5 15h3.25L12 18.75z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H3v6h1.5l3.75 3.25V5.25z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <span className="text-zinc-900 font-extrabold text-sm md:text-base drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                Sound: {isSoundOn ? "On" : "Off"}
              </span>
            </div>

            {/* START BUTTON (CENTER BOTTOM) */}
            <div className="flex flex-col items-center pointer-events-auto">
              <button
                onClick={handleStartGame}
                className="font-adigiana group relative bg-[#ff6f61] border-[4px] border-white rounded-full py-2.5 px-8 md:py-3.5 md:px-12 text-white font-extrabold tracking-wider text-xl md:text-3xl shadow-[0px_6px_0px_0px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 active:translate-y-1 transition-all cursor-pointer select-none"
              >
                STARTEN
              </button>
              <div className="h-2" />
            </div>

            {/* SETTINGS BUTTON (BOTTOM RIGHT) */}
            <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-[#ff6f61] border-3 border-zinc-900 rounded-full shadow-[3px_3px_0px_0px_#18181b] hover:scale-110 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer"
                aria-label="Einstellungen"
              >
                <svg
                  className="w-8 h-8 text-white animate-[spin_8s_linear_infinite]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <span className="text-zinc-900 font-extrabold text-sm md:text-base drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                Settings
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
