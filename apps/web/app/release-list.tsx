"use client";

import Image from "next/image";
import { useAudio } from "./audio-context";
import { DownloadIcon, PauseIcon, PlayIcon } from "./icons";

type Release = {
  name: string;
  artUrl?: string;
  tracks: { name: string; url: string }[];
};

export function ReleaseList({ releases }: { releases: Release[] }) {
  const { track: currentTrack, playing, playQueue, toggle } = useAudio();

  return (
    <div className="space-y-12">
      {releases.map((release) => {
        const isReleaseActive = release.tracks.some(
          (t) => t.url === currentTrack?.url,
        );
        const isReleasePlaying = isReleaseActive && playing;

        return (
          <div key={release.name}>
            <div className="flex gap-6 mb-4 items-start">
              {release.artUrl && (
                <div
                  className="relative w-44 h-44 shrink-0 border border-border cursor-pointer group"
                  onClick={() => {
                    if (isReleaseActive) {
                      toggle();
                    } else {
                      playQueue(release.tracks);
                    }
                  }}
                >
                  <Image
                    src={release.artUrl}
                    alt={`${release.name} cover`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity ${
                      isReleasePlaying
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isReleasePlaying ? (
                      <PauseIcon size={36} />
                    ) : (
                      <PlayIcon size={36} />
                    )}
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-xl mb-1">{release.name}</h2>
                <p className="text-muted-foreground">
                  {release.tracks.length} track
                  {release.tracks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="space-y-px">
              {release.tracks.map((track, i) => {
                const isPlaying = currentTrack?.url === track.url;
                const isActive = isPlaying && playing;

                return (
                  <div
                    key={track.url}
                    className={`group flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer ${
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
                    <span className="w-8 text-muted-foreground shrink-0">
                      {isActive ? (
                        <PlayIcon size={12} />
                      ) : isPlaying ? (
                        <PauseIcon size={12} />
                      ) : (
                        `${i + 1}.`
                      )}
                    </span>
                    <span
                      className={`flex-1 ${
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
          </div>
        );
      })}
    </div>
  );
}
