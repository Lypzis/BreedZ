# BreedZ (breedz)

Offline-first livestock management app

## Install the dependencies

```bash
npm install
```

## Start the app in development mode

```bash
npm run dev
```

## Start the app in PWA development mode

```bash
npm run dev:pwa
```

## Lint the files

```bash
npm run lint
```

## Build the app for production

```bash
npm run build
```

## Build the PWA for production

```bash
npm run build:pwa
```

## MVP Todo

This is the current implementation order for the first working BreedZ MVP.

### 1. App shell and routes

- Keep the landing page at `/`
- Add app routes under `/app`
- First routes:
  - `/app`
  - `/app/animals`
  - `/app/animals/:id`
  - `/app/events/new`
  - `/app/settings`

### 2. Data layer

- Add an IndexedDB wrapper for local persistence
- Keep storage access in one service instead of inside components
- Start with two collections:
  - `animals`
  - `events`

### 3. Domain models

- `animal`
  - `id`
  - `tag`
  - `name`
  - `species`
  - `birthDate`
  - `status`
  - `notes`
  - `createdAt`
  - `updatedAt`
- `event`
  - `id`
  - `animalId`
  - `type`
  - `date`
  - `notes`
  - `createdAt`
  - `updatedAt`

### 4. Pinia stores

- Create `useAnimalsStore`
- Create `useEventsStore`
- Add simple derived dashboard data for “today”
- Keep stores talking to the storage service, not directly to IndexedDB APIs

### 5. First working screens

- Dashboard with simple actionable items
- Animals list
- Create animal form
- Edit animal form
- Animal detail page with chronological timeline
- Fast add event flow

### 6. Data safety

- Export all local data as JSON
- Import JSON backup data
- Validate imported structure before saving

### 7. MVP scope guardrails

- No backend
- No authentication
- No sync system
- No charts
- No finance or inventory features
- No multi-farm support

### 8. Recommended implementation order

1. IndexedDB service
2. Animal store
3. Animals list page
4. Create/edit animal form
5. Events store
6. Animal timeline
7. Dashboard
8. JSON export/import

## Configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
