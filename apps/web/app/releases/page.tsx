import { getReleases } from "@/lib/releases";
import { ReleaseTable } from "./release-table";

export const dynamic = "force-static";

export default async function ReleasesPage() {
  const releases = await getReleases();
  const totalTracks = releases.reduce(
    (sum, release) => sum + release.tracks.length,
    0,
  );

  return (
    <div>
      <h1 className="text-2xl mb-1">releases</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        {releases.length} release{releases.length !== 1 ? "s" : ""} ·{" "}
        {totalTracks} track
        {totalTracks !== 1 ? "s" : ""}
      </p>
      <ReleaseTable releases={releases} />
    </div>
  );
}
