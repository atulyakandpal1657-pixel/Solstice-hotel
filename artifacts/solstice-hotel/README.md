# Solstice Coastal Retreat

A responsive React + Vite single-page hotel concept. It uses Wouter for client-side routes and a local, illustrative room catalogue.

## Local development

From this directory:

```sh
pnpm install
pnpm dev
```

Create a production build with `pnpm build`; preview it with `pnpm serve`. The static host must rewrite unknown paths (including `/rooms/:slug`) to `index.html` so direct SPA route visits work.

## Demo-only reservation flow

The room inventory, capacities, nightly prices, dates and estimates are illustrative sample data. No live availability service is connected. The reservation form validates input and displays a confirmation in the browser only; it does not send, save, or book anything. Do not use it to accept real guest reservations without adding and reviewing a secure booking service and clear privacy terms.

The contact address, telephone number and email address displayed on the contact page are explicitly fictional demo details. They do not connect to a real hotel or inbox.

## Production metadata

The HTML shell provides default title, description, Open Graph and Twitter metadata. SPA navigation updates route-specific title and description in the browser. Before deployment, replace the default text in `index.html` with approved brand copy and configure any absolute `og:url`, canonical URLs, social image URLs, sitemap entries or structured-data URLs using the real production domain supplied by the deployment environment. This app intentionally invents no production domain and does not include canonical URLs. Keep those values unset until a domain is configured; never substitute a development preview hostname.

The current pages are client-rendered. If social crawlers need route-specific metadata before JavaScript runs, add a deployment-time prerendering or server-rendering solution and verify its output.

## Imagery and content

The hero uses a generated local image at `public/solstice-coast.jpg`. Other editorial photos currently use Pexels image CDN URLs. Replace imagery and fictional copy with licensed, approved production assets before launch.
