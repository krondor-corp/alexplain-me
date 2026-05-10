import { getAllSongs, renderChordPro, resolveTrack } from "@/lib/songbook";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SongSheet } from "./song-sheet";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const songs = await getAllSongs();
  return songs.map((song) => ({ slug: song.slug }));
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const songs = await getAllSongs();
  const song = songs.find((s) => s.slug === slug);

  if (!song) return notFound();

  const { html, chordDefinitions } = renderChordPro(song.body);
  const track = song.track
    ? await resolveTrack(song.track, song.title)
    : undefined;

  return (
    <div>
      <Link
        href="/songs"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; songbook
      </Link>

      <h1 className="text-2xl mt-4 mb-1">{song.title}</h1>

      <div className="flex gap-3 mb-6 text-sm text-muted-foreground">
        {song.key && <span>key: {song.key}</span>}
        {song.tempo && <span>{song.tempo} bpm</span>}
        {song.capo ? <span>capo {song.capo}</span> : null}
        {song.tuning && <span>tuning: {song.tuning}</span>}
      </div>

      <SongSheet
        html={html}
        chordDefinitions={chordDefinitions}
        chordProBody={song.body}
        slug={song.slug}
        title={song.title}
        meta={{
          key: song.key,
          tempo: song.tempo,
          capo: song.capo,
          tuning: song.tuning,
        }}
        track={track}
        autoPlay
      />
    </div>
  );
}
