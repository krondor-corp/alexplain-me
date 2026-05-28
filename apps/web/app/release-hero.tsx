"use client";

import Image from "next/image";
import Link from "next/link";
import { useAudio } from "./audio-context";
import { PauseIcon, PlayIcon } from "./icons";

type Release = {
  name: string;
  artUrl?: string;
  tracks: { name: string; url: string }[];
};

export function ReleaseHero({ release }: { release: Release }) {
  const { track: currentTrack, playing, playQueue, toggle } = useAudio();

  const isActive = release.tracks.some((t) => t.url === currentTrack?.url);
  const isPlaying = isActive && playing;

  const onClick = () => {
    if (isActive) {
      toggle();
    } else {
      playQueue(release.tracks);
    }
  };

  return (
    <div className="flex flex-col items-start gap-6">
      {release.artUrl && (
        <button
          type="button"
          onClick={onClick}
          className="relative w-72 h-72 sm:w-80 sm:h-80 border border-border cursor-pointer group block"
          aria-label={
            isPlaying ? `Pause ${release.name}` : `Play ${release.name}`
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
              isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isPlaying ? <PauseIcon size={56} /> : <PlayIcon size={56} />}
          </div>
        </button>
      )}
      <div className="text-left">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
          latest release
        </p>
        <h2 className="text-2xl mb-1">{release.name}</h2>
        <p className="text-muted-foreground text-sm">
          {release.tracks.length} track
          {release.tracks.length !== 1 ? "s" : ""} ·{" "}
          <Link href="/releases" className="hover:text-foreground underline">
            browse full catalog
          </Link>
        </p>
      </div>
    </div>
  );
}
