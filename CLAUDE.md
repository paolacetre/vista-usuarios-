## Comandos

- `ng serve` / `npm start`: servidor de desarrollo en `http://localhost:4200/` con recarga automática.
- `ng build`: build de producción, con salida en `dist/gestion-usuarios/`.
- `ng build --watch --configuration development` / `npm run watch`: build de desarrollo que se recompila al guardar.
- `ng test`: pruebas unitarias con Karma/Jasmine (lanzador de Chrome; por defecto queda observando cambios).
- `ng test --watch=false`: una sola ejecución, útil para verificaciones tipo CI.
- `ng test --include='**/usuarios.component.spec.ts'`: ejecuta un solo archivo de pruebas.
- `ng generate component views/<nombre>`: crea una vista standalone nueva con el estilo actual (ver Arquitectura).

No hay script de lint configurado ni framework de pruebas e2e.

## Arquitectura

Aplicación Angular 19 con componentes standalone (sin NgModules ni router) llamada `gestion-usuarios`. Es un panel de administración de una sola página ("Tendencias Ocupacionales" / SENA) con tres vistas que se alternan manualmente mediante un campo de texto.

**Cambio de vista sin router.** `AppComponent` (`src/app/app.component.ts`) tiene `currentView: 'usuarios' | 'perfil' | 'configuracion'` y decide con `*ngIf` en `app.component.html` qué componente hijo se muestra. `switchView()` cambia la vista activa. `configuracion` es un caso especial: se muestra como un modal superpuesto (`configurationOpen`) en lugar de reemplazar el contenido principal, así que `usuarios` sigue montado debajo. Cerrar el modal (X, clic fuera o Esc) llama a `closeConfiguration()`, que descarta el borrador de configuración sin guardar.

**Estado.** Los usuarios y el perfil viven en `AppComponent` (`users`, `profileUser`), inicializados con `createInitialUsers()` / `createInitialProfile()`, que se exportan desde los archivos de cada vista. `UsuariosComponent` se enlaza con `[(users)]`: emite `usersChange` cada vez que reemplaza la lista (crear/eliminar), mientras que las ediciones y los cambios de estado modifican los mismos objetos de usuario. `PerfilComponent` recibe `[profile]` y emite `profileSaved` / `cancel`. La configuración del sistema vive en `SettingsService` (signals), no en `AppComponent`.

**Vistas.** Están en `src/app/views/<nombre>/` (`usuarios`, `perfil`). Cada una es un componente standalone con sus propios `.ts`/`.html`/`.css`/`.spec.ts` y usa formularios template-driven (`FormsModule`). Cada archivo de vista exporta además sus tipos de dominio (`User`, `UserDraft`, `UserRole` en `usuarios.component.ts`; `ProfileData` en `perfil.component.ts`): los tipos se importan directamente desde ese archivo.

**Configuración.** Está en `src/app/settings/`: `SettingsComponent` (pestañas con patrón tablist, vista previa en vivo y confirmaciones de Guardar/Restablecer) más un componente standalone por pestaña en `tabs/` (apariencia, logos, idioma, accesibilidad, preferencias, acerca de). Las pestañas usan formularios reactivos cuyos cambios van directo a `SettingsService.updateDraft()`. Sus estilos compartidos están en `_settings-shared.scss`, que cada pestaña incluye con `@use` (por eso se emite una vez por pestaña). Los tipos y las listas de opciones están en `settings.model.ts`.

**Configuración: borrador vs. guardado.** `SettingsService` mantiene `saved` (persistido en `localStorage` bajo la clave `tdo_system_config`) y `draft` (lo que se está editando). Cada cambio del borrador se aplica en vivo a toda la interfaz.
- `save()` persiste el borrador y falla con `STORAGE_FULL` si se supera la cuota de almacenamiento.
- `discardDraft()` vuelve a lo guardado.
- `reset()` vuelve a los valores de fábrica (`DEFAULT_SETTINGS`) y los guarda de inmediato con `save()`; no requiere pulsar "Guardar cambios".

`ThemeService` es el único lugar que toca el DOM global para el tema: variables CSS (`--primary-color`, `--accent-color`, `--type-scale`, …), los atributos `data-density` / `data-high-contrast` / `data-large-icons` / `data-read-only` en `document.documentElement`, y el favicon. El modo oscuro es `draft().theme === 'oscuro'`, que se refleja como la clase `.dark-mode` en el div raíz del shell; el botón de luna de la barra superior guarda el tema directamente.

**Compartido** (`src/app/shared/`):
- `i18n/`: `TranslationService` + pipe impuro `translate`, que lee `draft().language`. Todos los textos en es/en/pt están en `translations.ts`.
- `toast/`: `ToastService` + contenedor e ítem.
- `format/`: pipe `appDate` e `initialsFrom`.
- `dialog/DialogDirective`: todo `<section role="dialog">` usa `appDialog` con `(dialogEscape)`. Mantiene el foco dentro con Tab, lo mueve al abrir y lo devuelve al cerrar, y maneja Esc sin dejar que se propague. Así un diálogo anidado (p. ej. "Guardar" dentro de Configuración) se cierra solo él.

**Sin backend.** Los usuarios y el perfil son datos de ejemplo fijos que se modifican en memoria; solo la configuración se persiste (en `localStorage`). Todavía no se usa cliente HTTP.

**Idioma/UX.** Los textos de la interfaz y los nombres de variables de conceptos de dominio están en español (p. ej. `switchView`, `sessionRole`, roles `Administrador`/`Analista`). Mantén el texto nuevo de la interfaz y los términos de dominio coherentes con esto.

**Control de acceso.** Es una única comprobación fija: `AppComponent.sessionRole === 'Administrador'` habilita todo el shell en `app.component.html` (si no, se muestra la plantilla `#restricted`). No hay autenticación real.
