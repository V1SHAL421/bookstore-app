This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), paired with a FastAPI backend.

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for the backend)

### Backend (FastAPI)
1) Create a local env file:
   - `backend/.env` (copy from `backend/.env.example`)
   - Set `JWT_SECRET_KEY` to a random value for local dev.
2) Start the backend stack:
   ```bash
   cd backend
   just start
   ```
3) Seed the database:
   ```bash
   just seed
   ```
4) Verify the API is up:
   - `http://localhost:8080/health`
   - `http://localhost:8080/docs`

### Frontend (Next.js)
From `frontend/bookstore-web`, run the dev server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If your API is not on the default URL, set `NEXT_PUBLIC_API_BASE` in your shell or in a local env file:
```
NEXT_PUBLIC_API_BASE=http://localhost:8080/api/v1
```

## Production Notes
- Do not commit secrets. In production, inject `JWT_SECRET_KEY` and other secrets via your platform's secret manager.
- Rotate secrets when deploying to prod and clear refresh tokens in Redis to invalidate old sessions.
- Configure CORS allowlist via environment-specific settings.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
