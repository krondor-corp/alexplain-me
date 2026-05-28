"use client";

import Image from "next/image";
import { useAudio } from "../../audio-context";
import { DownloadIcon, PauseIcon, PlayIcon } from "../../icons";

type Release = {
  slug: string;
  name: string;
  artUrl?: string;
  tracks: { name: string; url: string }[];
};

export function ReleaseDetail({ release }: { release: Release }) {
  const { track: currentTrack, playing, playQueue, toggle } = useAudio();

  const isReleaseActive = release.tracks.some(
    (t) => t.url === currentTrack?.url,
  );
  const isReleasePlaying = isReleaseActive && playing;

  const onPlayAll = () => {
    if (isReleaseActive) {
      toggle();
    } else {
      playQueue(release.tracks);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8 items-start">
        {release.artUrl && (
          <button
            type="button"
            onClick={onPlayAll}
            className="relative w-60 h-60 sm:w-64 sm:h-64 shrink-0 border border-border cursor-pointer group block"
            aria-label={
              isReleasePlaying
                ? `Pause ${release.name}`
                : `Play ${release.name}`
            }
          >
            <Image
              src={release.artUrl}
              alt={`${release.name} cover`}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              unoptimized
              priority
            />
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity ${
                isReleasePlaying
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {isReleasePlaying ? (
                <PauseIcon size={48} />
              ) : (
                <PlayIcon size={48} />
              )}
            </div>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl mb-2">{release.name}</h1>
          <p className="text-muted-foreground text-sm mb-4">
            {release.tracks.length} track
            {release.tracks.length !== 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={onPlayAll}
            className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 border border-border transition-colors ${
              isReleasePlaying
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isReleasePlaying ? (
              <PauseIcon size={14} />
            ) : (
              <PlayIcon size={14} />
            )}
            {isReleasePlaying ? "pause" : "play all"}
          </button>
        </div>
      </div>

      <div className="border-y border-border">
        {release.tracks.map((track, i) => {
          const isPlaying = currentTrack?.url === track.url;
          const isActive = isPlaying && playing;

          return (
            <div
              key={track.url}
              className={`group flex items-center gap-4 px-3 py-3 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
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
              <span className="w-8 text-center text-muted-foreground shrink-0 text-sm">
                {isActive ? (
                  <PauseIcon size={12} />
                ) : isPlaying ? (
                  <PlayIcon size={12} />
                ) : (
                  `${i + 1}`
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
}
