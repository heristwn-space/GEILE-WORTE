"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function RoomSelectionScreen({
  session,
  onBackToMenu,
  onEnterRoom,
  isSoundOn,
  setIsSoundOn,
  musicVolume,
  setMusicVolume,
  sfxVolume,
  setSfxVolume,
}) {
  const [rooms, setRooms] = useState({
    room_kamar: false,
    room_ruang_tamu: false,
    room_dapur: false,
  });
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    username: session?.user?.user_metadata?.username || "Spieler",
    gender: session?.user?.user_metadata?.gender || "Männlich",
    email: session?.user?.email || "gast@spiel.de",
  });

  // Fetch room progression and profile data on mount
  useEffect(() => {
    const fetchProfileAndRooms = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("room_kamar, room_ruang_tamu, room_dapur, username, gender")
            .eq("id", session.user.id)
            .single();

          if (data) {
            setRooms({
              room_kamar: !!data.room_kamar,
              room_ruang_tamu: !!data.room_ruang_tamu,
              room_dapur: !!data.room_dapur,
            });
            setProfile({
              username: data.username || session.user.user_metadata?.username || "Spieler",
              gender: data.gender || session.user.user_metadata?.gender || "Männlich",
              email: session.user.email || "gast@spiel.de",
            });
          }

          // Auto-open tutorial if user has no progress yet
          const { data: progresData } = await supabase
            .from("progres")
            .select("id")
            .eq("profile_id", session.user.id)
            .limit(1);

          if (!progresData || progresData.length === 0) {
            setTutorialStep(0);
            setIsTutorialOpen(true);
          }
        } catch (err) {
          console.warn("Could not fetch profile and progression:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfileAndRooms();
  }, [session]);

  const handleRoomClick = (roomName, displayName) => {
    if (roomName === "room_dapur") {
      if (onEnterRoom) onEnterRoom("kitchen");
    } else if (roomName === "room_ruang_tamu") {
      if (onEnterRoom) onEnterRoom("livingroom");
    } else if (roomName === "room_kamar_tidur") {
      if (onEnterRoom) onEnterRoom("bedroom");
    } else {
      alert(`Kuis ${displayName} belum diimplementasikan!`);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await supabase.auth.signOut();
  };

  // Tutorial steps data — step 0 is text-only, steps 1-7 have images
  const tutorialSteps = [
    {
      image: null,
      title: "How to Play",
      description: `Welcome to the German Language Learning Game!\n\nWhen you enter a room, the scene will appear in black and white. Your goal is to identify objects and name them in German to bring color back to the room.\n\nClick any object in the scene — a question will appear asking for its German name. If your answer is correct, that object will turn colorful. If it's wrong, it stays black and white and you can try again.\n\nIf you're stuck and don't know the answer, click the Hint button (💡) that appears after selecting an object. You'll be given two questions to answer correctly — get them both right to reveal the German name of the object.\n\nComplete all objects in a room to finish it. Good luck!`
    },
    {
      image: "/assets/image-fix/tutorial/step-1.png",
      title: "Step 1 — Choose a Room",
      description: "Select and click one of the available rooms to start your vocabulary challenge."
    },
    {
      image: "/assets/image-fix/tutorial/step-2.png",
      title: "Step 2 — Click an Object",
      description: "Once inside the room, click on any object in the scene to begin guessing its German name."
    },
    {
      image: "/assets/image-fix/tutorial/step-3.png",
      title: "Step 3 — Enter the German Word",
      description: "Type the German name of the object you clicked (including the article: der, die, or das), then click Prüfen to check your answer."
    },
    {
      image: "/assets/image-fix/tutorial/step-4.png",
      title: "Step 4 — Use the Hint Button",
      description: "If you don't know the answer, click the hint button (💡) that appears when an object is selected to get help."
    },
    {
      image: "/assets/image-fix/tutorial/step-5.png",
      title: "Step 5 — Answer the Hint Questions",
      description: "Two questions will appear. Answer them both correctly and click Prüfen after each one to unlock the answer."
    },
    {
      image: "/assets/image-fix/tutorial/step-6.png",
      title: "Step 6 — Confirm Your Answer",
      description: "Once the hint is unlocked, the correct German word will be filled in automatically. Click Prüfen to confirm it."
    },
    {
      image: "/assets/image-fix/tutorial/step-7.png",
      title: "Step 7 — Watch It Come to Life!",
      description: "If your answer is correct, the object will change from black and white to full color. Complete all objects to finish the room!"
    },
  ];

  const TOTAL_STEPS = tutorialSteps.length - 1; // 0–7, so 7 is last

  const handleTutorialOpen = () => {
    setTutorialStep(0);
    setIsTutorialOpen(true);
  };

  const handleTutorialClose = () => {
    setIsTutorialOpen(false);
  };

  const handleTutorialNext = () => {
    setTutorialStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleTutorialPrev = () => {
    setTutorialStep(prev => Math.max(prev - 1, 0));
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

      {/* 2. ASPECT RATIO CONTAINER (16:9 LOCKED WITH VIEWPONT-HEIGHT CONSTRAINTS) */}
      <div className="relative w-[min(100%,calc(90vh*16/9))] max-w-[1000px] aspect-video bg-cover bg-center border-4 border-zinc-900 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] overflow-hidden bg-zinc-950">
        
        {/* TOP LEFT BUTTONS: Menü + Tutorial */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onBackToMenu}
            className="flex items-center justify-center gap-1.5 bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full px-4 py-2 text-xs font-extrabold text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Menü
          </button>

          <button
            onClick={handleTutorialOpen}
            className="flex items-center justify-center gap-1.5 bg-[#ffd8a8] hover:bg-[#ffcc8a] border-2 border-zinc-900 rounded-full px-4 py-2 text-xs font-extrabold text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer"
            aria-label="Tutorial"
          >
            <svg className="w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tutorial
          </button>
        </div>

        {/* TOP RIGHT SOUND TOGGLE */}
        <button
          onClick={() => setIsSoundOn(!isSoundOn)}
          className="absolute top-4 right-16 z-20 flex items-center justify-center bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full w-9 h-9 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer pointer-events-auto"
          aria-label="Sound toggeln"
        >
          {isSoundOn ? (
            <svg className="w-4 h-4 text-[#ff6f61]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9H4.5A1.5 1.5 0 003 10.5v3A1.5 1.5 0 004.5 15h3.25L12 18.75z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H3v6h1.5l3.75 3.25V5.25z" />
            </svg>
          )}
        </button>

        {/* TOP RIGHT SETTINGS (COG) */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-4 right-4 z-20 flex items-center justify-center bg-white/90 hover:bg-white border-2 border-zinc-900 rounded-full w-9 h-9 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer pointer-events-auto"
          aria-label="Einstellungen"
        >
          <svg className="w-4 h-4 text-[#ff6f61] animate-[spin_10s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* LOADING INDICATOR Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-10 w-10 text-[#ff6f61]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-zinc-800 font-extrabold text-sm">Synchronisieren...</span>
            </div>
          </div>
        )}

        {/* TUTORIAL MODAL */}
        {isTutorialOpen && (() => {
          const step = tutorialSteps[tutorialStep];
          return (
            <div className="absolute inset-0 z-50 bg-zinc-950/85 flex items-center justify-center p-3">
              <div className="relative w-full max-w-[680px] bg-white border-4 border-zinc-900 rounded-[1.5rem] shadow-[8px_8px_0px_0px_#18181b] flex flex-col overflow-hidden max-h-[95%]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#ff6f61]">📖</span>
                    <h3 className="font-adigiana text-lg md:text-xl font-black text-zinc-900">{step.title}</h3>
                  </div>
                  <button
                    onClick={handleTutorialClose}
                    className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-900 rounded-full w-7 h-7 md:w-8 md:h-8 text-zinc-700 font-extrabold text-xs shadow-[1.5px_1.5px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label="Close tutorial"
                  >✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {/* Step 0: text-only intro */}
                  {step.image === null ? (
                    <div className="bg-[#fffde7] border-2 border-zinc-200 rounded-xl p-4 md:p-5">
                      {step.description.split('\n\n').map((para, i) => (
                        <p key={i} className={`text-zinc-700 font-semibold text-xs md:text-sm leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>
                          {para}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Lazy-load image: only rendered when this step is active */}
                      <div className="w-full rounded-xl overflow-hidden border-2 border-zinc-200 bg-zinc-100 flex items-center justify-center min-h-[160px] md:min-h-[220px]">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-auto object-contain max-h-[240px] md:max-h-[320px]"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-3 text-zinc-700 font-semibold text-xs md:text-sm leading-relaxed text-center">
                        {step.description}
                      </p>
                    </>
                  )}
                </div>

                {/* Footer: step dots + prev/next */}
                <div className="px-5 py-3.5 border-t-2 border-zinc-100 flex items-center justify-between gap-3">
                  {/* Prev */}
                  <button
                    onClick={handleTutorialPrev}
                    disabled={tutorialStep === 0}
                    className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-zinc-900 rounded-full px-3 py-1.5 text-xs font-extrabold text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Back
                  </button>

                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {tutorialSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTutorialStep(i)}
                        className={`rounded-full transition-all ${i === tutorialStep ? 'w-5 h-2.5 bg-[#ff6f61]' : 'w-2 h-2 bg-zinc-300 hover:bg-zinc-400'}`}
                      />
                    ))}
                  </div>

                  {/* Next / Done */}
                  {tutorialStep < TOTAL_STEPS ? (
                    <button
                      onClick={handleTutorialNext}
                      className="flex items-center gap-1.5 bg-[#ff6f61] hover:bg-[#e05a50] border-2 border-zinc-900 rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Next
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleTutorialClose}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 border-2 border-zinc-900 rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow-[2px_2px_0px_0px_#18181b] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Let&apos;s Play! 🎮
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* 3. SETTINGS MODAL OVERLAY */}
        {isSettingsOpen && (
          <div className="absolute inset-0 z-30 bg-zinc-950/70 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-sm bg-white border-4 border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] shadow-[6px_6px_0px_0px_#18181b] p-4 md:p-6 max-h-[95%] flex flex-col overflow-y-auto pointer-events-auto select-none">
              
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors font-extrabold text-xl cursor-pointer"
                aria-label="Schließen"
              >
                ✕
              </button>

              <h3 className="font-adigiana text-2xl md:text-3xl font-extrabold text-zinc-900 text-center mb-3 md:mb-4 pb-1.5 md:pb-2 border-b-3 border-zinc-100">
                Einstellungen
              </h3>

              <div className="flex items-center gap-3 bg-[#fffde7] border-3 border-zinc-900 rounded-2xl p-2.5 md:p-3.5 shadow-[3px_3px_0px_0px_#18181b] mb-4 md:mb-6">
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

              <div className="flex flex-col gap-3 md:gap-4 text-left">
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

              {/* Abmelden (Logout) Button (EXCLUSIVE TO PAGE 2 SETTINGS) */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="font-adigiana mt-5 w-full bg-zinc-100 hover:bg-zinc-200 border-3 border-zinc-900 rounded-full py-2 px-4 text-zinc-950 font-extrabold text-base shadow-[3px_3px_0px_0px_#18181b] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Abmelden
              </button>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="font-adigiana mt-3 w-full bg-[#ff6f61] border-3 border-zinc-900 rounded-full py-2 px-4 text-white font-extrabold text-base shadow-[3px_3px_0px_0px_#18181b] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
              >
                Schließen
              </button>

            </div>
          </div>
        )}

        {/* 4. INTERACTIVE SVG OVERLAYS */}
        <svg
          viewBox="0 0 2730 1536"
          className="absolute inset-0 w-full h-full z-10 select-none pointer-events-auto"
        >
          <defs>
            <filter id="grayscale-effect">
              <feColorMatrix
                type="matrix"
                values="0.33 0.33 0.33 0 0
                        0.33 0.33 0.33 0 0
                        0.33 0.33 0.33 0 0
                        0    0    0    1 0"
              />
            </filter>
            <clipPath id="clip-room-kamar">
              <polygon points="968,252 505,635 508,865 1438,872 1435,645" />
            </clipPath>
            <clipPath id="clip-room-ruang-tamu">
              <polygon points="508,932 511,1445 1428,1442 1435,942" />
            </clipPath>
            <clipPath id="clip-room-dapur">
              <polygon points="1431,838 1431,872 1478,868 1475,938 1438,935 1431,1392 2078,1395 2065,842" />
            </clipPath>
          </defs>

          {/* LAYER 1: Alas Paling Bawah (Colored Background) */}
          <image
            href="/assets/image-fix/halaman-2.png"
            x="0"
            y="0"
            width="2730"
            height="1536"
          />

          {/* LAYER 2: Lapisan Hitam-Putih di Atasnya (Grayscale Overlays for Locked Rooms) */}
          {!rooms.room_kamar && (
            <image
              href="/assets/image-fix/halaman-2.png"
              x="0"
              y="0"
              width="2730"
              height="1536"
              filter="url(#grayscale-effect)"
              clipPath="url(#clip-room-kamar)"
            />
          )}
          {!rooms.room_ruang_tamu && (
            <image
              href="/assets/image-fix/halaman-2.png"
              x="0"
              y="0"
              width="2730"
              height="1536"
              filter="url(#grayscale-effect)"
              clipPath="url(#clip-room-ruang-tamu)"
            />
          )}
          {!rooms.room_dapur && (
            <image
              href="/assets/image-fix/halaman-2.png"
              x="0"
              y="0"
              width="2730"
              height="1536"
              filter="url(#grayscale-effect)"
              clipPath="url(#clip-room-dapur)"
            />
          )}

          {/* LAYER 3: Interactive Click Polygons */}
          {/* Kamar Click Area */}
          <polygon
            points="968,252 505,635 508,865 1438,872 1435,645"
            onClick={!rooms.room_kamar ? () => handleRoomClick("room_kamar_tidur", "Schlafzimmer") : undefined}
            className={`transition-all duration-300 ${
              !rooms.room_kamar
                ? "interactive-room-btn fill-white/0 hover:fill-white/10 cursor-pointer pointer-events-auto"
                : "pointer-events-none fill-none"
            }`}
            aria-label="Schlafzimmer"
          />

          {/* Ruang Tamu Click Area */}
          <polygon
            points="508,932 511,1445 1428,1442 1435,942"
            onClick={!rooms.room_ruang_tamu ? () => handleRoomClick("room_ruang_tamu", "Wohnzimmer") : undefined}
            className={`transition-all duration-300 ${
              !rooms.room_ruang_tamu
                ? "interactive-room-btn fill-white/0 hover:fill-white/10 cursor-pointer pointer-events-auto"
                : "pointer-events-none fill-none"
            }`}
            aria-label="Wohnzimmer"
          />

          {/* Dapur Click Area */}
          <polygon
            points="1431,838 1431,872 1478,868 1475,938 1438,935 1431,1392 2078,1395 2065,842"
            onClick={!rooms.room_dapur ? () => handleRoomClick("room_dapur", "Küche") : undefined}
            className={`transition-all duration-300 ${
              !rooms.room_dapur
                ? "interactive-room-btn fill-white/0 hover:fill-white/10 cursor-pointer pointer-events-auto"
                : "pointer-events-none fill-none"
            }`}
            aria-label="Küche"
          />

          {/* 5. VISUAL LOCK INDICATORS OVERLAYS (UNCLIPPED FOR READABILITY) */}
          
          {/* Schlafzimmer Lock */}
          {!rooms.room_kamar && (
            <foreignObject
              x="670"
              y="410"
              width="600"
              height="300"
              className="overflow-visible pointer-events-none"
            >
              <div className="flex flex-col items-center justify-center text-white text-center select-none font-fredoka">
                <svg
                  className="w-20 h-20 text-[#ffd8a8] mb-2.5 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] animate-[pulse_2s_infinite]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-4xl md:text-5xl font-black uppercase tracking-wide drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)]">
                  Schlafzimmer
                </span>
                <span className="text-lg md:text-2xl font-bold text-zinc-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mt-1">
                  Mulai Kuis
                </span>
              </div>
            </foreignObject>
          )}

          {/* Wohnzimmer Lock (ENLARGED) */}
          {!rooms.room_ruang_tamu && (
            <foreignObject
              x="670"
              y="1030"
              width="600"
              height="300"
              className="overflow-visible pointer-events-none"
            >
              <div className="flex flex-col items-center justify-center text-white text-center select-none font-fredoka">
                <svg
                  className="w-20 h-20 text-[#ffd8a8] mb-2.5 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] animate-[pulse_2s_infinite]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-4xl md:text-5xl font-black uppercase tracking-wide drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)]">
                  Wohnzimmer
                </span>
                <span className="text-lg md:text-2xl font-bold text-zinc-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mt-1">
                  Mulai Kuis
                </span>
              </div>
            </foreignObject>
          )}

          {/* Küche Lock (ENLARGED) */}
          {!rooms.room_dapur && (
            <foreignObject
              x="1450"
              y="960"
              width="600"
              height="300"
              className="overflow-visible pointer-events-none"
            >
              <div className="flex flex-col items-center justify-center text-white text-center select-none font-fredoka">
                <svg
                  className="w-20 h-20 text-[#ffd8a8] mb-2.5 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] animate-[pulse_2s_infinite]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-4xl md:text-5xl font-black uppercase tracking-wide drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)]">
                  Küche
                </span>
                <span className="text-lg md:text-2xl font-bold text-zinc-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mt-1">
                  Mulai Kuis
                </span>
              </div>
            </foreignObject>
          )}

        </svg>

        {/* LOGOUT CONFIRM MODAL */}
        {showLogoutModal && (
          <LogoutConfirmModal
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}

      </div>
    </div>
  );
}
