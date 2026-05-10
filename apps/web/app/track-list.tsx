"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useAudio } from "./audio-context";
import {
  DownloadIcon,
  LinkIcon,
  MusicNoteIcon,
  PauseIcon,
  PlayIcon,
  ShuffleIcon,
} from "./icons";

type TaggedTrack = {
  name: string;
  path: string;
  tag: string;
  url: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TrackList({
  tracks,
  songLinks = {},
}: {
  tracks: TaggedTrack[];
  songLinks?: Record<string, string>;
}) {
  const {
    track: currentTrack,
    queue,
    playing,
    playQueue,
    replaceQueue,
    toggle,
  } = useAudio();
  const [shuffleOn, setShuffleOn] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const queueTracks = useMemo(
    () => tracks.map((t) => ({ name: t.name, url: t.url })),
    [tracks],
  );

  const isPlayingFromList = tracks.some((t) => t.url === currentTrack?.url);

  const handlePlayAll = useCallback(() => {
    if (isPlayingFromList) {
      toggle();
    } else {
      setShuffleOn(false);
      playQueue(queueTracks);
    }
  }, [isPlayingFromList, toggle, playQueue, queueTracks]);

  const handleShuffle = useCallback(() => {
    if (shuffleOn) {
      setShuffleOn(false);
      if (isPlayingFromList && currentTrack) {
        const idx = queueTracks.findIndex((t) => t.url === currentTrack.url);
        replaceQueue(idx >= 0 ? queueTracks.slice(idx) : queueTracks);
      } else {
        playQueue(queueTracks);
      }
    } else {
      setShuffleOn(true);
      if (isPlayingFromList && currentTrack) {
        const rest = queueTracks.filter((t) => t.url !== currentTrack.url);
        replaceQueue([currentTrack, ...shuffle(rest)]);
      } else {
        playQueue(shuffle(queueTracks));
      }
    }
  }, [
    shuffleOn,
    isPlayingFromList,
    currentTrack,
    playQueue,
    replaceQueue,
    queueTracks,
  ]);

  const handleTrackClick = useCallback(
    (clickedTrack: TaggedTrack) => {
      if (currentTrack?.url === clickedTrack.url) {
        toggle();
      } else {
        const idx = tracks.indexOf(clickedTrack);
        const source = shuffleOn ? shuffle(queueTracks) : queueTracks;
        if (shuffleOn) {
          // Put clicked track first, shuffle the rest
          const rest = source.filter((t) => t.url !== clickedTrack.url);
          playQueue(
            [{ name: clickedTrack.name, url: clickedTrack.url }, ...rest],
            0,
          );
        } else {
          playQueue(queueTracks, idx);
        }
      }
    },
    [currentTrack, tracks, queueTracks, shuffleOn, toggle, playQueue],
  );

  // Detect if our queue is active
  const isOurQueue =
    isPlayingFromList &&
    queue.length > 0 &&
    queue.some((q) => tracks.some((t) => t.url === q.url));

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handlePlayAll}
          className={`flex items-center gap-1.5 text-sm px-3 py-1 border border-border transition-colors ${
            isOurQueue && playing
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isOurQueue && playing ? (
            <PauseIcon size={14} />
          ) : (
            <PlayIcon size={14} />
          )}
        </button>
        <button
          onClick={handleShuffle}
          className={`flex items-center gap-1.5 text-sm px-3 py-1 border border-border transition-colors ${
            shuffleOn
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShuffleIcon size={14} />
        </button>
      </div>

      <div>
        {tracks.map((track) => {
          const isPlaying = currentTrack?.url === track.url;
          const isActive = isPlaying && playing;

          return (
            <div
              key={track.path}
              className={`group flex items-center gap-4 py-2 px-3 border-b border-border cursor-pointer ${
                isPlaying ? "bg-accent" : ""
              }`}
              onClick={() => handleTrackClick(track)}
            >
              <span className="w-5 text-center text-muted-foreground shrink-0">
                {isActive ? (
                  <PauseIcon size={12} />
                ) : isPlaying ? (
                  <PlayIcon size={12} />
                ) : (
                  ""
                )}
              </span>

              <span className="flex-1">
                <span className="text-muted-foreground text-xs">
                  {track.tag} /{" "}
                </span>
                {track.name}
              </span>

              {songLinks[track.path] && (
                <Link
                  href={`/songs/${songLinks[track.path]}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  title="View songbook"
                >
                  <MusicNoteIcon size={14} />
                </Link>
              )}

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await navigator.clipboard.writeText(track.url);
                  } catch {
                    return;
                  }
                  setCopiedPath(track.path);
                  if (copyTimeout.current) clearTimeout(copyTimeout.current);
                  copyTimeout.current = setTimeout(
                    () => setCopiedPath(null),
                    1500,
                  );
                }}
                className="text-muted-foreground hover:text-foreground shrink-0"
                title="Copy link"
              >
                {copiedPath === track.path ? (
                  <span className="text-xs">copied</span>
                ) : (
                  <LinkIcon size={14} />
                )}
              </button>

              <a
                href={track.url}
                download
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground shrink-0"
                title="Download"
              >
                <DownloadIcon size={14} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
