import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';

interface StateCardItem {
  key: 'approved' | 'rejected' | 'warning';
  cls: 'ok' | 'error' | 'warn';
}

/**
 * Modal estrictamente informativo: documenta los 3 únicos estados del
 * sistema (Aprobado/Rechazado/Advertencia), qué color usa cada uno, para qué
 * se usa y cuándo aparece. No hay nada que editar ni guardar acá — por eso
 * no tiene barra de acciones, solo el botón "X" del encabezado. Se cierra
 * con ese botón o haciendo clic fuera, en el backdrop (nunca haciendo clic
 * dentro de la tarjeta, que detiene la propagación del evento).
 */
@Component({
  selector: 'app-states-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './states-modal.component.html',
  styleUrl: './states-modal.component.scss'
})
export class StatesModalComponent {
  @Output() readonly closeEvent = new EventEmitter<void>();

  readonly stateItems: StateCardItem[] = [
    { key: 'approved', cls: 'ok' },
    { key: 'rejected', cls: 'error' },
    { key: 'warning', cls: 'warn' }
  ];

  close(): void {
    this.closeEvent.emit();
  }
}
