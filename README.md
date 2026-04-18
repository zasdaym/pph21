# pph21

Monthly-only PPh 21 calculator built with:

- React
- shadcn/ui with the `radix-lyra` preset
- Vite+
- static Vite output for S3 or Cloudflare Pages

## Development

```bash
bun install
bun run dev
```

## Checks

```bash
bun run check
```

## Production build

```bash
bun run build
```

Build output is written to `dist/`.

## Static deployment

This project builds to plain static files and can be deployed directly to:

- AWS S3 static website hosting
- Cloudflare Pages

Recommended settings:

- Build command: `bun run build`
- Output directory: `dist`
