# AgroConsulting Plus

The official website project for AgroConsulting Plus. The current release contains the responsive homepage and its service carousel.

## Requirements

- Node.js 20 or newer
- npm

## Build

Install the development dependencies and compile the Tailwind CSS:

```sh
npm install
npm run build
```

The generated stylesheet is written to `assets/css/style.css`.

## Local preview

Open `index.html` in a browser, or serve the project folder with any static file server. For example, with Python installed:

```sh
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Project structure

- `index.html` — homepage content and sections
- `src/input.css` — Tailwind CSS v4 theme and component styles
- `assets/css/style.css` — generated stylesheet
- `assets/js/agro.js` — mobile navigation, service carousel, reveal effects, and back-to-top control
- `assets/img/agro/` — AgroConsulting Plus logo and original service illustrations

## Website features

- Responsive navigation for desktop and mobile
- Four-slide service carousel with keyboard and touch support
- Reduced-motion support and accessible slide state
- Company, services, advantages, process, contact, and footer sections

The carousel uses the original AgroConsulting Plus service illustrations. No third-party JavaScript libraries are required.
