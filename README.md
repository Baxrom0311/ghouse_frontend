# AgroAI Frontend

React/Vite frontend for the AgroAI smart greenhouse SaaS.

## Local Development

```sh
npm ci
npm run dev
```

The development API defaults to `http://localhost:8000/api`. Override it with:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Production

Do not set `VITE_API_BASE_URL` in `.env.production`. Production builds default to `window.location.origin/api`, and the nginx container proxies `/api` to the backend.

Build locally:

```sh
npm run build
```

Container build:

```sh
docker build -t agroai-frontend .
```

## PWA

The production build includes a web app manifest, service worker, offline fallback, install prompt, and Android-ready icons. Android users can open `https://gh.boos.uz` in Chrome and install AgroAI from the browser prompt or Chrome menu.

## Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
