# BreedZ Frontend Skill

## When To Use

Use this skill for Quasar/Vue work in BreedZ: pages, layouts, components, app navigation, dashboard panels, animal/event forms, settings screens, public landing pages, PWA-facing UI, and responsive polish.

## Project Context

BreedZ is a Quasar 2, Vue 3, Pinia, Vue Router, IndexedDB, Firebase, Stripe, SSR, and PWA app for offline-first livestock management.

Core app routes live in the main app shell. Public/SEO pages use a separate public layout and localized routes.

## Key Files

- `src/pages`
- `src/components`
- `src/layouts`
- `src/router/routes.js`
- `src/stores`
- `src/i18n/messages.js`
- `src/utils/*display*.js`
- `quasar.config.js`
- `src-pwa`

## UI Rules

- Keep farm workflows simple, direct, and mobile-friendly.
- Prefer event-specific controls over giant generic forms.
- Put advanced fields behind progressive disclosure.
- Make destructive actions, sync state, premium limits, and offline state clear.
- Preserve the existing Quasar patterns before adding new UI abstractions.
- Do not use in-app explanatory blocks to describe obvious controls.
- Landing and public pages should be product-led and visually grounded in BreedZ, not generic SaaS marketing.
- Use real screenshots, realistic farm imagery, or existing assets when visual context matters.
- Avoid adding major CRM/accounting surfaces unless the farm workflow is clearly scoped.

## Implementation Rules

- Read the route, page, store, and service touched by the workflow before editing.
- Keep display helpers and pure formatting logic in utilities when the behavior is shared or testable.
- Keep user-facing strings aligned across EN, PT-BR, and ES.
- Check SSR/public route impact when changing public pages.
- Check PWA/mobile behavior when changing app-shell navigation or install/offline surfaces.

## Validation

Use the narrowest useful checks:

```bash
npm run lint
npm test
npm run build
```

For PWA-specific work:

```bash
npm run build:pwa
```

For SSR/public route work:

```bash
npm run build:netlify
```
