# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `ng serve` / `npm start` — run the dev server at `http://localhost:4200/` with live reload.
- `ng build` — production build, output to `dist/gestion-usuarios/`.
- `ng build --watch --configuration development` / `npm run watch` — dev build with rebuild on change.
- `ng test` — run unit tests via Karma/Jasmine (Chrome launcher; watches by default).
- `ng test --watch=false` — single run, useful for CI-style checks.
- `ng test --include='**/usuarios.component.spec.ts'` — run a single spec file.
- `ng generate component views/<name>` — scaffold a new standalone view component in the existing style (see Architecture below).

There is no lint script configured and no e2e framework set up.

## Architecture

This is an Angular 19 standalone-components app (no NgModules, no router) named `gestion-usuarios`. It's a single-page admin shell ("Tendencias Ocupacionales" / SENA) with three views swapped manually via a string field.

**View switching, not routing.** `AppComponent` (`src/app/app.component.ts`) owns `currentView: 'usuarios' | 'perfil' | 'configuracion'` and toggles which child component is shown with `*ngIf` in `app.component.html`. `switchView()` changes the active view; `configuracion` is special-cased to render as a modal overlay (`configurationOpen`) rather than replacing the main content, so `usuarios` stays mounted underneath it.

**State lives in the root component.** `AppComponent` is the single source of truth for `users`, `profileUser`, and `systemConfig`, passed down to view components via `@Input()` and mutated only through `@Output()` events emitted back up (`profileSaved`, `configSaved`, `configChanged`, `noticeTriggered`, etc.). View components do not fetch or persist data themselves except through `ConfigurationService`.

**Views** live under `src/app/views/<name>/` (`usuarios`, `perfil`, `configuracion`), each a standalone component with its own `.ts`/`.html`/`.css`/`.spec.ts`, importing `CommonModule` and `FormsModule` (template-driven forms, not reactive forms). Each view file also exports its domain types/interfaces (e.g. `User`, `UserDraft`, `UserRole` in `usuarios.component.ts`; `ProfileData` in `perfil.component.ts`; `SystemConfig`, `ColorPreset`, `FontOption` in `configuracion.component.ts`) — there's no separate `models/` directory, so import types directly from the owning component file.

**Theming is applied imperatively via CSS custom properties.** `ConfigurationService` (`src/app/services/configuration.service.ts`) reads/writes `SystemConfig` to `localStorage` (`tdo_system_config`) and applies it by setting CSS variables (`--primary-color`, `--app-font-family`, `--border-radius`, etc.) directly on `document.documentElement`, plus a `data-density` attribute. Dark mode is a separate boolean persisted under `tdo_dark_mode` and applied via a `.dark-mode` class on the root shell div, independent of `systemConfig.theme` (kept in sync manually in `AppComponent`).

**No backend.** All data (`users`, `profileUser`) is hardcoded in `AppComponent` and mutated in memory; only theme/config persists (to `localStorage`). There's no HTTP client usage yet.

**Language/UX**: UI text, component selectors' content, and variable names for domain concepts are in Spanish (e.g. `switchView`, `sessionRole`, `Administrador`/`Analista` roles); keep new UI copy and domain terms consistent with this.

**Access control** is a single hardcoded check: `AppComponent.sessionRole === 'Administrador'` gates the whole app shell in `app.component.html` (an `#restricted` template shows otherwise). There's no real auth.
