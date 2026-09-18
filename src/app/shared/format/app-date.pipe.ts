import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';

/**
 * Fecha de hoy (YYYY-MM-DD) en la zona horaria configurada en Preferencias.
 * `en-CA` formatea como año-mes-día, así que no hay que rearmar las partes.
 */
export function todayInTimezone(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
}

/**
 * `{{ user.date | appDate }}`: muestra una fecha con el formato elegido en
 * Preferencias (DD/MM/YYYY, MM/DD/YYYY o YYYY-MM-DD). Acepta tanto las fechas
 * guardadas como `DD/MM/YYYY` (datos de ejemplo) como `YYYY-MM-DD` (altas
 * nuevas). Es solo fecha, sin hora, por eso no hay conversión de zona horaria
 * aquí; la zona se aplica al momento de registrar la fecha (`todayInTimezone`).
 * Impuro a propósito, igual que `translate`: la clave no cambia pero el
 * formato sí (vía signal) y debe re-evaluarse en cada ciclo.
 */
@Pipe({
  name: 'appDate',
  standalone: true,
  pure: false
})
export class AppDatePipe implements PipeTransform {
  private readonly settings = inject(SettingsService);

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const parts = this.parse(value);
    if (!parts) {
      return value;
    }

    const day = parts.d.padStart(2, '0');
    const month = parts.m.padStart(2, '0');
    switch (this.settings.draft().dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${parts.y}`;
      case 'YYYY-MM-DD':
        return `${parts.y}-${month}-${day}`;
      default:
        return `${day}/${month}/${parts.y}`;
    }
  }

  private parse(value: string): { y: string; m: string; d: string } | null {
    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value);
    if (iso) {
      return { y: iso[1], m: iso[2], d: iso[3] };
    }

    const latam = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
    if (latam) {
      return { y: latam[3], m: latam[2], d: latam[1] };
    }

    return null;
  }
}
