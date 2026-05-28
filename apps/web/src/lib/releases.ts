import { jax } from "./jax";

export type Release = {
  slug: string;
  name: string;
  artUrl?: string;
  tracks: { name: string; url: string }[];
};

function parseDatePrefix(slug: string): { date: string; rest: string } | null {
  const yyyy = slug.match(/^(\d{4})-(\d{2})-(\d{2})(?:-(.+))?$/);
  if (yyyy)
    return { date: `${yyyy[1]}-${yyyy[2]}-${yyyy[3]}`, rest: yyyy[4] ?? "" };
  const mmddyy = slug.match(/^(\d{2})-(\d{2})-(\d{2})(?:-(.+))?$/);
  if (mmddyy)
    return {
      date: `20${mmddyy[3]}-${mmddyy[1]}-${mmddyy[2]}`,
      rest: mmddyy[4] ?? "",
    };
  return null;
}

function formatReleaseName(slug: string): string {
  const base = parseDatePrefix(slug)?.rest || slug;
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Dated folders sort first by date descending; non-dated fall to the bottom.
function sortKey(slug: string): string {
  const parsed = parseDatePrefix(slug);
  return parsed ? `1-${parsed.date}` : `0-${slug}`;
}

function formatTrackName(filename: string): string {
  return filename
    .replace(/^\d+[-_.\s]*/, "")
    .replace(/\.(mp3|m4a|wav|ogg)$/i, "");
}

// JAX doesn't return mtime, so ordering is derived from a date prefix in the
// folder name (YYYY-MM-DD-... or MM-DD-YY-...). Non-dated folders sort last.
export async function getReleases(): Promise<Release[]> {
  const listing = await jax.list("/releases", { deep: true });

  const audioExtensions = /\.(mp3|m4a|wav|ogg)$/i;
  const artNames = new Set(["art.png", "art.jpg", "art.jpeg"]);

  type RawTrack = { name: string; filename: string; url: string };
  const releaseMap = new Map<string, { artUrl?: string; tracks: RawTrack[] }>();

  for (const entry of listing.entries) {
    if (entry.mime_type === "inode/directory") continue;
    const parts = entry.path.split("/").filter(Boolean);
    if (parts.length < 2) continue;
    const slug = parts[0];

    if (!releaseMap.has(slug)) {
      releaseMap.set(slug, { tracks: [] });
    }
    const release = releaseMap.get(slug)!;

    const fullPath = `/releases${entry.path}`;

    if (artNames.has(entry.name.toLowerCase())) {
      release.artUrl = jax.fileUrl(fullPath);
    } else if (audioExtensions.test(entry.name)) {
      release.tracks.push({
        name: formatTrackName(entry.name),
        filename: entry.name,
        url: jax.fileUrl(fullPath),
      });
    }
  }

  // Sort by raw filename so leading "01-", "02-" prefixes preserve track order.
  // Files without numeric prefixes fall back to alphabetical, which is fine.
  const collator = new Intl.Collator(undefined, { numeric: true });
  const releases: Release[] = [];
  for (const [slug, data] of releaseMap) {
    if (data.tracks.length === 0) continue;
    data.tracks.sort((a, b) => collator.compare(a.filename, b.filename));
    releases.push({
      slug,
      name: formatReleaseName(slug),
      artUrl: data.artUrl,
      tracks: data.tracks.map(({ name, url }) => ({ name, url })),
    });
  }

  releases.sort((a, b) => sortKey(b.slug).localeCompare(sortKey(a.slug)));

  return releases;
}
