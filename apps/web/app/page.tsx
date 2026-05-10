import { jax } from "@/lib/jax";
import { ReleaseList } from "./release-list";

export const dynamic = "force-static";

export type Release = {
  name: string;
  artUrl?: string;
  tracks: { name: string; url: string }[];
};

function formatReleaseName(folderName: string): string {
  return folderName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTrackName(filename: string): string {
  return filename
    .replace(/^\d+[-_.\s]*/, "")
    .replace(/\.(mp3|m4a|wav|ogg)$/i, "");
}

export default async function HomePage() {
  const listing = await jax.list("/releases", { deep: true });

  const audioExtensions = /\.(mp3|m4a|wav|ogg)$/i;
  const artNames = new Set(["art.png", "art.jpg", "art.jpeg"]);

  const releaseMap = new Map<
    string,
    { artUrl?: string; tracks: { name: string; url: string }[] }
  >();

  for (const entry of listing.entries) {
    if (entry.mime_type === "inode/directory") continue;
    const parts = entry.path.split("/").filter(Boolean);
    if (parts.length < 2) continue;
    const releaseName = parts[0];

    if (!releaseMap.has(releaseName)) {
      releaseMap.set(releaseName, { tracks: [] });
    }
    const release = releaseMap.get(releaseName)!;

    const fullPath = `/releases${entry.path}`;

    if (artNames.has(entry.name.toLowerCase())) {
      release.artUrl = jax.fileUrl(fullPath);
    } else if (audioExtensions.test(entry.name)) {
      release.tracks.push({
        name: formatTrackName(entry.name),
        url: jax.fileUrl(fullPath),
      });
    }
  }

  const releases: Release[] = [];
  for (const [name, data] of releaseMap) {
    if (data.tracks.length === 0) continue;
    data.tracks.sort((a, b) => a.name.localeCompare(b.name));
    releases.push({
      name: formatReleaseName(name),
      artUrl: data.artUrl,
      tracks: data.tracks,
    });
  }

  return (
    <div>
      <section className="mb-12 mt-24 max-w-lg mx-auto">
        <p className="text-lg leading-relaxed">
          i like to make music! i mostly play live either at open mics or in
          tompkins sq park, but you can find a mix of stuff i&apos;ve recorded
          in this collection.
        </p>
        <p className="text-lg mt-4">happy listening!</p>
        <p className="text-muted-foreground mt-2">-- alex.</p>
      </section>

      <section>
        <ReleaseList releases={releases} />
      </section>
    </div>
  );
}
