import ChordSheetJS from "chordsheetjs";
import { jax } from "./jax";

export type SongMeta = {
  title: string;
  slug: string;
  key?: string;
  tempo?: number;
  capo?: number;
  tuning?: string;
  track?: string;
  tags?: string[];
};

export type Song = SongMeta & {
  body: string;
};

export function parseSong(raw: string): Song {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    throw new Error("Song file missing frontmatter");
  }

  const [, frontmatter, body] = fmMatch;
  const meta = parseFrontmatter(frontmatter);

  return { ...meta, body: body.trim() };
}

function parseFrontmatter(fm: string): SongMeta {
  const lines = fm.split("\n");
  const data: Record<string, string> = {};

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      data[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }

  if (!data.title) throw new Error("Song missing title");

  const slug =
    data.slug ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return {
    title: data.title,
    slug,
    key: data.key,
    tempo: data.tempo ? Number(data.tempo) : undefined,
    capo: data.capo ? Number(data.capo) : undefined,
    tuning: data.tuning,
    track: data.track,
    tags: data.tags
      ? data.tags
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((t) => t.trim())
      : undefined,
  };
}

export async function getAllSongs(): Promise<Song[]> {
  let listing;
  try {
    listing = await jax.list("/songs", { deep: true });
  } catch {
    return [];
  }
  const choproFiles = listing.entries.filter(
    (e) => e.mime_type !== "inode/directory" && e.name.endsWith(".chopro"),
  );
  const results = await Promise.all(
    choproFiles.map(async (entry): Promise<Song | null> => {
      try {
        const res = await fetch(jax.fileUrl(`/songs${entry.path}`));
        const raw = await res.text();
        return parseSong(raw);
      } catch {
        return null;
      }
    }),
  );
  return results.filter((s): s is Song => s !== null);
}

const AUDIO_EXT = /\.(mp3|m4a|wav|ogg)$/i;

export async function resolveTrack(
  trackPath: string,
  songTitle: string,
): Promise<{ name: string; url: string } | undefined> {
  let listing;
  try {
    listing = await jax.list("/", { deep: true });
  } catch {
    return undefined;
  }
  const normalized = trackPath.replace(AUDIO_EXT, "").toLowerCase();

  const match = listing.entries.find((e) => {
    if (e.mime_type === "inode/directory") return false;
    if (!AUDIO_EXT.test(e.name)) return false;
    const entryNorm = e.path
      .replace(/^\//, "")
      .replace(AUDIO_EXT, "")
      .toLowerCase();
    return entryNorm === normalized;
  });

  if (!match) return undefined;
  return { name: songTitle, url: jax.fileUrl(match.path) };
}

export async function getTrackToSongMap(): Promise<Map<string, string>> {
  const songs = await getAllSongs();
  const map = new Map<string, string>();
  for (const song of songs) {
    if (song.track) {
      const normalized = song.track.replace(AUDIO_EXT, "").toLowerCase();
      map.set(normalized, song.slug);
    }
  }
  return map;
}

export type ChordDefinition = {
  name: string;
  baseFret: number;
  frets: (number | "x")[];
  fingers: number[];
};

const DEFINE_RE =
  /^\{define:\s*(\S+)\s+(?:base-fret\s+(\d+)\s+)?frets\s+([\d\sx]+?)(?:\s+fingers\s+([\d\s]+))?\s*\}$/i;

function parseFrets(raw: string): (number | "x")[] {
  return raw
    .trim()
    .split(/\s+/)
    .map((v) => (v.toLowerCase() === "x" ? "x" : Number(v)));
}

function parseDefineLines(body: string): {
  cleaned: string;
  chordDefinitions: ChordDefinition[];
} {
  const lines = body.split("\n");
  const defs: ChordDefinition[] = [];
  const out: string[] = [];
  let insertedPlaceholder = false;

  for (const line of lines) {
    const m = line.trim().match(DEFINE_RE);
    if (m) {
      const rawBase = m[2] ? Number(m[2]) : 1;
      defs.push({
        name: m[1],
        baseFret: Math.max(rawBase, 1),
        frets: parseFrets(m[3]),
        fingers: m[4]
          ? m[4]
              .trim()
              .split(/\s+/)
              .map((v) => Number(v))
          : [],
      });
      if (!insertedPlaceholder) {
        out.push("{comment: __CHORD_DEFS__}");
        insertedPlaceholder = true;
      }
    } else {
      out.push(line);
    }
  }

  return { cleaned: out.join("\n"), chordDefinitions: defs };
}

export function renderChordPro(chordProBody: string): {
  html: string;
  chordDefinitions: ChordDefinition[];
} {
  const { cleaned, chordDefinitions } = parseDefineLines(chordProBody);

  const parser = new ChordSheetJS.ChordProParser();
  const song = parser.parse(cleaned);
  const formatter = new ChordSheetJS.HtmlTableFormatter();
  const html = formatter.format(song);

  return { html, chordDefinitions };
}
