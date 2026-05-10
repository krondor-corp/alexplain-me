# alexplain.me

Music, notes, and photos site. Static Next.js export deployed to GitHub Pages.

## Structure

- `apps/web` - Next.js app (static export)
- `packages/jax` - JAX storage client
- `packages/typescript-config` - Shared TypeScript config

## Development

```bash
pnpm install
pnpm dev              # Dev server on :3000 (uses local JAX via confit)
pnpm build            # Static export to apps/web/out/
pnpm check            # Biome lint + format
pnpm types            # Type check
```

Local dev requires a JAX gateway running on `localhost:8080`, or remove the confit wrapper and let it default to `jax.krondor.org`.

## Deploying

The site is deployed to GitHub Pages automatically:

- On every push to `main`
- Biweekly (1st and 15th of each month) to pick up JAX content changes
- Manually via **Actions > Deploy > Run workflow**

Content is fetched from `jax.krondor.org` at build time.

### First-time setup

In the repo settings, set **Pages > Build and deployment > Source** to **GitHub Actions**.

## CI

Runs on every push/PR to `main`:
- Biome check (format + lint)
- Type check
- Build
