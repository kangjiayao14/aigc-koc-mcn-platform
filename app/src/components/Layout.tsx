import { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from './CustomCursor';
import MouseTrail from './MouseTrail';
import AgentOrb from './AgentOrb';

/**
 * Layout - Page layout wrapper with all global overlays
 *
 * Includes:
 * - Navbar (fixed top)
 * - Footer (at bottom)
 * - CustomCursor (global)
 * - MouseTrail canvas (global)
 * - AgentOrb floating chat button (global)
 * - Global audio controller (default muted)
 * - Scanline overlay effect
 * - Page transition wrapper
 *
 * TODO: Integrate actual audio system with Web Audio API
 * TODO: Connect to actual user data store (Redux/Zustand)
 * TODO: Add page transition animations (AnimatePresence)
 */
export default function Layout() {
  const bgmSrc = '/audio/bgm.mp3';
  const musicStorageKey = 'pcg_music_enabled';
  const defaultMusicEnabled = true;

  const [musicEnabled, setMusicEnabled] = useState(() => {
    if (typeof window === 'undefined') return defaultMusicEnabled;
    const saved = window.localStorage.getItem(musicStorageKey);
    if (saved === null) return defaultMusicEnabled;
    return saved === 'true';
  });
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAutoplayRef = useRef(false);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.muted = false;
      await audio.play();
      pendingAutoplayRef.current = false;
    } catch {
      pendingAutoplayRef.current = true;
    }
  }, []);

  const handleMusicToggle = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(musicStorageKey, String(next));
      return next;
    });
  }, [musicStorageKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!musicEnabled) {
      audio.pause();
      return;
    }
    attemptPlay();
  }, [attemptPlay, musicEnabled]);

  useEffect(() => {
    const onFirstInteract = () => {
      if (!musicEnabled) return;
      if (!pendingAutoplayRef.current) return;
      attemptPlay();
    };

    window.addEventListener('pointerdown', onFirstInteract, { passive: true });
    window.addEventListener('keydown', onFirstInteract);
    window.addEventListener('touchstart', onFirstInteract, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
      window.removeEventListener('touchstart', onFirstInteract);
    };
  }, [attemptPlay, musicEnabled]);

  const isLanding = location.pathname === '/';

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-void text-text-primary">
      {/* Scanline overlay - only on landing and onboarding */}
      {(isLanding || location.pathname === '/onboarding') && (
        <div className="scanline-overlay" aria-hidden="true" />
      )}

      {/* Custom cursor - desktop only */}
      <CustomCursor />

      {/* Mouse trail effect - desktop only */}
      <MouseTrail />

      {/* Fixed Navbar */}
      <Navbar
        musicEnabled={musicEnabled}
        onMusicToggle={handleMusicToggle}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer - hidden on landing page */}
      {!isLanding && <Footer />}

      {/* Floating AI Agent Orb */}
      <AgentOrb />

      {/* Global Audio Controller (invisible) */}
      {/* TODO: Connect to Web Audio API */}
      {/* TODO: Load ambient-synthwave.mp3, loop play, fade in/out */}
      {/* TODO: Preload UI sound effects using AudioBuffer */}
      {/* TODO: Global mute toggle synced with Navbar button */}
      <audio
        id="global-bgm"
        ref={audioRef}
        src={bgmSrc}
        loop
        preload="auto"
        playsInline
        style={{ display: 'none' }}
      />
    </div>
  );
}
