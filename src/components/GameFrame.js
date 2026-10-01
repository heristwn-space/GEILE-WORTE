"use client";

/**
 * GameFrame Component
 *
 * Creates a premium cartoon wooden game board presentation layer around the fixed 16:9 game canvas.
 * - Scenic outdoor cartoon landscape with trees, sakura, birds, butterflies, stars.
 * - All decorative elements: pointer-events-none, placed behind or around the canvas.
 * - Wooden frame border is fully warm brown (no black gap).
 * - Zero interference with SVG viewBox, polygons, hitboxes, or gameplay.
 */
export default function GameFrame({ children, showOrientationCheck = true, toast = null }) {
  return (
    <div
      className="relative flex items-center justify-center min-h-screen w-full overflow-hidden select-none"
      style={{ background: "linear-gradient(180deg, #85c8ef 0%, #b9dff5 25%, #d6f0ea 60%, #e8f7d4 100%)" }}
    >

      {/* === PORTRAIT ORIENTATION LOCK === */}
      {showOrientationCheck && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center text-zinc-950 text-center p-6 portrait:flex landscape:hidden select-none"
          style={{ background: "linear-gradient(135deg, #ffd8a8 0%, #ff922b 100%)" }}
        >
          <div
            className="mb-6 p-4 rounded-2xl bg-white animate-bounce"
            style={{ border: "4px solid #5c3410", boxShadow: "6px 6px 0px #5c3410" }}
          >
            <svg className="w-16 h-16 text-[#ff6f61] animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Bitte drehen Sie Ihr Handy!</h2>
          <p className="text-zinc-800 font-bold max-w-sm">
            Please rotate your phone to landscape mode to play the game properly.
          </p>
        </div>
      )}

      {/* Toast notifications */}
      {toast}

      {/* ===================================================================
          FULL SCENIC BACKGROUND LAYER (pointer-events-none, behind everything)
          =================================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">

        {/* Sky gradient reinforcement */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #6db8e8 0%, #a8d8f0 30%, #c8ecf5 60%, #ddf4e8 100%)" }} />

        {/* --- TWINKLING STARS --- */}
        <div className="absolute animate-star-1" style={{ top: "4%", left: "8%" }}>
          <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
            <polygon points="8,1 9.8,6.2 15.5,6.2 10.9,9.8 12.6,15 8,11.5 3.4,15 5.1,9.8 0.5,6.2 6.2,6.2" fill="#ffe066" stroke="#c8a200" strokeWidth="0.8" />
          </svg>
        </div>
        <div className="absolute animate-star-2 hidden sm:block" style={{ top: "3%", left: "22%" }}>
          <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" viewBox="0 0 16 16" fill="none">
            <polygon points="8,1 9.8,6.2 15.5,6.2 10.9,9.8 12.6,15 8,11.5 3.4,15 5.1,9.8 0.5,6.2 6.2,6.2" fill="#ffe066" stroke="#c8a200" strokeWidth="0.8" />
          </svg>
        </div>
        <div className="absolute animate-star-3 hidden md:block" style={{ top: "6%", right: "20%" }}>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
            <polygon points="8,1 9.8,6.2 15.5,6.2 10.9,9.8 12.6,15 8,11.5 3.4,15 5.1,9.8 0.5,6.2 6.2,6.2" fill="#ffe8a0" stroke="#c8a200" strokeWidth="0.8" />
          </svg>
        </div>
        <div className="absolute animate-star-4" style={{ top: "5%", right: "8%" }}>
          <svg className="w-2 h-2 sm:w-3 sm:h-3" viewBox="0 0 16 16" fill="none">
            <polygon points="8,1 9.8,6.2 15.5,6.2 10.9,9.8 12.6,15 8,11.5 3.4,15 5.1,9.8 0.5,6.2 6.2,6.2" fill="#ffe066" stroke="#c8a200" strokeWidth="0.8" />
          </svg>
        </div>

        {/* --- DRIFTING CLOUDS --- */}
        <div className="absolute top-[3%] left-0 animate-cloud-slow">
          <svg className="w-40 sm:w-56 h-auto drop-shadow-[0_5px_8px_rgba(0,0,0,0.07)]" viewBox="0 0 160 80" fill="none">
            <ellipse cx="80" cy="55" rx="72" ry="24" fill="white" opacity="0.95" />
            <ellipse cx="55" cy="45" rx="38" ry="30" fill="white" />
            <ellipse cx="95" cy="40" rx="34" ry="28" fill="white" />
            <ellipse cx="120" cy="50" rx="28" ry="18" fill="white" opacity="0.9" />
          </svg>
        </div>
        <div className="absolute top-[9%] left-0 animate-cloud-medium">
          <svg className="w-32 sm:w-44 h-auto opacity-90 drop-shadow-[0_4px_6px_rgba(0,0,0,0.05)]" viewBox="0 0 130 65" fill="none">
            <ellipse cx="65" cy="45" rx="58" ry="19" fill="white" opacity="0.95" />
            <ellipse cx="48" cy="35" rx="30" ry="24" fill="white" />
            <ellipse cx="82" cy="32" rx="28" ry="22" fill="white" />
          </svg>
        </div>
        <div className="absolute top-[6%] left-0 animate-cloud-fast hidden md:block">
          <svg className="w-24 h-auto opacity-80" viewBox="0 0 100 50" fill="none">
            <ellipse cx="50" cy="36" rx="44" ry="14" fill="white" opacity="0.95" />
            <ellipse cx="38" cy="28" rx="22" ry="18" fill="white" />
            <ellipse cx="62" cy="26" rx="20" ry="16" fill="white" />
          </svg>
        </div>

        {/* --- BIRDS Left to Right --- */}
        <div className="absolute top-[7%] left-0 animate-bird-glide">
          <svg className="w-14 sm:w-20 h-auto drop-shadow-sm" viewBox="0 0 70 35" fill="none">
            <path d="M4 18 Q13 6 22 15 Q31 6 40 18" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M44 10 Q51 3 57 9 Q63 3 69 10" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        {/* --- BIRDS Right to Left --- */}
        <div className="absolute top-[13%] left-0 animate-bird-glide-reverse hidden sm:block">
          <svg className="w-12 sm:w-16 h-auto drop-shadow-sm" viewBox="0 0 60 30" fill="none">
            <path d="M4 15 Q12 5 20 13 Q28 5 36 15" stroke="#27272a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* --- FALLING SAKURA PETALS --- */}
        <div className="absolute animate-sakura-1 hidden sm:block" style={{ top: 0, left: "5%" }}>
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path d="M10 2 Q14 6 14 10 Q10 14 6 10 Q6 6 10 2Z" fill="#ffc9c9" stroke="#f48fb1" strokeWidth="1" opacity="0.9" />
            <path d="M10 2 Q16 8 14 14 Q10 14 6 10 Q4 6 10 2Z" fill="#ffaab5" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute animate-sakura-2" style={{ top: 0, left: "18%" }}>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
            <path d="M10 2 Q14 6 14 10 Q10 14 6 10 Q6 6 10 2Z" fill="#ffe0ec" stroke="#f48fb1" strokeWidth="1" opacity="0.85" />
          </svg>
        </div>
        <div className="absolute animate-sakura-3 hidden sm:block" style={{ top: 0, right: "15%" }}>
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path d="M10 2 Q14 6 14 10 Q10 14 6 10 Q6 6 10 2Z" fill="#ffc9c9" stroke="#f48fb1" strokeWidth="1" opacity="0.9" />
          </svg>
        </div>
        <div className="absolute animate-sakura-4" style={{ top: 0, right: "30%" }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
            <path d="M10 2 Q14 6 14 10 Q10 14 6 10 Q6 6 10 2Z" fill="#ffb3c6" stroke="#f48fb1" strokeWidth="1" opacity="0.8" />
          </svg>
        </div>

        {/* --- LEFT DECORATIVE TREE --- */}
        <div className="absolute bottom-[12%] left-0 pointer-events-none animate-tree-sway hidden sm:block">
          <svg className="w-20 sm:w-28 md:w-36 h-auto drop-shadow-md" viewBox="0 0 120 200" fill="none">
            <rect x="48" y="130" width="24" height="70" rx="6" fill="#8B5E3C" stroke="#5c3410" strokeWidth="2.5" />
            <rect x="53" y="135" width="6" height="55" rx="3" fill="#a0714f" opacity="0.4" />
            <ellipse cx="60" cy="115" rx="48" ry="30" fill="#6abf4b" stroke="#3d7a28" strokeWidth="2.5" />
            <ellipse cx="60" cy="90" rx="40" ry="30" fill="#7dd354" stroke="#3d7a28" strokeWidth="2.5" />
            <ellipse cx="60" cy="65" rx="30" ry="26" fill="#8de864" stroke="#3d7a28" strokeWidth="2.5" />
            <ellipse cx="60" cy="45" rx="20" ry="20" fill="#9cf070" stroke="#4d9030" strokeWidth="2.5" />
            <ellipse cx="50" cy="75" rx="8" ry="5" fill="#b8f080" opacity="0.4" />
          </svg>
        </div>
        <div className="absolute bottom-[10%] left-[5%] pointer-events-none animate-tree-sway-delayed hidden md:block">
          <svg className="w-14 md:w-20 h-auto" viewBox="0 0 80 140" fill="none">
            <rect x="32" y="90" width="16" height="50" rx="5" fill="#8B5E3C" stroke="#5c3410" strokeWidth="2" />
            <ellipse cx="40" cy="80" rx="32" ry="20" fill="#6abf4b" stroke="#3d7a28" strokeWidth="2" />
            <ellipse cx="40" cy="60" rx="26" ry="22" fill="#7dd354" stroke="#3d7a28" strokeWidth="2" />
            <ellipse cx="40" cy="40" rx="18" ry="18" fill="#8de864" stroke="#3d7a28" strokeWidth="2" />
          </svg>
        </div>

        {/* --- RIGHT DECORATIVE TREE --- */}
        <div className="absolute bottom-[12%] right-0 pointer-events-none animate-tree-sway-delayed hidden sm:block">
          <svg className="w-20 sm:w-28 md:w-36 h-auto drop-shadow-md" viewBox="0 0 120 200" fill="none">
            <rect x="48" y="130" width="24" height="70" rx="6" fill="#8B5E3C" stroke="#5c3410" strokeWidth="2.5" />
            <rect x="53" y="135" width="6" height="55" rx="3" fill="#a0714f" opacity="0.4" />
            <ellipse cx="60" cy="115" rx="48" ry="30" fill="#6abf4b" stroke="#3d7a28" strokeWidth="2.5" />
            <ellipse cx="60" cy="90" rx="40" ry="30" fill="#7dd354" stroke="#3d7a28" strokeWidth="2.5" />
            <ellipse cx="60" cy="65" rx="30" ry="26" fill="#8de864" stroke="#3d7a28" strokeWidth="2.5" />
            <ellipse cx="60" cy="45" rx="20" ry="20" fill="#9cf070" stroke="#4d9030" strokeWidth="2.5" />
            <ellipse cx="70" cy="75" rx="8" ry="5" fill="#b8f080" opacity="0.4" />
          </svg>
        </div>

        {/* --- BUTTERFLY --- */}
        <div className="absolute top-[30%] right-[3%] sm:right-[5%] hidden sm:block animate-butterfly-path">
          <div className="animate-butterfly-wing">
            <svg className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)]" viewBox="0 0 36 36" fill="none">
              <path d="M18 18 C14 10 4 8 6 18 C8 24 16 20 18 18 Z" fill="#ffd166" stroke="#5c3410" strokeWidth="1.5" />
              <path d="M18 18 C22 10 32 8 30 18 C28 24 20 20 18 18 Z" fill="#ffd166" stroke="#5c3410" strokeWidth="1.5" />
              <path d="M18 18 C12 22 8 28 14 30 C18 30 18 22 18 18 Z" fill="#ff9f43" stroke="#5c3410" strokeWidth="1.5" />
              <path d="M18 18 C24 22 28 28 22 30 C18 30 18 22 18 18 Z" fill="#ff9f43" stroke="#5c3410" strokeWidth="1.5" />
              <line x1="18" y1="12" x2="18" y2="28" stroke="#5c3410" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 12 Q15 6 12 7" stroke="#5c3410" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M18 12 Q21 6 24 7" stroke="#5c3410" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* --- ROLLING HILLS (3 layers) --- */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "22%" }}>
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 130" preserveAspectRatio="none">
            <path d="M0,70 Q200,20 450,50 Q650,80 900,25 T1200,45 L1200,130 L0,130 Z" fill="#b4d979" />
          </svg>
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 130" preserveAspectRatio="none">
            <path d="M0,90 Q300,40 600,70 Q850,95 1000,50 T1200,70 L1200,130 L0,130 Z" fill="#92ca58" />
          </svg>
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 130" preserveAspectRatio="none">
            <path d="M0,110 Q200,90 450,105 Q700,120 950,95 T1200,108 L1200,130 L0,130 Z" fill="#78b840" />
          </svg>
        </div>

        {/* --- BOTTOM LEFT: FENCE + FLOWERS --- */}
        <div className="absolute bottom-0 left-1 sm:left-3 flex items-end gap-1 pointer-events-none" style={{ zIndex: 2 }}>
          <div className="hidden sm:flex items-end gap-[3px]">
            {[30, 38, 33, 40, 28].map((h, i) => (
              <div key={i} className="w-3.5 flex-shrink-0 rounded-t-md relative"
                style={{ background: "linear-gradient(180deg, #e8a96a 0%, #c47d3e 100%)", border: "1.5px solid #5c3410", boxShadow: "1.5px 1.5px 0 #5c3410", height: `${h}px` }}>
                <div className="absolute top-1 left-1 w-1 h-1 rounded-full" style={{ background: "#8B5E3C" }} />
              </div>
            ))}
          </div>
          <div className="animate-sway-right">
            <svg className="w-5 h-8 sm:w-7 sm:h-10" viewBox="0 0 28 40" fill="none">
              <path d="M14 40 Q9 20 5 10 Q12 22 14 40" fill="#7ec832" stroke="#4a7a1a" strokeWidth="1.5" />
              <path d="M14 40 Q19 15 23 8 Q17 24 14 40" fill="#a0e050" stroke="#4a7a1a" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="animate-sway-left">
            <svg className="w-7 h-12 sm:w-8 sm:h-14 drop-shadow-sm" viewBox="0 0 32 52" fill="none">
              <path d="M16 52 Q15 32 16 16" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 36 Q8 32 6 38 Q12 42 16 37" fill="#84cc16" stroke="#18181b" strokeWidth="1.5" />
              <circle cx="16" cy="8" r="4.5" fill="#ffc9c9" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="10" cy="12" r="4.5" fill="#ffc9c9" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="22" cy="12" r="4.5" fill="#ffc9c9" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="12" cy="20" r="4.5" fill="#ffc9c9" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="20" cy="20" r="4.5" fill="#ffc9c9" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="16" cy="14" r="4" fill="#fcc419" stroke="#18181b" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="animate-sway-right hidden sm:block">
            <svg className="w-6 h-10 sm:w-7 sm:h-12 drop-shadow-sm" viewBox="0 0 28 48" fill="none">
              <path d="M14 48 Q13 28 14 14" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="14" cy="7" r="4" fill="#ffe066" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="9" cy="11" r="4" fill="#ffe066" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="19" cy="11" r="4" fill="#ffe066" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="11" cy="17" r="4" fill="#ffe066" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="17" cy="17" r="4" fill="#ffe066" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="14" cy="13" r="3.5" fill="#ff922b" stroke="#18181b" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* --- BOTTOM RIGHT: FENCE + FLOWERS --- */}
        <div className="absolute bottom-0 right-1 sm:right-3 flex items-end gap-1 pointer-events-none flex-row-reverse" style={{ zIndex: 2 }}>
          <div className="hidden sm:flex items-end gap-[3px]">
            {[36, 28, 40, 32, 38].map((h, i) => (
              <div key={i} className="w-3.5 flex-shrink-0 rounded-t-md relative"
                style={{ background: "linear-gradient(180deg, #e8a96a 0%, #c47d3e 100%)", border: "1.5px solid #5c3410", boxShadow: "1.5px 1.5px 0 #5c3410", height: `${h}px` }}>
                <div className="absolute top-1 left-1 w-1 h-1 rounded-full" style={{ background: "#8B5E3C" }} />
              </div>
            ))}
          </div>
          <div className="animate-sway-left">
            <svg className="w-5 h-8 sm:w-7 sm:h-10" viewBox="0 0 28 40" fill="none">
              <path d="M14 40 Q9 18 5 8 Q10 22 14 40" fill="#a0e050" stroke="#4a7a1a" strokeWidth="1.5" />
              <path d="M14 40 Q19 22 23 12 Q18 24 14 40" fill="#7ec832" stroke="#4a7a1a" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="animate-sway-right">
            <svg className="w-7 h-12 sm:w-8 sm:h-14 drop-shadow-sm" viewBox="0 0 32 52" fill="none">
              <path d="M16 52 Q17 32 16 16" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 34 Q24 30 26 36 Q20 40 16 35" fill="#84cc16" stroke="#18181b" strokeWidth="1.5" />
              <circle cx="16" cy="8" r="4.5" fill="#ffffff" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="10" cy="12" r="4.5" fill="#ffffff" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="22" cy="12" r="4.5" fill="#ffffff" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="12" cy="20" r="4.5" fill="#ffffff" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="20" cy="20" r="4.5" fill="#ffffff" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="16" cy="14" r="4" fill="#fab005" stroke="#18181b" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="animate-sway-left hidden sm:block">
            <svg className="w-6 h-10 sm:w-7 sm:h-12 drop-shadow-sm" viewBox="0 0 28 48" fill="none">
              <path d="M14 48 Q15 28 14 14" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="14" cy="7" r="4" fill="#d8b4fe" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="9" cy="11" r="4" fill="#d8b4fe" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="19" cy="11" r="4" fill="#d8b4fe" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="11" cy="17" r="4" fill="#d8b4fe" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="17" cy="17" r="4" fill="#d8b4fe" stroke="#18181b" strokeWidth="1.2" />
              <circle cx="14" cy="13" r="3.5" fill="#9333ea" stroke="#18181b" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* --- SPARKLES --- */}
        <div className="absolute animate-sparkle hidden sm:block" style={{ top: "18%", left: "3%" }}>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" fill="#ffe066" stroke="#c8a200" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute animate-sparkle-delayed hidden sm:block" style={{ top: "22%", right: "3%" }}>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" fill="#ffe066" stroke="#c8a200" strokeWidth="0.5" />
          </svg>
        </div>

      </div>

      {/* ===================================================================
          WOODEN BOARD FRAME + CANVAS (z-10)
          =================================================================== */}
      <div className="relative z-10 w-[min(100%,calc(90vh*16/9))] max-w-[1000px] aspect-video flex items-center justify-center py-2 sm:py-3 md:py-4 px-4 sm:px-[23px] md:px-[30px]">

        {/* Outer drop shadow ring */}
        <div
          className="absolute inset-0 rounded-[2.5rem] sm:rounded-[3rem] pointer-events-none -z-20"
          style={{ boxShadow: "0 20px 50px rgba(50,20,5,0.45), 0 8px 20px rgba(50,20,5,0.3)" }}
        />

        {/* WOODEN BEZEL â€” fully warm brown, no black border */}
        <div
          className="absolute inset-0 rounded-[2.4rem] sm:rounded-[2.8rem] pointer-events-none -z-10 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #e8a86a 0%, #c87d3e 35%, #a35c22 70%, #8b4a18 100%)",
            outline: "3px solid #5c3410",
            outlineOffset: "-1px",
            boxShadow: "inset 0 3px 8px rgba(255,220,160,0.35), inset 0 -3px 8px rgba(40,15,0,0.3)",
          }}
        >
          {/* Plank grooves */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 55px, rgba(0,0,0,0.25) 55px, rgba(0,0,0,0.25) 57px)" }} />
          {/* Top sheen */}
          <div className="absolute inset-x-0 top-0 pointer-events-none rounded-t-[2.4rem] sm:rounded-t-[2.8rem]"
            style={{ height: "35%", background: "linear-gradient(180deg, rgba(255,230,180,0.30) 0%, transparent 100%)" }} />
          {/* Bottom depth */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none rounded-b-[2.4rem] sm:rounded-b-[2.8rem]"
            style={{ height: "35%", background: "linear-gradient(0deg, rgba(40,15,0,0.30) 0%, transparent 100%)" }} />
          {/* Inner bevel line */}
          <div className="absolute pointer-events-none rounded-[2rem] sm:rounded-[2.4rem]"
            style={{ inset: "6px", border: "2px solid rgba(255,210,140,0.30)" }} />

          {/* Corner Peg Screws (warm wood, brown outline) */}
          {[
            { pos: "top-2 left-2.5 sm:top-2.5 sm:left-3.5", rot: "rotate-45" },
            { pos: "top-2 right-2.5 sm:top-2.5 sm:right-3.5", rot: "-rotate-45" },
            { pos: "bottom-2 left-2.5 sm:bottom-2.5 sm:left-3.5", rot: "-rotate-12" },
            { pos: "bottom-2 right-2.5 sm:bottom-2.5 sm:right-3.5", rot: "rotate-45" },
          ].map(({ pos, rot }, i) => (
            <div key={i} className={`absolute ${pos} pointer-events-none w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center`}
              style={{ background: "radial-gradient(circle at 35% 35%, #f5c680, #c47d3e)", border: "2px solid #5c3410", boxShadow: "1.5px 1.5px 0 #5c3410" }}>
              <div className={`w-2 h-0.5 rounded-full ${rot}`} style={{ background: "#7c4b1e" }} />
            </div>
          ))}

          {/* Side wood knot accents */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-25" viewBox="0 0 20 20" fill="none">
              <ellipse cx="10" cy="10" rx="8" ry="5" stroke="#5c3410" strokeWidth="1.5" />
              <ellipse cx="10" cy="10" rx="4" ry="2.5" stroke="#5c3410" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-25" viewBox="0 0 20 20" fill="none">
              <ellipse cx="10" cy="10" rx="8" ry="5" stroke="#5c3410" strokeWidth="1.5" />
              <ellipse cx="10" cy="10" rx="4" ry="2.5" stroke="#5c3410" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* CORNER LEAF (top-left) */}
        <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 pointer-events-none z-20 animate-leaf-breeze">
          <svg className="w-9 h-9 sm:w-12 sm:h-12 drop-shadow-[2px_2px_0px_#5c3410]" viewBox="0 0 48 48" fill="none">
            <path d="M12 36 C8 24 16 12 32 8 C30 20 22 32 12 36 Z" fill="#84cc16" stroke="#5c3410" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M14 34 C18 26 24 20 30 10" stroke="#4d7c0f" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 38 C14 42 6 42 4 44 C8 36 12 34 18 38 Z" fill="#a3e635" stroke="#5c3410" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
        {/* CORNER LEAF (bottom-right) */}
        <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 pointer-events-none z-20 animate-tree-sway-delayed">
          <svg className="w-7 h-7 sm:w-10 sm:h-10 drop-shadow-[2px_2px_0px_#5c3410]" viewBox="0 0 40 40" fill="none">
            <path d="M28 8 C32 20 24 32 8 36 C10 24 18 12 28 8 Z" fill="#84cc16" stroke="#5c3410" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M26 10 C22 18 16 24 10 34" stroke="#4d7c0f" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* ============================================================
            GAME CANVAS â€” unchanged, exactly fills remaining inner area
            ============================================================ */}
        <div className="relative w-full h-full z-0 overflow-hidden rounded-[1.8rem] sm:rounded-[2.2rem]">
          {children}
          {/* Subtle inner wood frame depth overlay */}
          <div
            className="absolute inset-0 rounded-[1.8rem] sm:rounded-[2.2rem] pointer-events-none z-30"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(92,52,16,0.35), inset 0 2px 4px rgba(60,25,5,0.2)",
            }}
          />
        </div>

      </div>
    </div>
  );
}
