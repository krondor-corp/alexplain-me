import { getReleases } from "@/lib/releases";
import { ReleaseHero } from "./release-hero";

export const dynamic = "force-static";

export default async function HomePage() {
  const releases = await getReleases();
  const latest = releases[0];

  return (
    <div>
      <section className="mb-12 mt-16 max-w-lg">
        <p className="text-lg leading-relaxed">
          i like to make music! i mostly play live either at open mics or in
          tompkins sq park, but you can find a mix of stuff i&apos;ve recorded
          in this collection.
        </p>
        <p className="text-lg mt-4">happy listening!</p>
        <p className="text-muted-foreground mt-2">-- alex.</p>
      </section>

      {latest && (
        <section className="mb-16">
          <ReleaseHero release={latest} />
        </section>
      )}
    </div>
  );
}
