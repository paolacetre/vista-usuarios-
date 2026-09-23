import { Injectable, NgZone } from '@angular/core';
import { APP_FONT_FAMILY, SOFT_BORDER_RADIUS, SystemConfig } from './settings.model';

/**
 * Aplica los tokens de diseño (colores, tipografía, tamaño, radios, densidad)
 * como variables CSS en vivo sobre `document.documentElement`. Es el único
 * lugar que toca el DOM global para theming; `SettingsService` decide *cuándo*
 * llamarlo (cada cambio de borrador, guardado, restablecido o descartado).
 *
 * Las mutaciones DOM de CSS custom properties se ejecutan fuera de la zona
 * de Angular para que no dispensen ciclos de Change Detection en toda la
 * app. Los componentes que necesitan reaccionar al tema lo hacen vía
 * señales (`draft()`), no observando el DOM.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private readonly ngZone: NgZone) {}

  apply(config: SystemConfig): void {
    if (typeof document === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', config.primaryColor);
      root.style.setProperty('--primary-color-hover', this.adjustColor(config.primaryColor, -12));
      root.style.setProperty('--primary-color-light', `${config.primaryColor}18`);
      root.style.setProperty('--primary-color-dark', this.adjustColor(config.primaryColor, -24));
      root.style.setProperty('--primary-color-soft', this.toRgba(config.primaryColor, 0.14));
      // Sobre fondo oscuro un color principal muy oscuro (p. ej. #001631) se
      // pierde: styles.css usa esta variante en `.shell.dark-mode`.
      const onDark = this.luminance(config.primaryColor) < 0.15 ? '#1FACE3' : config.primaryColor;
      root.style.setProperty('--primary-on-dark', onDark);
      root.style.setProperty('--primary-on-dark-light', `${onDark}18`);
      root.style.setProperty('--primary-on-dark-soft', this.toRgba(onDark, 0.14));
      root.style.setProperty('--accent-color', config.accentColor);
      root.style.setProperty('--accent-color-hover', this.adjustColor(config.accentColor, -12));
      root.style.setProperty('--accent-color-soft', this.toRgba(config.accentColor, 0.2));
      // Fuente y radio son constantes del sistema (Work Sans / Suave), no ajustes.
      root.style.setProperty('--app-font-family', APP_FONT_FAMILY);
      root.style.setProperty('--border-radius', `${SOFT_BORDER_RADIUS}px`);
      // Escala de texto: 1 = párrafo 16px, títulos 26px, subtítulos 20px (styles.css).
      root.style.setProperty('--type-scale', String(config.fontSize / 16));
      root.setAttribute('data-density', config.density);
      // Accesibilidad: banderas que styles.css y los componentes leen para reaccionar.
      root.setAttribute('data-high-contrast', String(config.highContrast));
      root.setAttribute('data-large-icons', String(config.largeIcons));
      root.setAttribute('data-read-only', String(config.readOnly));

      this.applyFavicon(config.logos.favicon);
    });
  }

  /** Actualiza el <link rel="icon"> real de la pestaña del navegador (crea el tag si no existe). */
  private applyFavicon(url: string | null): void {
    if (!url) {
      return;
    }

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.type = this.faviconMimeType(url);
    link.href = url;
  }

  private faviconMimeType(url: string): string {
    if (url.startsWith('data:')) {
      const match = /^data:([^;,]+)/.exec(url);
      return match?.[1] ?? 'image/png';
    }
    if (url.endsWith('.svg')) {
      return 'image/svg+xml';
    }
    if (url.endsWith('.ico')) {
      return 'image/x-icon';
    }
    return 'image/png';
  }

  /** Luminancia relativa aproximada (0 = negro, 1 = blanco). */
  private luminance(color: string): number {
    const value = color.replace('#', '');
    if (value.length !== 6) {
      return 1;
    }
    const [r, g, b] = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private adjustColor(color: string, amount: number): string {
    const value = color.replace('#', '');
    if (value.length !== 6) {
      return color;
    }

    const channels = [0, 2, 4].map((index) => Math.max(0, Math.min(255, parseInt(value.slice(index, index + 2), 16) + amount)));
    return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  private toRgba(hex: string, alpha: number): string {
    const value = hex.replace('#', '');
    if (value.length !== 6) {
      return `rgba(25, 59, 115, ${alpha})`;
    }

    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
