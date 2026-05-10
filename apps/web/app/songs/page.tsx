import { getAllSongs } from "@/lib/songbook";
import { SongList } from "./song-list";

export const dynamic = "force-static";

export default async function SongsPage() {
  const songs = await getAllSongs();

  return (
    <div>
      <h1 className="text-2xl mb-2">songbook</h1>
      <p className="text-muted-foreground mb-8">chords and tabs.</p>
      <SongList songs={songs} />
    </div>
  );
}
