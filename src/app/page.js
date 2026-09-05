"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import LoadingScreen from "@/components/LoadingScreen";
import AuthScreen from "@/components/AuthScreen";
import MainMenuScreen from "@/components/MainMenuScreen";
import RoomSelectionScreen from "@/components/RoomSelectionScreen";
import KitchenQuizScreen from "@/components/KitchenQuizScreen";
import LivingRoomQuizScreen from "@/components/LivingRoomQuizScreen";
import BedroomQuizScreen from "@/components/BedroomQuizScreen";

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("menu"); // "menu" or "rooms"

  // Lifted Audio States for seamless play across screens
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(50);
  
  const audioRef = useRef(null);

  useEffect(() => {
    // 1. Check current session status on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    });

    // 2. Listen for auth changes dynamically
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        setView("menu"); // Reset view to menu if logged out
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync Global Background Music Player
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
      if (isSoundOn) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay policy check: ", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isSoundOn, musicVolume]);

  // Global click sound effect listener for buttons, polygons, links, and interactive elements
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const button = e.target.closest("button");
      const polygon = e.target.closest("polygon");
      const isRoomBtn = e.target.closest(".interactive-room-btn");
      const link = e.target.closest("a");

      if (button || polygon || isRoomBtn || link) {
        // Play click sound if master sound is ON,
        // OR if the user is clicking a button that toggles the sound to ON.
        const isSoundToggle = button && (
          button.getAttribute("aria-label") === "Sound Umschalten" ||
          button.getAttribute("aria-label") === "Sound toggeln" ||
          button.textContent?.includes("Sound:")
        );

        if (isSoundOn || isSoundToggle) {
          const clickAudio = new Audio("/assets/sound/mouse-click.mp3");
          clickAudio.volume = sfxVolume / 100;
          clickAudio.play().catch((err) => {
            console.warn("SFX click playback blocked:", err);
          });
        }
      }
    };

    // Use capture phase (true) so the sound plays immediately,
    // before any React state changes unmount the target element.
    document.addEventListener("click", handleGlobalClick, true);
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
    };
  }, [isSoundOn, sfxVolume]);

  // Screen 1: Loading Screen while checking auth session state
  if (loading) {
    return <LoadingScreen />;
  }

  // Screen 2: Auth Screen if user is not authenticated
  if (!session) {
    return <AuthScreen />;
  }

  // Screen 3: Main Game Menu or Room Selection Screen depending on view state
  return (
    <>
      {view === "rooms" ? (
        <RoomSelectionScreen
          session={session}
          onBackToMenu={() => setView("menu")}
          onEnterRoom={(roomName) => setView(roomName)}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
        />
      ) : view === "kitchen" ? (
        <KitchenQuizScreen
          session={session}
          onBackToMenu={() => setView("rooms")}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
        />
      ) : view === "livingroom" ? (
        <LivingRoomQuizScreen
          session={session}
          onBackToMenu={() => setView("rooms")}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
        />
      ) : view === "bedroom" ? (
        <BedroomQuizScreen
          session={session}
          onBackToMenu={() => setView("rooms")}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
        />
      ) : (
        <MainMenuScreen
          session={session}
          onStartGame={() => setView("rooms")}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
        />
      )}

      {/* Global Persistent Background Music Tag */}
      <audio
        ref={audioRef}
        src="/assets/sound/cute-funny-kids-music-247318.mp3"
        loop
      />
    </>
  );
}
