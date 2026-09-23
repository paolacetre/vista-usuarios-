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

**View switching, not routing.** `AppComponent` (`src/app/app.component.ts`) owns `currentView: 'usuarios' | 'perfil' | 'configuracion'` and toggles which child component is shown with `*ngIf` in `app.component.html`. `switchView()` changes the active view; `configuracion` is special-cased to render as a modal overlay (`configurationOpen`) rather than replacing the main content, so `usuarios` stays mounted underneath it. Closing the overlay (X, backdrop click or Esc) calls `closeConfiguration()`, which discards the unsaved settings draft.

**State.** Users and profile live in `AppComponent` (`users`, `profileUser`), seeded by `createInitialUsers()` / `createInitialProfile()` exported from the view files. `UsuariosComponent` is bound with `[(users)]`: it emits `usersChange` whenever it replaces the list (create/delete), while edits and status changes mutate the same user objects. `PerfilComponent` gets `[profile]` and emits `profileSaved` / `cancel`. System settings live in `SettingsService` (signals), not in `AppComponent`.

**Views** live under `src/app/views/<name>/` (`usuarios`, `perfil`), each a standalone component with its own `.ts`/`.html`/`.css`/`.spec.ts` using template-driven forms (`FormsModule`). Each view file also exports its domain types (`User`, `UserDraft`, `UserRole` in `usuarios.component.ts`; `ProfileData` in `perfil.component.ts`) — import types directly from the owning file.

**Configuración** lives under `src/app/settings/`: `SettingsComponent` (tablist, live preview, save/reset confirmations) plus one standalone component per tab in `tabs/` (appearance, logos, language, accessibility, preferences, about). Tabs use reactive forms whose changes go straight to `SettingsService.updateDraft()`; their shared styles are in `_settings-shared.scss` (pulled into each tab with `@use`, so it is emitted once per tab). Types and option lists live in `settings.model.ts`.

**Settings: draft vs saved.** `SettingsService` keeps `saved` (persisted to `localStorage` under `tdo_system_config`) and `draft` (what is being edited). Every draft change is applied live to the whole UI; `save()` persists it (erroring with `STORAGE_FULL` if the storage quota is exceeded), `discardDraft()` reverts to `saved`, `reset()` sets the draft to factory defaults. `ThemeService` is the only place that touches the global DOM for theming: CSS variables (`--primary-color`, `--accent-color`, `--type-scale`, …), `data-density` / `data-high-contrast` / `data-large-icons` / `data-read-only` on `document.documentElement`, and the favicon. Dark mode is `draft().theme === 'oscuro'`, reflected as the `.dark-mode` class on the root shell div; the topbar moon button saves the theme directly.

**Shared** (`src/app/shared/`): `i18n/` (`TranslationService` + impure `translate` pipe reading `draft().language`; all es/en/pt strings in `translations.ts`), `toast/` (`ToastService` + container/item), `format/` (`appDate` pipe, `initialsFrom`) and `dialog/DialogDirective`. Every `<section role="dialog">` uses `appDialog` with `(dialogEscape)`: it traps Tab, moves focus in and back out, and handles Esc without letting it bubble, so a nested dialog (e.g. "Guardar" inside Configuración) closes only itself.

**No backend.** Users and profile are hardcoded seeds mutated in memory; only settings persist (to `localStorage`). There's no HTTP client usage yet.

**Language/UX**: UI text, component selectors' content, and variable names for domain concepts are in Spanish (e.g. `switchView`, `sessionRole`, `Administrador`/`Analista` roles); keep new UI copy and domain terms consistent with this.

**Access control** is a single hardcoded check: `AppComponent.sessionRole === 'Administrador'` gates the whole app shell in `app.component.html` (an `#restricted` template shows otherwise). There's no real auth.
