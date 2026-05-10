import { photosJax } from "@/lib/jax";
import { Gallery } from "./gallery";

export const dynamic = "force-static";

type Photo = {
  url: string;
  thumbUrl: string;
  name: string;
};

export default async function PhotosPage() {
  const listing = await photosJax.list("/", { deep: true });

  const imageExtensions = /\.(jpg|jpeg|png|webp)$/i;
  const photos: Photo[] = [];

  for (const entry of listing.entries) {
    if (entry.mime_type === "inode/directory") continue;
    if (!imageExtensions.test(entry.name)) continue;
    if (entry.name.toLowerCase() === "logo.png") continue;
    const url = photosJax.fileUrl(entry.path);
    photos.push({
      url,
      thumbUrl: `${url}${url.includes("?") ? "&" : "?"}w=600&q=75`,
      name: entry.name,
    });
  }

  // Deterministic shuffle based on filenames
  photos.sort((a, b) => {
    let ha = 0;
    for (let i = 0; i < a.name.length; i++)
      ha = ((ha << 5) - ha + a.name.charCodeAt(i)) | 0;
    let hb = 0;
    for (let i = 0; i < b.name.length; i++)
      hb = ((hb << 5) - hb + b.name.charCodeAt(i)) | 0;
    return ha - hb;
  });

  return (
    <div>
      <h1 className="text-2xl mb-2">photos</h1>
      <p className="text-muted-foreground mb-8">shots from around.</p>
      <Gallery photos={photos} />
    </div>
  );
}
