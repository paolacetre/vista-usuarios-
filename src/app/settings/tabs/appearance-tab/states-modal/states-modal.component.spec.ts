import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatesModalComponent } from './states-modal.component';

describe('StatesModalComponent', () => {
  let fixture: ComponentFixture<StatesModalComponent>;
  let component: StatesModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatesModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the three state cards (approved/rejected/warning) with their color class', () => {
    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('.state-detail-row');
    expect(rows.length).toBe(3);
    expect(rows[0].classList.contains('ok')).toBeTrue();
    expect(rows[1].classList.contains('error')).toBeTrue();
    expect(rows[2].classList.contains('warn')).toBeTrue();
    expect(el.querySelectorAll('.state-detail-meta-item').length).toBe(6);
  });

  it('should be a purely informative modal — no footer and no action buttons', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.states-modal-footer')).toBeNull();
    expect(el.querySelector('.footer-actions')).toBeNull();
    expect(el.querySelector('.secondary-btn')).toBeNull();
    expect(el.querySelector('.save-primary-btn')).toBeNull();
    // The only clickable control besides the state cards is the close (X) button.
    expect(el.querySelectorAll('button').length).toBe(1);
    expect(el.querySelector('.states-modal-close')).not.toBeNull();
  });

  it('should emit closeEvent when the X button is clicked', () => {
    const emitSpy = spyOn(component.closeEvent, 'emit');
    const closeBtn = (fixture.nativeElement as HTMLElement).querySelector('.states-modal-close') as HTMLButtonElement;
    closeBtn.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit closeEvent when clicking the backdrop, but not when clicking inside the card', () => {
    const emitSpy = spyOn(component.closeEvent, 'emit');
    const el = fixture.nativeElement as HTMLElement;

    (el.querySelector('.states-modal') as HTMLElement).click();
    expect(emitSpy).not.toHaveBeenCalled();

    (el.querySelector('.dialog-backdrop') as HTMLElement).click();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
