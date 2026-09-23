import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { DEFAULT_SETTINGS, SIZE_PRESETS, SystemConfig, SystemLogos, cloneSettings } from './settings.model';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'tdo_system_config';
const LEGACY_DEFAULT_PRINCIPAL_LOGO = '/assets/logos/logo-principal.png';

/**
 * Estado de los ajustes globales de la plataforma (uno solo, compartido por
 * todos los usuarios). Mantiene dos copias, como pide el requerimiento:
 * - `saved`: lo último persistido (hoy en localStorage; mañana el backend).
 * - `draft`: lo que el usuario está editando ahora mismo.
 *
 * Cada cambio de `draft` se aplica EN VIVO a toda la interfaz vía ThemeService,
 * no solo a una vista previa local. `save()`/`load()`/`uploadLogo()` están
 * escritos como si fueran llamadas HTTP (Observable) para que, el día que haya
 * backend, baste con cambiar su implementación interna sin tocar los componentes.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly theme = inject(ThemeService);

  private readonly savedSignal = signal<SystemConfig>(cloneSettings(DEFAULT_SETTINGS));
  private readonly draftSignal = signal<SystemConfig>(cloneSettings(DEFAULT_SETTINGS));

  readonly saved = this.savedSignal.asReadonly();
  readonly draft = this.draftSignal.asReadonly();
  readonly isDirty = computed(() => JSON.stringify(this.draftSignal()) !== JSON.stringify(this.savedSignal()));

  /** Simula `GET /api/settings`. */
  load(): Observable<SystemConfig> {
    const stored = this.readFromStorage();
    this.savedSignal.set(stored);
    this.draftSignal.set(cloneSettings(stored));
    this.theme.apply(stored);
    return new Observable<SystemConfig>((subscriber) => {
      subscriber.next(stored);
      subscriber.complete();
    });
  }

  /** Actualiza el borrador y lo aplica de inmediato a toda la interfaz. */
  updateDraft(patch: Partial<SystemConfig>): void {
    const next: SystemConfig = { ...this.draftSignal(), ...patch };
    this.draftSignal.set(next);
    this.theme.apply(next);
  }

  /** Simula `PATCH /api/settings`. Solo admin puede llegar a este flujo (vista protegida). */
  save(): Observable<SystemConfig> {
    const toSave = cloneSettings(this.draftSignal());
    if (!this.writeToStorage(toSave)) {
      // No cabe en el almacenamiento (p. ej. logos muy pesados): no se marca
      // como guardado, el borrador sigue pendiente y quien llama muestra el error.
      return throwError(() => new Error('STORAGE_FULL'));
    }
    this.savedSignal.set(toSave);
    this.theme.apply(toSave);
    return new Observable<SystemConfig>((subscriber) => {
      subscriber.next(toSave);
      subscriber.complete();
    });
  }

  /**
   * Restablecer: vuelve a los valores de fábrica y los GUARDA de inmediato
   * (misma persistencia que `save()`), descartando cualquier cambio pendiente.
   * No hace falta pulsar "Guardar cambios" después.
   */
  reset(): Observable<SystemConfig> {
    this.draftSignal.set(cloneSettings(DEFAULT_SETTINGS));
    return this.save();
  }

  /** Descarta el borrador sin guardar y reaplica lo guardado (al cerrar el panel sin "Guardar"). */
  discardDraft(): void {
    const saved = cloneSettings(this.savedSignal());
    this.draftSignal.set(saved);
    this.theme.apply(saved);
  }

  /**
   * Simula `POST /api/settings/logos` (multipart). Valida tipo imagen y máx.
   * 2MB. Los errores usan códigos estables (no texto) porque este servicio no
   * conoce el idioma actual — el componente que llama es quien traduce el
   * código a un mensaje visible (ver `LOGO_UPLOAD_ERROR_KEYS` en el tab de Logos).
   */
  uploadLogo(file: File, slot: keyof SystemLogos | 'all'): Observable<string> {
    if (!file.type.startsWith('image/')) {
      return throwError(() => new Error('NOT_IMAGE'));
    }
    if (file.size > 2 * 1024 * 1024) {
      return throwError(() => new Error('TOO_LARGE'));
    }

    return new Observable<string>((subscriber) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;

        if (this.isSvg(file) && !this.isSvgContentSafe(url)) {
          subscriber.error(new Error('UNSAFE_SVG'));
          return;
        }

        let logos: SystemLogos;
        if (slot === 'all') {
          logos = { principal: url, login: url, favicon: url };
        } else {
          logos = { ...this.draftSignal().logos, [slot]: url };
        }
        this.updateDraft({ logos });
        subscriber.next(url);
        subscriber.complete();
      };
      reader.onerror = () => subscriber.error(new Error('READ_FAILED'));
      reader.readAsDataURL(file);
    });
  }

  removeLogo(slot: keyof SystemLogos): void {
    this.updateDraft({ logos: { ...this.draftSignal().logos, [slot]: null } });
  }

  private isSvg(file: File): boolean {
    return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  }

  /**
   * Los logos ya se renderizan con `<img [src]="dataUrl">`, un contexto en el
   * que el navegador desactiva scripts y manejadores de eventos embebidos en
   * el SVG por sí solo (no es HTML activo, es "modo imagen"). Aun así se
   * rechaza contenido peligroso al momento de subirlo, como segunda capa de
   * defensa (por si en el futuro se renderiza distinto, p. ej. con
   * `[innerHTML]`, o se envía a un backend que sí lo interprete como XML activo).
   */
  private isSvgContentSafe(dataUrl: string): boolean {
    try {
      const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
      const svgText = atob(base64);
      const unsafePattern = /<script[\s>]|on[a-z]+\s*=|javascript:|<foreignobject[\s>]/i;
      return !unsafePattern.test(svgText);
    } catch {
      return false;
    }
  }

  private readFromStorage(): SystemConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return cloneSettings(DEFAULT_SETTINGS);
      }

      // `fontFamily` y `borderRadius` ya no son ajustes (Work Sans / Suave fijos):
      // se descartan si vienen de una versión anterior guardada.
      const { fontFamily: _font, borderRadius: _radius, ...parsed } = JSON.parse(raw);
      // El logo principal por defecto pasó de logo-principal.png (con texto)
      // a logo-simbolo.png; un logo subido por el usuario (data URL) se respeta.
      if (parsed.logos?.principal === LEGACY_DEFAULT_PRINCIPAL_LOGO) {
        parsed.logos.principal = DEFAULT_SETTINGS.logos.principal;
      }
      return {
        ...cloneSettings(DEFAULT_SETTINGS),
        ...parsed,
        fontSize: SIZE_PRESETS.reduce((best, preset) => (Math.abs(preset.value - parsed.fontSize) < Math.abs(best.value - parsed.fontSize) ? preset : best), SIZE_PRESETS[1]).value,
        theme: parsed.theme === 'oscuro' ? 'oscuro' : 'claro',
        density: ['compacta', 'comoda', 'amplia'].includes(parsed.density) ? parsed.density : 'comoda',
        logos: { ...DEFAULT_SETTINGS.logos, ...(parsed.logos ?? {}) }
      };
    } catch {
      return cloneSettings(DEFAULT_SETTINGS);
    }
  }

  /** `false` solo si el almacenamiento está lleno: ahí sí se perdería lo guardado al recargar. */
  private writeToStorage(config: SystemConfig): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      // Storage puede no estar disponible en entornos con almacenamiento
      // restringido: en ese caso se sigue guardando solo en memoria, como antes.
      return !(error instanceof DOMException && error.name === 'QuotaExceededError');
    }
  }
}
