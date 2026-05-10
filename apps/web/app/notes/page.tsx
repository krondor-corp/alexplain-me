import { extractBody } from "@/lib/html";
import { notesJax } from "@/lib/jax";
import { NoteList } from "../note-list";

export const dynamic = "force-static";

const NOTE_PATTERN = /^(\d{4})_(\d{2})_(\d{2})_(.+)\.md$/;

function parseNoteFilename(filename: string) {
  const match = filename.match(NOTE_PATTERN);
  if (!match) return null;
  const [, year, month, day, rawTitle] = match;
  return {
    date: `${year}-${month}-${day}`,
    title: rawTitle.replace(/_/g, " "),
  };
}

export default async function NotesPage() {
  const listing = await notesJax.list("/", { deep: true });

  const readmeEntry = listing.entries.find(
    (e) => e.name.toLowerCase() === "readme.md",
  );

  let readmeHtml = "";
  if (readmeEntry) {
    const res = await fetch(notesJax.fileUrl(readmeEntry.path));
    if (res.ok) readmeHtml = extractBody(await res.text());
  }

  const notes = listing.entries
    .filter((entry) => {
      if (entry.mime_type === "inode/directory") return false;
      if (entry.path.includes(".obsidian/")) return false;
      if (entry.name.toLowerCase() === "readme.md") return false;
      return NOTE_PATTERN.test(entry.name);
    })
    .map((entry) => {
      const parsed = parseNoteFilename(entry.name)!;
      const href = `/notes/${entry.path.replace(/^\//, "").replace(/\.md$/, "")}`;
      return { ...parsed, href };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <h1 className="text-2xl mb-2">notes</h1>
      {readmeHtml && (
        <div
          className="mb-8 text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: readmeHtml }}
        />
      )}
      <NoteList notes={notes} />
    </div>
  );
}
