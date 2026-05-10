# Stack Modernisation Plan

## Chosen Stack

| Concern | Choice | Rationale |
|---|---|---|
| Navigation | **Expo Router v4** | File-based routing built into Expo SDK 54; deep linking automatic; type-safe hrefs |
| Styling | **NativeWind v4** | New Architecture compatible; Tailwind class vocab; light/dark theming via CSS vars |
| UI components | **react-native-reusables** | shadcn-style — you own the source, composable, New Arch safe |
| Unit/logic tests | **Vitest** | User preference; works well for hooks/utils; fast |
| Component tests | **jest-expo** | Only option for rendering RN components; RNTL API is near-identical to RTL |
| Linting | **eslint-config-expo + Prettier** | Expo-maintained; includes react-hooks exhaustive-deps (no Biome equivalent yet) |
| Validation | **Zod** | At storage boundary; derive TypeScript types from schemas |

### Key ecosystem warnings
- **NativeWind must be v4.1+** — v2/v3 don't support New Architecture (Fabric)
- **Tailwind must stay at v3** — Tailwind v4 uses a different config format NativeWind v4 doesn't support yet
- **Expo Router requires default exports for screen files** — exception to the named-export rule; all non-screen files remain named exports
- **Do not use Vitest for RN component tests** — Metro/Hermes module resolution is incompatible with Vite; use the split strategy below

---

## Phases

### Phase 0 — Tooling
> No user-visible change. Safe to do in isolation.

**Install (devDependencies):**
```
eslint eslint-config-expo prettier @trivago/prettier-plugin-sort-imports
vitest @vitest/coverage-v8
zod
```

**Files:**
- `eslint.config.js` — flat config via `eslint-config-expo`
- `.prettierrc` — `singleQuote`, `trailingComma: "all"`, `printWidth: 100`, sort-imports plugin
- `vitest.config.ts` — node env, glob `src/**/*.test.ts`, alias AsyncStorage to manual mock
- `src/__mocks__/async-storage.ts` — in-memory mock
- `tsconfig.json` — add `"paths": { "@/*": ["./src/*"] }` path alias
- `src/schemas.ts` — Zod schema for `ShoppingItem`; derive `ShoppingItem` type from it
- `src/storage.ts` — parse with `ShoppingItemSchema.array().safeParse()` instead of bare cast
- `src/storage.test.ts` — Vitest tests for loadItems/saveItems
- `src/useShoppingList.test.ts` — Vitest tests for add/toggle/remove/clearChecked
- `package.json` scripts: `lint`, `format`, `test:unit`, `test:unit:watch`

**Verify:** `npm run lint` clean · `npm run test:unit` passes · `npx expo start` unchanged

---

### Phase 1 — Expo Router Migration

**Install:**
```
expo-router expo-linking expo-constants
```

**Files:**
- `package.json` — change `"main"` from `"index.ts"` to `"expo-router/entry"`
- `app.json` — add `"scheme": "shoppinglist"`, confirm `"web": { "bundler": "metro" }`
- `tsconfig.json` — add `"moduleResolution": "bundler"`, update `"include"` for `.expo/types/**`
- `expo-env.d.ts` — create at root (Expo Router type reference)
- `app/_layout.tsx` — root `Stack` layout; wraps children in `SafeAreaProvider`
- `app/index.tsx` — screen content moved from `App.tsx`; default export `HomeScreen`
- `src/components/AddItemBar.tsx` — extracted from `App.tsx`; named export
- `src/components/ItemRow.tsx` — extracted from `App.tsx`; named export
- Delete `App.tsx` and `index.ts`

**Verify:** App loads · all list operations work · `npx tsc --noEmit` clean · `npm run lint` clean

---

### Phase 2 — NativeWind + Theme System

**Install:**
```
nativewind tailwindcss@^3
```

**Files:**
- `tailwind.config.js` — content globs for `app/**` and `src/**`; semantic colour tokens (`background`, `surface`, `primary`, `danger`, `text`, `muted`) as CSS vars for light/dark
- `metro.config.js` — wrap with `withNativeWind` from `nativewind/metro`
- `babel.config.js` — add NativeWind preset
- `app.json` — set `"userInterfaceStyle": "automatic"` for system dark mode
- `src/theme.ts` — typed `Colors`; `useTheme()` hook wrapping `useColorScheme()`
- `app/_layout.tsx` — add `ThemeProvider`
- `src/components/AddItemBar.tsx` — migrate to `className` props; remove `StyleSheet`
- `src/components/ItemRow.tsx` — same
- `app/index.tsx` — same

**react-native-reusables:** `npx @react-native-reusables/cli@latest add checkbox` — files land in `components/ui/`; use in `ItemRow`.

**Verify:** App looks identical · dark mode works · `npm run test:unit` passes

---

### Phase 3 — Component Tests (jest-expo)

**Install (devDependencies):**
```
jest jest-expo @testing-library/react-native@^13 @testing-library/jest-native
```

**Files:**
- `jest.config.ts` — preset `jest-expo`; transform ignore for NativeWind/Tailwind pkgs; `moduleNameMapper` for `@/*`
- `package.json` scripts: `test:components` (jest), `test` (runs both suites)
- `src/components/__tests__/AddItemBar.test.tsx`
- `src/components/__tests__/ItemRow.test.tsx`
- `app/__tests__/index.test.tsx` — full add → toggle → remove integration test

**Verify:** `npm run test` passes (both Vitest and jest-expo)

---

### Phase 4 — Tab Navigation + Settings Screen

No new packages.

**Files:**
- `app/(tabs)/_layout.tsx` — `Tabs` layout; List + Settings tabs; icons via `@expo/vector-icons`
- `app/(tabs)/index.tsx` — shopping list screen (moved from `app/index.tsx`)
- `app/(tabs)/settings.tsx` — stub Settings screen
- `app/_layout.tsx` — root `Stack` containing the tabs layout
- Delete `app/index.tsx`

**Verify:** Both tabs render · list state preserved on tab switch · all tests pass
