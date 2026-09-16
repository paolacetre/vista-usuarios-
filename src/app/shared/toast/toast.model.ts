export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  /** Duración en milisegundos antes de autocerrarse. */
  duration: number;
}
