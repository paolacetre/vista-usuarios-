import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

type UserRole = 'Admin' | 'Analista';
type UserStatus = 'Activo' | 'Inactivo';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  date: string;
  initials: string;
}

interface UserDraft {
  name: string;
  email: string;
  role: UserRole;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('deleteDialog') deleteDialog?: ElementRef<HTMLElement>;
  @ViewChild('cancelDeleteButton') cancelDeleteButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('userFormDialog') userFormDialog?: ElementRef<HTMLElement>;
  @ViewChild('userNameInput') userNameInput?: ElementRef<HTMLInputElement>;
  readonly sessionRole = 'Administrador';
  readonly roles = ['Todos', 'Analista', 'Admin'] as const;
  readonly statuses = ['Todos', 'Activo', 'Inactivo'] as const;
  searchTerm = '';
  selectedRole = 'Todos';
  selectedStatus = 'Todos';
  darkMode = false;
  showForm = false;
  notice = '';
  noticeType: 'success' | 'error' = 'success';
  isLoading = false;
  loadError = '';
  formError = '';
  editingUserId: number | null = null;
  isFormPending = false;
  pendingDeletion: User | null = null;
  isDeletePending = false;
  private noticeTimeout?: ReturnType<typeof setTimeout>;
  private pendingUserIds = new Set<number>();
  private deleteTrigger?: HTMLElement;
  private formTrigger?: HTMLElement;
  formUser: UserDraft = this.emptyUserDraft();
  users: User[] = [
    { id: 1, name: 'SENA Admin', email: 'admin@tdo.gov.co', role: 'Admin', status: 'Activo', date: '24/08/2026', initials: 'SA' },
    { id: 2, name: 'Analista TDO', email: 'analista@tdo.gov.co', role: 'Analista', status: 'Activo', date: '24/08/2026', initials: 'AT' },
  ];

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

  get resultsPercentage() {
    return this.users.length ? Math.round((this.filteredUsers.length / this.users.length) * 100) : 0;
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

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = 'Todos';
    this.selectedStatus = 'Todos';
    this.setNotice('Filtros reiniciados.');
  }

  setRole(role: string) {
    this.selectedRole = role;
  }

  setStatus(status: string) {
    this.selectedStatus = status;
  }

  setNotice(message: string, type: 'success' | 'error' = 'success') {
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
    }

    this.notice = message;
    this.noticeType = type;
    this.noticeTimeout = setTimeout(() => this.notice = '', 2600);
  }

  retryLoad() {
    this.isLoading = true;
    this.loadError = '';

    setTimeout(() => {
      this.isLoading = false;
      this.setNotice('La lista de usuarios se actualizó.');
    }, 250);
  }

  isUserPending(user: User) {
    return this.pendingUserIds.has(user.id);
  }

  trackUserById(_index: number, user: User) {
    return user.id;
  }

  startCreate(event?: Event) {
    this.editingUserId = null;
    this.formError = '';
    this.formUser = this.emptyUserDraft();
    this.openForm(event);
  }

  startEdit(user: User, event?: Event) {
    if (this.isUserPending(user)) {
      return;
    }

    this.editingUserId = user.id;
    this.formError = '';
    this.formUser = { name: user.name, email: user.email, role: user.role };
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
    if (this.isFormPending) {
      return;
    }

    const name = this.formUser.name.trim();
    const email = this.formUser.email.trim().toLowerCase();
    if (!name || !email) {
      this.formError = 'Completa el nombre y el correo para continuar.';
      return;
    }

    const duplicateEmail = this.users.some((user) => user.email.toLowerCase() === email && user.id !== this.editingUserId);
    if (duplicateEmail) {
      this.formError = 'Ya existe un usuario registrado con ese correo.';
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
            role: this.formUser.role,
            status: 'Activo',
            date: new Date().toLocaleDateString('es-CO'),
            initials: this.initialsFor(name),
          };
          this.users = [...this.users, user];
          this.setNotice(`Usuario "${user.name}" creado correctamente.`);
        } else {
          const user = this.users.find((item) => item.id === this.editingUserId);
          if (!user) {
            throw new Error('El usuario ya no está disponible.');
          }
          Object.assign(user, { name, email, role: this.formUser.role, initials: this.initialsFor(name) });
          this.setNotice(`Usuario "${user.name}" actualizado correctamente.`);
        }
        this.showForm = false;
        setTimeout(() => this.formTrigger?.focus());
      } catch (error) {
        this.formError = error instanceof Error ? error.message : 'No fue posible guardar el usuario.';
      } finally {
        this.isFormPending = false;
      }
    }, 250);
  }

  toggleUser(user: User) {
    const nextStatus: UserStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    this.runUserOperation(user, () => {
      user.status = nextStatus;
      this.setNotice(`Usuario "${user.name}" ${nextStatus === 'Activo' ? 'activado' : 'desactivado'} correctamente.`);
    });
  }

  resetUserAccess(user: User) {
    this.runUserOperation(user, () => {
      this.setNotice(`Acceso de "${user.name}" restablecido correctamente.`);
    });
  }

  requestDelete(user: User, event: Pick<Event, 'currentTarget'>) {
    if (this.isUserPending(user)) {
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

  @HostListener('document:keydown.escape', ['$event'])
  onDocumentEscape(event: Event) {
    if (this.pendingDeletion) {
      event.preventDefault();
      this.cancelDelete();
    }

    if (this.showForm && !this.isFormPending) {
      event.preventDefault();
      this.closeForm();
    }
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
        this.setNotice(`Usuario "${user.name}" eliminado correctamente.`);
        this.pendingDeletion = null;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No fue posible eliminar el usuario. Intenta nuevamente.';
        this.setNotice(message, 'error');
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

  private runUserOperation(user: User, operation: () => void) {
    if (this.pendingUserIds.has(user.id)) {
      return;
    }

    this.pendingUserIds = new Set(this.pendingUserIds).add(user.id);
    setTimeout(() => {
      try {
        operation();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No fue posible completar la acción.';
        this.setNotice(message, 'error');
      } finally {
        const pendingUserIds = new Set(this.pendingUserIds);
        pendingUserIds.delete(user.id);
        this.pendingUserIds = pendingUserIds;
      }
    }, 250);
  }

  private emptyUserDraft(): UserDraft {
    return { name: '', email: '', role: 'Analista' };
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
