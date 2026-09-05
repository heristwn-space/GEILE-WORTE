"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Toast from "./Toast";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("Männlich");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Bitte füllen Sie alle Felder aus!", "error");
      return;
    }

    if (isRegister && !username.trim()) {
      showToast("Bitte geben Sie einen Benutzernamen ein!", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Das Passwort muss mindestens 6 Zeichen lang sein!", "error");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Sign Up in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              gender,
            },
          },
        });

        if (error) throw error;

        // Insert additional fields into 'profiles' table
        if (data?.user) {
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: data.user.id,
              username: username.trim(),
              gender,
            },
          ]);

          if (profileError) {
            console.error("Error creating user profile in profiles table:", profileError);
          }
        }

        if (data?.user && data?.session === null) {
          showToast(
            "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail zur Bestätigung.",
            "success"
          );
        } else {
          showToast("Registrierung erfolgreich! Willkommen!", "success");
        }
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        showToast("Erfolgreich angemeldet! Spiel lädt...", "success");
      }
    } catch (err) {
      showToast(err.message || "Ein Fehler ist aufgetreten.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#fff9db] to-[#e8fbf3] overflow-hidden doodle-grid p-6 select-none">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Decorative floating shapes in background */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#ffd8a8] rounded-full opacity-60 animate-float-slow pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-[#a9e34b] rounded-3xl opacity-40 rotate-12 animate-float-medium pointer-events-none" />
      <div className="absolute top-1/4 right-1/6 w-16 h-16 bg-[#ffc9c9] rounded-lg opacity-50 -rotate-12 animate-float-fast pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/10 w-24 h-24 bg-[#99e9f2] rounded-2xl opacity-50 rotate-45 animate-float-slow pointer-events-none" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white border-4 border-zinc-900 rounded-[2rem] shadow-[8px_8px_0px_0px_#18181b] p-8 md:p-10 transition-all duration-300">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">
            {isRegister ? "Registrieren" : "Anmelden"}
          </h2>
          <p className="text-zinc-500 font-semibold text-sm">
            {isRegister
              ? "Erstelle ein Konto, um deinen Fortschritt zu speichern!"
              : "Melde dich an, um mit dem Lernen loszulegen!"}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          {isRegister && (
            <>
              {/* Username field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-700 font-bold text-sm ml-1">Benutzername</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="z.B. Andrian Budi"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-zinc-50 border-3 border-zinc-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff6f61]/25 focus:border-[#ff6f61] font-semibold text-zinc-900 transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Gender field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-700 font-bold text-sm ml-1">Geschlecht</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-zinc-50 border-3 border-zinc-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff6f61]/25 focus:border-[#ff6f61] font-semibold text-zinc-900 transition-all cursor-pointer"
                >
                  <option value="Männlich">Männlich (Male)</option>
                  <option value="Weiblich">Weiblich (Female)</option>
                </select>
              </div>
            </>
          )}

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-700 font-bold text-sm ml-1">E-Mail-Adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              disabled={loading}
              className="w-full px-4 py-3 bg-zinc-50 border-3 border-zinc-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff6f61]/25 focus:border-[#ff6f61] font-semibold text-zinc-900 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-700 font-bold text-sm ml-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-4 py-3 bg-zinc-50 border-3 border-zinc-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff6f61]/25 focus:border-[#ff6f61] font-semibold text-zinc-900 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#ff6f61] border-3 border-zinc-900 rounded-full py-3.5 px-8 text-white font-extrabold hover:scale-[1.03] active:scale-95 active:translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_#18181b] cursor-pointer text-center text-lg flex items-center justify-center gap-2 select-none"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : isRegister ? (
              "Konto erstellen"
            ) : (
              "Spiel betreten"
            )}
          </button>
        </form>

        {/* Toggle Form Switch */}
        <div className="mt-8 text-center border-t-2 border-zinc-100 pt-6">
          <p className="text-zinc-600 font-semibold text-sm">
            {isRegister
              ? "Hast du bereits ein Konto?"
              : "Neu bei Geile Worte?"}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setIsRegister(!isRegister);
              setEmail("");
              setPassword("");
              setUsername("");
              setGender("Männlich");
            }}
            className="mt-1 text-[#ff6f61] font-bold text-sm hover:underline focus:outline-none cursor-pointer"
          >
            {isRegister ? "Jetzt einloggen!" : "Erstelle jetzt dein Konto?"}
          </button>
        </div>
      </div>
    </div>
  );
}
