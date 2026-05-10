import { extractBody } from "@/lib/html";
import { notesJax } from "@/lib/jax";
import Link from "next/link";

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

export async function generateStaticParams() {
  const listing = await notesJax.list("/", { deep: true });

  return listing.entries
    .filter((entry) => {
      if (entry.mime_type === "inode/directory") return false;
      if (entry.path.includes(".obsidian/")) return false;
      if (entry.name.toLowerCase() === "readme.md") return false;
      return NOTE_PATTERN.test(entry.name);
    })
    .map((entry) => ({
      path: entry.path.replace(/^\//, "").replace(/\.md$/, "").split("/"),
    }));
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: segments } = await params;
  const filePath = segments.join("/") + ".md";
  const filename = segments[segments.length - 1] + ".md";

  const res = await fetch(notesJax.fileUrl(filePath));
  const bodyHtml = extractBody(await res.text());

  const parsed = parseNoteFilename(filename);
  const title = parsed?.title ?? filename.replace(/\.md$/, "");
  const date = parsed?.date;

  return (
    <div>
      <Link
        href="/notes"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; notes
      </Link>
      <h1 className="text-2xl mt-4 mb-1">{title}</h1>
      {date && <p className="text-sm text-muted-foreground mb-6">{date}</p>}
      <div
        className="max-w-none"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </div>
  );
}
