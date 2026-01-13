# Abuja FMP Admin Frontend

This is a standalone admin dashboard built with Next.js 14, Tailwind CSS, and TanStack Query.

## Project Structure

- `src/app`: Application routes and pages (Login, Dashboard, Settings).
- `src/components`: Reusable UI components (Sidebar).
- `src/lib`: API client (Axios) and authentication services.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3007/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

## Deployment (cPanel)

For easy hosting on cPanel, you can use a static export:

1. Update `next.config.mjs`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
   };
   export default nextConfig;
   ```
2. Run the build:
   ```bash
   npm run build
   ```
3. Upload the contents of the `out` folder to your cPanel public directory.
