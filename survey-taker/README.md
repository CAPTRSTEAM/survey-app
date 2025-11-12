# Survey Taker

This directory contains the survey taker application – a standalone HTML/JavaScript single page app that can run in the CAPTRS platform iframe or in a local standalone mode for testing.

## Key Files

- `index.html` – entry point that bootstraps the React bundle from the CDN
- `js/` – TypeScript sources (compiled by Vite)  
- `sample-survey.json` – quick-start survey for standalone testing
- `package.json` / `vite.config.ts` – tooling configuration
- `survey-taker-production-spa-v31.zip` – **current production-ready bundle**
- `DATABASE_INTEGRATION.md` – persistence and API usage details
- `DEPLOYMENT_GUIDE.md` – clean deployment checklist
- `TESTING_GUIDE.md` – automated + manual validation scenarios

## Platform Integration Overview

The app now uses the official **`spa-api-provider` React context** instead of a custom provider. This keeps the integration aligned with the platform team’s latest expectations.

- **Configuration bridge**: `js/app.ts` listens for platform `CONFIG` messages *and* supports local overrides via:
  - `window.__SURVEY_APP_CONFIG__`
  - `window.__SURVEY_APP_API_URL__` / `window.__SURVEY_APP_API_TOKEN__`
  - Query parameters `?apiUrl=` and `?token=`
  - Vite env variables `VITE_PLATFORM_API_URL` and `VITE_PLATFORM_API_TOKEN`
- **Survey extraction**: `SurveyApp` inspects `spa-api-provider` context data (`appConfig`, inline `survey`, or `surveyConfig`) and normalises sections/questions before rendering.
- **Data persistence**: On completion the app calls `createAppData` and `addEvent(AddEventDTOType.APP_FINISH)` from the provider context so responses are written to `/api/gameData` and the sequence finish count is updated.
- **Fallback behaviour**: If database writes fail, the app still posts a `SURVEY_COMPLETE` message to the parent frame. Standalone users can upload JSON via the built-in file picker.
- **Timeout UX**: If no survey loads within 15 seconds the user sees an accessible retry/quit screen.

## Standalone Mode

With no platform credentials the app drops into standalone mode:

1. Run `npm run dev` (default port 3001).
2. Visit `http://localhost:3001`.
3. Upload `sample-survey.json` or your own survey file.

You can also supply a public API token locally:

```
http://localhost:3001?apiUrl=http%3A%2F%2Flocalhost%3A3000&token=yourTokenHere
```

## Usage

### Development
```bash
npm install
npm run dev
```

This will start the survey taker on http://localhost:3001

### Development Tools
```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:ui
npm run test:coverage
```

### Build for Platform
```bash
npm run build
```

This creates a fresh `dist/` folder ready for deployment.

### Platform Deployment
1. Run `npm run build`.
2. Zip the contents of `dist/` (see deployment scripts or use `Compress-Archive`).
3. Upload the new archive – current standard name: `survey-taker-production-spa-v31.zip`.
4. Configure the public survey in the platform. When the iframe sends a `CONFIG` message the app will auto-load, ingest, and persist responses through `spa-api-provider`.

For a deeper look at persistence, configuration precedence, and testing scenarios see:

- [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md)
- [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)