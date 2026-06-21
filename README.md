# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.



---

## Capacitor Commands

### Build and Sync
Generate the static build and sync it with Capacitor native platforms:
```bash
npx nuxt generate 
npx cap sync
```

### Run Native App
Run the application on a connected device or emulator:
```bash
npx cap run android
npx cap run ios
```

### Generating Icons & Splash Screens
To generate the app icons and splash screens for iOS and Android, we use `@capacitor/assets`:

1. **Prepare Source Assets:**
   Create an `assets/` directory in the root and add the high-resolution source files:
   - `assets/icon-only.png` (`1024 × 1024` px) — Base icon (without borders or transparent paddings).
   - `assets/icon-foreground.png` (`1024 × 1024` px) — Foreground logo with transparency (Android Adaptive Icons).
   - `assets/icon-background.png` (`1024 × 1024` px) — Background color or pattern (Android Adaptive Icons).
   - `assets/splash.png` (`2732 × 2732` px) — Splash screen (logo centered within a safe area).
   - `assets/splash-dark.png` (`2732 × 2732` px, optional) — Dark mode splash screen.

2. **Generate Native Assets:**
   Once the source files are placed in `assets/`, run:
   ```bash
   npm run assets
   ```
   *(This runs `capacitor-assets generate` to update native Android and iOS folders).*



Existe un cron en el vps 5.XXXX que ejecuta cada 15min:
https://baldboy.es/tiempo/obtener.php?token=MiTokenSuperSecreto123