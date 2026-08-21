# Wilderness

This project is organized around the shadcn/ui conventions:

- Reusable UI components live in `components/ui`.
- Shared helpers live in `lib`.
- `@/*` resolves from the project root through `tsconfig.json`.
- `components.json` records the shadcn CLI aliases and Tailwind settings.

The preview uses the Tailwind CDN so the static project works without a build step. For a packaged local development setup, install the usual dependencies and initialize shadcn with:

```bash
npx create-vite@latest wilderness --template react-ts
cd wilderness
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

Choose TypeScript, Tailwind CSS, and `components/ui` when prompted. Keep the `@/*` alias pointed at the project root so shadcn-generated imports such as `@/lib/utils` remain portable.
