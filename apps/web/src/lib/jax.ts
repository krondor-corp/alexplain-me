import { JaxClient } from "@repo/jax";

const MUSIC_BUCKET_ID = "acef5203-2a06-499c-8cc1-7e8c953aae71";
const PHOTOS_BUCKET_ID = "f45fe1b0-8172-4619-b6c6-17518058ff16";
const GATEWAY = process.env.JAX_GATEWAY || "https://jax.krondor.org";

export const jax = new JaxClient({
  gateway: GATEWAY,
  bucketId: MUSIC_BUCKET_ID,
});

export const photosJax = new JaxClient({
  gateway: GATEWAY,
  bucketId: PHOTOS_BUCKET_ID,
});

const NOTES_BUCKET_ID = "a1d840ea-e6f9-429a-be3e-04872b73d3f4";

export const notesJax = new JaxClient({
  gateway: GATEWAY,
  bucketId: NOTES_BUCKET_ID,
});
