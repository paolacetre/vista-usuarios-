/// <reference types="jasmine" />

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PerfilComponent, ProfileData } from './perfil.component';

describe('PerfilComponent', () => {
  let fixture: ComponentFixture<PerfilComponent>;
  let comp: PerfilComponent;

  const mockProfile: ProfileData = {
    name: 'SENA Admin',
    email: 'admin@tdo.gov.co',
    role: 'Administrador',
    entity: 'Servicio Nacional de Aprendizaje (SENA)',
    regional: 'Dirección General - Bogotá D.C.',
    dateJoined: '24/08/2026',
    photoUrl: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    comp = fixture.componentInstance;
    comp.profile = { ...mockProfile };
    fixture.detectChanges();
  });

  it('should create the profile component', () => {
    expect(comp).toBeTruthy();
  });

  it('should populate formProfile from input profile on init', () => {
    expect(comp.formProfile.name).toBe(mockProfile.name);
    expect(comp.formProfile.email).toBe(mockProfile.email);
    expect(comp.formProfile.role).toBe(mockProfile.role);
  });

  it('should emit profileSaved event when save is called with valid data', fakeAsync(() => {
    spyOn(comp.profileSaved, 'emit');

    comp.formProfile.name = 'Admin Editado';
    comp.formProfile.email = 'admin.editado@tdo.gov.co';

    comp.save();
    tick(300);

    expect(comp.profileSaved.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Admin Editado',
      email: 'admin.editado@tdo.gov.co'
    }));
    expect(comp.successNotice).toContain('exitosamente');
  }));

  it('should emit cancel event when onCancel is called', () => {
    spyOn(comp.cancel, 'emit');
    comp.formProfile.name = 'No Guardado';

    comp.onCancel();

    expect(comp.cancel.emit).toHaveBeenCalled();
    expect(comp.formProfile.name).toBe(mockProfile.name);
  });

  it('should validate empty name or email', () => {
    comp.formProfile.name = '';
    comp.formProfile.email = '';

    comp.save();

    expect(comp.formError).toContain('completa el nombre');
  });
});
