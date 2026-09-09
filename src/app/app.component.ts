import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly sessionRole = 'Administrador';
  searchTerm = '';
  selectedRole = 'Todos';
  selectedStatus = 'Todos';
  darkMode = false;
  showForm = false;
  notice = '';
  users = [
    { name: 'SENA Admin', email: 'admin@tdo.gov.co', role: 'Admin', status: 'Activo', date: '24/08/2026', initials: 'SA' },
    { name: 'Analista TDO', email: 'analista@tdo.gov.co', role: 'Analista', status: 'Activo', date: '24/08/2026', initials: 'AT' },
  ];
  get filteredUsers() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.users.filter((user) => (!term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)) && (this.selectedRole === 'Todos' || user.role === this.selectedRole) && (this.selectedStatus === 'Todos' || user.status === this.selectedStatus));
  }
  countBy(field: 'role' | 'status', value: string) {
    return this.users.filter((user) => user[field] === value).length;
  }
  setNotice(message: string) { this.notice = message; window.setTimeout(() => this.notice = '', 2600); }
  toggleUser(user: { name: string; status: string }) { user.status = user.status === 'Activo' ? 'Inactivo' : 'Activo'; this.setNotice(`${user.name} ahora está ${user.status.toLowerCase()}.`); }
  deleteUser(user: { name: string }) { this.users = this.users.filter((item) => item.name !== user.name); this.setNotice(`${user.name} fue eliminado de la lista.`); }
}
