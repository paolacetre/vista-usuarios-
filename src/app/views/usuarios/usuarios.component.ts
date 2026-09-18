import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, HostListener, Input, ViewChild, computed, inject } from '@angular/core';
import { ToastService } from '../../shared/toast/toast.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { TranslationService } from '../../shared/i18n/translation.service';
import { AppDatePipe, todayInTimezone } from '../../shared/format/app-date.pipe';
import { SettingsService } from '../../settings/settings.service';

export type UserRole = 'Admin' | 'Analista';
export type UserStatus = 'Activo' | 'Inactivo';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  date: string;
  initials: string;
}

export interface UserDraft {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, AppDatePipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  @ViewChild('deleteDialog') deleteDialog?: ElementRef<HTMLElement>;
  @ViewChild('cancelDeleteButton') cancelDeleteButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('statusDialog') statusDialog?: ElementRef<HTMLElement>;
  @ViewChild('cancelStatusButton') cancelStatusButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('resetAccessDialog') resetAccessDialog?: ElementRef<HTMLElement>;
  @ViewChild('cancelResetAccessButton') cancelResetAccessButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('userFormDialog') userFormDialog?: ElementRef<HTMLElement>;
  @ViewChild('userNameInput') userNameInput?: ElementRef<HTMLInputElement>;

  @Input() users: User[] = [
    { id: 1, name: 'SENA Admin', email: 'admin@tdo.gov.co', password: 'Admin*Password2026', role: 'Admin', status: 'Activo', date: '24/08/2026', initials: 'SA' },
    { id: 2, name: 'Analista TDO', email: 'analista@tdo.gov.co', password: 'Analista*Password2026', role: 'Analista', status: 'Activo', date: '24/08/2026', initials: 'AT' },
  ];

  private readonly toastService = inject(ToastService);
  private readonly translationService = inject(TranslationService);
  private readonly settingsService = inject(SettingsService);

  /** Accesibilidad > "Modo solo lectura": bloquea crear, editar, cambiar estado, restablecer acceso y eliminar. */
  readonly readOnly = computed(() => this.settingsService.draft().readOnly);

  readonly roles = ['Todos', 'Analista', 'Admin'] as const;
  readonly statuses = ['Todos', 'Activo', 'Inactivo'] as const;

  searchTerm = '';
  selectedRole = 'Todos';
  selectedStatus = 'Todos';
  showForm = false;
  isLoading = false;
  loadError = '';
  formError = '';
  editingUserId: number | null = null;
  isFormPending = false;
  pendingDeletion: User | null = null;
  isDeletePending = false;
  pendingStatusChange: User | null = null;
  isStatusPending = false;
  pendingResetAccess: User | null = null;
  isResetAccessPending = false;

  private pendingUserIds = new Set<number>();
  private deleteTrigger?: HTMLElement;
  private statusTrigger?: HTMLElement;
  private resetAccessTrigger?: HTMLElement;
  private formTrigger?: HTMLElement;

  formUser: UserDraft = this.emptyUserDraft();

