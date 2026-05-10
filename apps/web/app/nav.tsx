"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "home" },
  { href: "/tracks", label: "tracks" },
  { href: "/songs", label: "songs" },
  { href: "/photos", label: "photos" },
  { href: "/notes", label: "notes" },
];

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SoundcloudIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M1 18V14.5c0-.28.22-.5.5-.5s.5.22.5.5V18c0 .28-.22.5-.5.5S1 18.28 1 18zm2.5 1V13c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5zm2.5.5V11.5c0-.28.22-.5.5-.5s.5.22.5.5v8c0 .28-.22.5-.5.5s-.5-.22-.5-.5zM8.5 20V10c0-.28.22-.5.5-.5s.5.22.5.5v10c0 .28-.22.5-.5.5s-.5-.22-.5-.5zm2.5.5V8c0-.28.22-.5.5-.5s.5.22.5.5v12.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5zM13 20V6.5c0-.28.22-.5.5-.5s.5.22.5.5V20c0 .28-.22.5-.5.5s-.5-.22-.5-.5zm3.5.5c-.28 0-.5-.22-.5-.5V5a4.5 4.5 0 0 1 4.5 4.5h.5c1.38 0 2.5 1.12 2.5 2.5S22.88 14.5 21.5 14.5H16V20c0 .28-.22.5-.5.5z" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const socials = [
  {
    href: "https://www.instagram.com/alexplain_me",
    icon: InstagramIcon,
    label: "Instagram",
  },
  {
    href: "https://open.spotify.com/artist/4VaadYrNepJFCmulcZu4wi?si=lEKaQvcsSyqdLiVyup1JOQ",
    icon: SpotifyIcon,
    label: "Spotify",
  },
  {
    href: "https://soundcloud.com/alex-plain-565066733",
    icon: SoundcloudIcon,
    label: "SoundCloud",
  },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-full py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Link href="/" className="text-4xl">
          alex plain
        </Link>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <ul className="flex gap-6">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-3">
            {socials.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={link.label}
              >
                <link.icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
