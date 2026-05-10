"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type Track = {
  name: string;
  url: string;
};

type AudioState = {
  track: Track | null;
  queue: Track[];
  playing: boolean;
  currentTime: number;
  duration: number;
};

type AudioActions = {
  playQueue: (tracks: Track[], startIndex?: number) => void;
  replaceQueue: (tracks: Track[]) => void;
  toggle: () => void;
  seek: (pct: number) => void;
  seekRelative: (seconds: number) => void;
  next: () => void;
  stop: () => void;
};

type AudioContextValue = AudioState & AudioActions;

const STORAGE_KEY = "alexplain-audio";

function saveState(
  track: Track,
  queue: Track[],
  time: number,
  playing: boolean,
) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ track, queue, time, playing }),
    );
  } catch {}
}

function loadState(): {
  track: Track;
  queue: Track[];
  time: number;
  playing: boolean;
} | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, queue: parsed.queue || [] };
  } catch {
    return null;
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

const Ctx = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be inside AudioProvider");
  return ctx;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const restoredRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // We need a ref for queue/track so onEnded can read current values
  const queueRef = useRef(queue);
  const trackRef = useRef(track);
  queueRef.current = queue;
  trackRef.current = track;

  // Restore state on mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadState();
    if (!saved) return;
    const audio = audioRef.current;
    if (!audio) return;
    pendingSeekRef.current = saved.time;
    audio.preload = "metadata";
    audio.src = saved.track.url;
    setTrack(saved.track);
    setQueue(saved.queue);
    setCurrentTime(saved.time);
    if (saved.playing) audio.play().catch(() => {});
  }, []);

  // Persist state periodically
  useEffect(() => {
    if (!track) return;
    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (audio) saveState(track, queue, audio.currentTime, !audio.paused);
    }, 2000);
    return () => clearInterval(interval);
  }, [track, queue]);

  const startTrack = useCallback((t: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = t.url;
    audio.play();
    setTrack(t);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const playQueue = useCallback(
    (tracks: Track[], startIndex = 0) => {
      if (tracks.length === 0) return;
      setQueue(tracks);
      startTrack(tracks[startIndex]);
    },
    [startTrack],
  );

  const replaceQueue = useCallback((tracks: Track[]) => {
    setQueue(tracks);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [track]);

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
  }, []);

  const seekRelative = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration, audio.currentTime + seconds),
    );
  }, []);

  const next = useCallback(() => {
    const q = queueRef.current;
    const cur = trackRef.current;
    if (!q.length || !cur) return;
    const idx = q.findIndex((t) => t.url === cur.url);
    if (idx === -1 || idx === q.length - 1) return;
    startTrack(q[idx + 1]);
  }, [startTrack]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setTrack(null);
    setQueue([]);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    clearState();
  }, []);

  const handleEnded = useCallback(() => {
    const q = queueRef.current;
    const cur = trackRef.current;
    if (q.length === 0 || !cur) {
      stop();
      return;
    }
    const idx = q.findIndex((t) => t.url === cur.url);
    if (idx === -1 || idx === q.length - 1) {
      stop();
      return;
    }
    const next = q[idx + 1];
    startTrack(next);
  }, [stop, startTrack]);

  // Sync playing state with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        track,
        queue,
        playing,
        currentTime,
        duration,
        playQueue,
        replaceQueue,
        toggle,
        seek,
        seekRelative,
        next,
        stop,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            if (pendingSeekRef.current !== null) {
              audioRef.current.currentTime = pendingSeekRef.current;
              pendingSeekRef.current = null;
            }
          }
        }}
        onEnded={handleEnded}
      />
    </Ctx.Provider>
  );
}
