import { getReleases } from "@/lib/releases";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReleaseDetail } from "./release-detail";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const releases = await getReleases();
  return releases.map((release) => ({ slug: release.slug }));
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const releases = await getReleases();
  const release = releases.find((r) => r.slug === slug);

  if (!release) return notFound();

  return (
    <div>
      <Link
        href="/releases"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; releases
      </Link>
      <div className="mt-6">
        <ReleaseDetail release={release} />
      </div>
    </div>
  );
}
