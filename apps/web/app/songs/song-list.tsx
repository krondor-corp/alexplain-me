import type { SongMeta } from "@/lib/songbook";
import Link from "next/link";

export function SongList({ songs }: { songs: SongMeta[] }) {
  if (songs.length === 0) {
    return <p className="text-muted-foreground">no songs yet.</p>;
  }

  return (
    <div>
      {songs.map((song) => (
        <Link
          key={song.slug}
          href={`/songs/${song.slug}`}
          className="group flex items-center gap-4 py-2 border-b border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex-1">{song.title}</span>
          <span className="flex gap-2 items-center">
            {song.key && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                {song.key}
              </span>
            )}
            {song.capo ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                capo {song.capo}
              </span>
            ) : null}
          </span>
        </Link>
      ))}
    </div>
  );
}
