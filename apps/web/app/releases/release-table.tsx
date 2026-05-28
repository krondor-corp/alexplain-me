"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAudio } from "../audio-context";
import {
  ChevronDownIcon,
  DownloadIcon,
  LinkIcon,
  PauseIcon,
  PlayIcon,
} from "../icons";

type Release = {
  slug: string;
  name: string;
  artUrl?: string;
  tracks: { name: string; url: string }[];
};

export function ReleaseTable({ releases }: { releases: Release[] }) {
  const { track: currentTrack, playing, playQueue, toggle } = useAudio();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="border-y border-border">
      {releases.map((release) => {
        const isReleaseActive = release.tracks.some(
          (t) => t.url === currentTrack?.url,
        );
        const isReleasePlaying = isReleaseActive && playing;
        const isOpen = expanded === release.slug;

        return (
          <div
            key={release.slug}
            className="border-b border-border last:border-b-0"
          >
            <div
              className="flex items-center gap-4 px-3 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => setExpanded(isOpen ? null : release.slug)}
            >
              <div className="w-12 h-12 shrink-0 border border-border bg-muted overflow-hidden">
                {release.artUrl && (
                  <Image
                    src={release.artUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="truncate">{release.name}</div>
                <div className="text-muted-foreground text-xs">
                  {release.tracks.length} track
                  {release.tracks.length !== 1 ? "s" : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isReleaseActive) {
                    toggle();
                  } else {
                    playQueue(release.tracks);
                  }
                }}
                className={`shrink-0 w-9 h-9 flex items-center justify-center border border-border transition-colors ${
                  isReleasePlaying
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={
                  isReleasePlaying
                    ? `Pause ${release.name}`
                    : `Play ${release.name}`
                }
              >
                {isReleasePlaying ? (
                  <PauseIcon size={14} />
                ) : (
                  <PlayIcon size={14} />
                )}
              </button>

              <Link
                href={`/releases/${release.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                title="Open release"
                aria-label={`Open ${release.name}`}
              >
                <LinkIcon size={16} />
              </Link>

              <span
                className={`shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDownIcon size={16} />
              </span>
            </div>

            {isOpen && (
              <div className="bg-accent/20 border-t border-border">
                {release.tracks.map((track, i) => {
                  const isPlaying = currentTrack?.url === track.url;
                  const isActive = isPlaying && playing;

                  return (
                    <div
                      key={track.url}
                      className={`group flex items-center gap-4 px-4 py-2.5 cursor-pointer transition-colors ${
                        isPlaying ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                      onClick={() => {
                        if (isPlaying) {
                          toggle();
                        } else {
                          playQueue(release.tracks, i);
                        }
                      }}
                    >
                      <span className="w-12 text-center text-muted-foreground shrink-0 text-sm">
                        {isActive ? (
                          <PauseIcon size={12} />
                        ) : isPlaying ? (
                          <PlayIcon size={12} />
                        ) : (
                          `${i + 1}`
                        )}
                      </span>
                      <span
                        className={`flex-1 text-sm ${
                          isPlaying
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {track.name}
                      </span>
                      <a
                        href={track.url}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        title="Download"
                      >
                        <DownloadIcon size={14} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
