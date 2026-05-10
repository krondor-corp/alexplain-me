import Link from "next/link";

type Note = {
  date: string;
  title: string;
  href: string;
};

export function NoteList({ notes }: { notes: Note[] }) {
  return (
    <div>
      {notes.map((note) => (
        <Link
          key={note.href}
          href={note.href}
          className="group flex items-center gap-4 py-2 border-b border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-sm shrink-0">{note.date}</span>
          <span className="flex-1">{note.title}</span>
        </Link>
      ))}
    </div>
  );
}
