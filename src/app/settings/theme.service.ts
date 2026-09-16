import { Injectable } from '@angular/core';
import { SystemConfig } from './settings.model';

/**
 * Aplica los tokens de diseño (colores, tipografía, tamaño, radios, densidad)
 * como variables CSS en vivo sobre `document.documentElement`. Es el único
 * lugar que toca el DOM global para theming; `SettingsService` decide *cuándo*
 * llamarlo (cada cambio de borrador, guardado, restablecido o descartado).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  apply(config: SystemConfig): void {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.primaryColor);
    root.style.setProperty('--primary-color-hover', this.adjustColor(config.primaryColor, -12));
    root.style.setProperty('--primary-color-light', `${config.primaryColor}18`);
    root.style.setProperty('--primary-color-dark', this.adjustColor(config.primaryColor, -24));
    root.style.setProperty('--primary-color-soft', this.toRgba(config.primaryColor, 0.14));
    root.style.setProperty('--accent-color', config.accentColor);
    root.style.setProperty('--accent-color-hover', this.adjustColor(config.accentColor, -12));
    root.style.setProperty('--accent-color-soft', this.toRgba(config.accentColor, 0.2));
    root.style.setProperty('--app-font-family', config.fontFamily);
    root.style.setProperty('--app-font-size', `${config.fontSize}px`);
    root.style.setProperty('--border-radius', `${config.borderRadius}px`);
    root.style.setProperty('--density-space', config.density === 'compacta' ? '0.75' : config.density === 'amplia' ? '1.25' : '1');
    root.setAttribute('data-density', config.density);

    this.applyFavicon(config.logos.favicon);
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
