"use client";

import { useState } from "react";
import { useAudio } from "./audio-context";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  NextTrackIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "./icons";

function formatTime(seconds: number): string {
  if (Number.isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function ProgressBar({
  currentTime,
  duration,
  seek,
  tall,
}: {
  currentTime: number;
  duration: number;
  seek: (pct: number) => void;
  tall?: boolean;
}) {
  if (duration <= 0) return null;
  return (
    <div
      className={`${tall ? "h-3" : "h-2"} bg-muted cursor-pointer`}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        seek(pct);
      }}
    >
      <div
        className="h-full bg-foreground transition-[width] duration-100 pointer-events-none"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />
    </div>
  );
}

export function NowPlaying() {
  const {
    track,
    queue,
    playing,
    currentTime,
    duration,
    toggle,
    seek,
    seekRelative,
    next,
    stop,
  } = useAudio();
  const [expanded, setExpanded] = useState(false);

  if (!track) return null;

  const currentIdx = queue.findIndex((t) => t.url === track.url);
  const remaining = currentIdx >= 0 ? queue.length - currentIdx - 1 : 0;
  const nextTrack =
    currentIdx >= 0 && currentIdx < queue.length - 1
      ? queue[currentIdx + 1]
      : null;

  if (expanded) {
    return (
      <div className="fixed inset-0 z-40 bg-background flex flex-col">
        <div className="flex justify-end px-6 py-4">
          <button
            onClick={() => setExpanded(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDownIcon size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="text-center">
            <p className="text-2xl">{track.name}</p>
            {nextTrack && (
              <p className="text-sm text-muted-foreground mt-2">
                up next: {nextTrack.name}
                {remaining > 1 && ` (+${remaining - 1})`}
              </p>
            )}
          </div>

          <div className="w-full max-w-sm">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              seek={seek}
              tall
            />
            {duration > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-10">
            <button
              onClick={() => seekRelative(-15)}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipBackIcon size={28} />
            </button>
            <button
              onClick={toggle}
              className="w-16 h-16 flex items-center justify-center border border-border rounded-full p-3"
            >
              {playing ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
            </button>
            <button
              onClick={() => seekRelative(15)}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForwardIcon size={28} />
            </button>
          </div>
          {nextTrack && (
            <button
              onClick={next}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <NextTrackIcon size={14} />
              <span>skip</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <ProgressBar currentTime={currentTime} duration={duration} seek={seek} />
      <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center shrink-0"
        >
          {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        </button>
        <span
          className="flex-1 truncate cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          {track.name}
        </span>
        {remaining > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            +{remaining}
          </span>
        )}
        {duration > 0 && (
          <span className="text-sm text-muted-foreground shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        )}
        <button
          onClick={() => setExpanded(true)}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <ChevronUpIcon size={16} />
        </button>
        <button
          onClick={stop}
          className="text-muted-foreground hover:text-foreground text-lg shrink-0"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