  get filteredUsers() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.users.filter(
      (user) =>
        (!term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)) &&
        (this.selectedRole === 'Todos' || user.role === this.selectedRole) &&
        (this.selectedStatus === 'Todos' || user.status === this.selectedStatus)
    );
  }

  get filtersCount() {
    let count = 0;
    if (this.searchTerm.trim()) count += 1;
    if (this.selectedRole !== 'Todos') count += 1;
    if (this.selectedStatus !== 'Todos') count += 1;
    return count;
  }

  get hasActiveFilters() {
    return this.filtersCount > 0;
  }

  get isFilteredEmpty() {
    return !this.isLoading && !this.loadError && !this.filteredUsers.length && this.hasActiveFilters;
  }

  get isCompletelyEmpty() {
    return !this.isLoading && !this.loadError && !this.users.length && !this.hasActiveFilters;
  }

  countBy(field: 'role' | 'status', value: string) {
    return this.users.filter((user) => user[field] === value).length;
  }

  /** Etiqueta singular para el badge de rol en la tabla (Admin/Analista). */
  roleBadgeLabel(role: string): string {
    return this.translationService.translate(role === 'Admin' ? 'usuarios.roleAdmin' : 'usuarios.roleAnalyst');
  }

  /** Etiqueta plural para los botones de filtro por rol (Administradores/Analistas/Todos). */
  roleFilterLabel(role: string): string {
    if (role === 'Admin') return this.translationService.translate('usuarios.roleAdmins');
    if (role === 'Analista') return this.translationService.translate('usuarios.roleAnalysts');
    return this.translationService.translate('usuarios.roleAll');
  }

  statusLabel(status: string): string {
    if (status === 'Activo') return this.translationService.translate('usuarios.statusActive');
    if (status === 'Inactivo') return this.translationService.translate('usuarios.statusInactive');
    return this.translationService.translate('usuarios.statusAll');
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = 'Todos';
    this.selectedStatus = 'Todos';
    this.emitNotice(this.translationService.translate('usuarios.toastFiltersReset'));
  }

  setRole(role: string) {
    this.selectedRole = this.selectedRole === role && role !== 'Todos' ? 'Todos' : role;
  }

  setStatus(status: string) {
    this.selectedStatus = this.selectedStatus === status && status !== 'Todos' ? 'Todos' : status;
  }

  emitNotice(message: string, type: 'success' | 'error' = 'success') {
    if (type === 'error') {
      this.toastService.error(message);
    } else {
      this.toastService.success(message);
    }
  }

  retryLoad() {
    this.isLoading = true;
    this.loadError = '';

    setTimeout(() => {
      this.isLoading = false;
      this.emitNotice(this.translationService.translate('usuarios.toastListUpdated'));
    }, 250);
  }

  isUserPending(user: User) {
    return this.pendingUserIds.has(user.id);
  }

  trackUserById(_index: number, user: User) {
    return user.id;
  }

  startCreate(event?: Event) {
    if (this.readOnly()) {
      return;
    }

    this.editingUserId = null;
    this.formError = '';
    this.formUser = this.emptyUserDraft();
    this.openForm(event);
  }

  startEdit(user: User, event?: Event) {
    if (this.readOnly() || this.isUserPending(user)) {
      return;
    }

    this.editingUserId = user.id;
    this.formError = '';
    this.formUser = { name: user.name, email: user.email, password: user.password || '', role: user.role };
    this.openForm(event);
  }

  closeForm() {
    if (!this.isFormPending) {
      this.showForm = false;
      this.formError = '';
      setTimeout(() => this.formTrigger?.focus());
    }
  }

  saveUser() {
    if (this.readOnly() || this.isFormPending) {
      return;
    }

    const name = this.formUser.name.trim();
    const email = this.formUser.email.trim().toLowerCase();
    const password = this.formUser.password?.trim() || '';

    if (!name || !email) {
      this.formError = this.translationService.translate('usuarios.validationNameEmail');
      return;
    }

    if (this.editingUserId === null && !password) {
      this.formError = this.translationService.translate('usuarios.validationPassword');
      return;
    }

    const duplicateEmail = this.users.some((user) => user.email.toLowerCase() === email && user.id !== this.editingUserId);
    if (duplicateEmail) {
      this.formError = this.translationService.translate('usuarios.validationDuplicateEmail');
      return;
    }

    this.isFormPending = true;
    this.formError = '';
    setTimeout(() => {
      try {
        if (this.editingUserId === null) {
          const user: User = {
            id: this.nextUserId(),
            name,
            email,
            password,
            role: this.formUser.role,
            status: 'Activo',
            date: todayInTimezone(this.settingsService.draft().timezone),
            initials: this.initialsFor(name),
          };
          this.users = [...this.users, user];
          this.emitNotice(this.translationService.translate('usuarios.toastUserCreated', { name: user.name }));
        } else {
          const user = this.users.find((item) => item.id === this.editingUserId);
          if (!user) {
            throw new Error(this.translationService.translate('usuarios.errorUserGone'));
          }
          const updatedUser: Partial<User> = {
            name,
            email,
            role: this.formUser.role,
            initials: this.initialsFor(name)
          };
          if (password) {
            updatedUser.password = password;
          }
          Object.assign(user, updatedUser);
          this.emitNotice(this.translationService.translate('usuarios.toastUserUpdated', { name: user.name }));
        }
        this.showForm = false;
        setTimeout(() => this.formTrigger?.focus());
      } catch (error) {
        this.formError = error instanceof Error ? error.message : this.translationService.translate('usuarios.errorSave');
      } finally {
        this.isFormPending = false;
      }
    }, 250);
  }

  requestStatusChange(user: User, event: Pick<Event, 'currentTarget'>) {
    if (this.readOnly() || this.isUserPending(user)) {
      return;
    }

    this.pendingStatusChange = user;
    this.statusTrigger = event.currentTarget as HTMLElement;
    setTimeout(() => this.cancelStatusButton?.nativeElement.focus() ?? this.statusDialog?.nativeElement.focus());
  }

  cancelStatusChange() {
    if (this.isStatusPending) {
      return;
    }

    this.pendingStatusChange = null;
    setTimeout(() => this.statusTrigger?.focus());
  }

  confirmStatusChange() {
    const user = this.pendingStatusChange;
    if (!user || this.isStatusPending || this.isUserPending(user)) {
      return;
    }

    const nextStatus: UserStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    this.isStatusPending = true;
    this.runUserOperation(user, () => {
      user.status = nextStatus;
      this.emitNotice(this.translationService.translate(nextStatus === 'Activo' ? 'usuarios.toastUserActivated' : 'usuarios.toastUserDeactivated', { name: user.name }));
      this.pendingStatusChange = null;
      this.isStatusPending = false;
      setTimeout(() => this.statusTrigger?.focus());
    });
  }

  requestResetAccess(user: User, event: Pick<Event, 'currentTarget'>) {
    if (this.readOnly() || this.isUserPending(user)) {
      return;
    }

    this.pendingResetAccess = user;
    this.resetAccessTrigger = event.currentTarget as HTMLElement;
    setTimeout(() => this.cancelResetAccessButton?.nativeElement.focus() ?? this.resetAccessDialog?.nativeElement.focus());
  }

  cancelResetAccess() {
    if (this.isResetAccessPending) {
      return;
    }

    this.pendingResetAccess = null;
    setTimeout(() => this.resetAccessTrigger?.focus());
  }

  confirmResetAccess() {
    const user = this.pendingResetAccess;
    if (!user || this.isResetAccessPending || this.isUserPending(user)) {
      return;
    }

    this.isResetAccessPending = true;
    this.runUserOperation(user, () => {
      this.emitNotice(this.translationService.translate('usuarios.toastAccessReset', { name: user.name }));
      this.pendingResetAccess = null;
      this.isResetAccessPending = false;
      setTimeout(() => this.resetAccessTrigger?.focus());
    });
  }

  requestDelete(user: User, event: Pick<Event, 'currentTarget'>) {
    if (this.readOnly() || this.isUserPending(user)) {
      return;
    }

    this.pendingDeletion = user;
    this.deleteTrigger = event.currentTarget as HTMLElement;
    setTimeout(() => this.cancelDeleteButton?.nativeElement.focus() ?? this.deleteDialog?.nativeElement.focus());
  }

  cancelDelete() {
    if (this.isDeletePending) {
      return;
    }

    this.pendingDeletion = null;
    setTimeout(() => this.deleteTrigger?.focus());
  }

  confirmDelete() {
    const user = this.pendingDeletion;
    if (!user || this.isDeletePending || this.isUserPending(user)) {
      return;
    }

    this.isDeletePending = true;
    this.pendingUserIds = new Set(this.pendingUserIds).add(user.id);
    setTimeout(() => {
      try {
        this.users = this.users.filter((item) => item.id !== user.id);
        this.emitNotice(this.translationService.translate('usuarios.toastUserDeleted', { name: user.name }));
        this.pendingDeletion = null;
      } catch (error) {
        const message = error instanceof Error ? error.message : this.translationService.translate('usuarios.errorDelete');
        this.emitNotice(message, 'error');
      } finally {
        const pendingUserIds = new Set(this.pendingUserIds);
        pendingUserIds.delete(user.id);
        this.pendingUserIds = pendingUserIds;
        this.isDeletePending = false;
        if (!this.pendingDeletion) {
          setTimeout(() => this.deleteTrigger?.focus());
        }
      }
    }, 250);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onDocumentEscape(event: Event) {
    if (this.pendingResetAccess) {
      event.preventDefault();
      this.cancelResetAccess();
    }

    if (this.pendingStatusChange) {
      event.preventDefault();
      this.cancelStatusChange();
    }

    if (this.pendingDeletion) {
      event.preventDefault();
      this.cancelDelete();
    }

    if (this.showForm && !this.isFormPending) {
      event.preventDefault();
      this.closeForm();
    }
  }

  private runUserOperation(user: User, operation: () => void) {
    if (this.pendingUserIds.has(user.id)) {
      return;
    }

    this.pendingUserIds = new Set(this.pendingUserIds).add(user.id);
    setTimeout(() => {
      try {
        operation();
      } catch (error) {
        const message = error instanceof Error ? error.message : this.translationService.translate('usuarios.errorGeneric');
        this.emitNotice(message, 'error');
      } finally {
        const pendingUserIds = new Set(this.pendingUserIds);
        pendingUserIds.delete(user.id);
        this.pendingUserIds = pendingUserIds;
      }
    }, 250);
  }

  private emptyUserDraft(): UserDraft {
    return { name: '', email: '', password: '', role: 'Analista' };
  }

  private nextUserId() {
    return this.users.reduce((highestId, user) => Math.max(highestId, user.id), 0) + 1;
  }

  private initialsFor(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  private openForm(event?: Event) {
    this.formTrigger = event?.currentTarget as HTMLElement | undefined;
    this.showForm = true;
    setTimeout(() => this.userNameInput?.nativeElement.focus() ?? this.userFormDialog?.nativeElement.focus());
  }
}
