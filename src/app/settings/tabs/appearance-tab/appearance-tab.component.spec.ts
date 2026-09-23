import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppearanceTabComponent } from './appearance-tab.component';

/** Debe superar el debounce de 250ms del buscador de color (ver appearance-tab.component.ts). */
const PAST_COLOR_SEARCH_DEBOUNCE_MS = 300;

describe('AppearanceTabComponent', () => {
  let fixture: ComponentFixture<AppearanceTabComponent>;
  let component: AppearanceTabComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppearanceTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppearanceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the accent color live to document.documentElement when changed', () => {
    component.setAccentColor('#ff00aa');
    fixture.detectChanges();

    expect(component.form.controls.accentColor.value).toBe('#ff00aa');
    expect(document.documentElement.style.getPropertyValue('--accent-color')).toBe('#ff00aa');
  });

  it('should apply the primary color live to document.documentElement when changed', () => {
    component.setPrimaryColor('#00aaff');
    fixture.detectChanges();

    expect(component.form.controls.primaryColor.value).toBe('#00aaff');
    expect(document.documentElement.style.getPropertyValue('--primary-color')).toBe('#00aaff');
  });

  it('should expose only the Figma brand colors for "Color principal"', () => {
    expect(component.primaryPresets.map((preset) => preset.color)).toEqual([
      '#7DB728', '#1FACE3', '#001631', '#F1F1F1', '#D4D4D4', '#8F8F8F', '#525252', '#303030'
    ]);
  });

  it('should offer only brand colors for the action color (custom stays as the exception)', () => {
    expect(component.accentPresets.map((preset) => preset.color)).toEqual(['#7DB728', '#1FACE3', '#001631']);
  });

  it('should offer only the 4 selectable text-size boxes (no slider) and no font/radius options', () => {
    expect(component.sizePresets.map((size) => size.value)).toEqual([14, 16, 18, 20]);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="range"]')).toBeNull();
    expect(el.querySelectorAll('.size-pill').length).toBe(4);
    expect(el.querySelectorAll('.radius-row').length).toBe(1);
    expect((component as unknown as Record<string, unknown>)['fontOptions']).toBeUndefined();
  });

  it('should show a compact preview of the three states, closed by default, that opens a detail modal', () => {
    const el = fixture.nativeElement as HTMLElement;
    const chips = el.querySelectorAll('.state-chip');
    expect(chips.length).toBe(3);
    expect(chips[0].classList.contains('ok')).toBeTrue();
    expect(chips[1].classList.contains('error')).toBeTrue();
    expect(chips[2].classList.contains('warn')).toBeTrue();
    expect(el.querySelector('.states-modal')).toBeNull();

    component.openStatesModal();
    fixture.detectChanges();

    const modalEl = fixture.nativeElement as HTMLElement;
    expect(modalEl.querySelector('.states-modal')).not.toBeNull();
    const rows = modalEl.querySelectorAll('.state-detail-row');
    expect(rows.length).toBe(3);
    expect(rows[0].classList.contains('ok')).toBeTrue();
    expect(rows[1].classList.contains('error')).toBeTrue();
    expect(rows[2].classList.contains('warn')).toBeTrue();
    expect(modalEl.querySelectorAll('.state-detail-meta-item').length).toBe(6);

    component.closeStatesModal();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.states-modal')).toBeNull();
  });

  it('should keep Work Sans and the Soft radius fixed on the document regardless of settings', () => {
    component.setFontSize(20);
    fixture.detectChanges();

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--app-font-family')).toContain('Work Sans');
    expect(style.getPropertyValue('--border-radius')).toBe('16px');
    expect(style.getPropertyValue('--type-scale')).toBe('1.25');
  });

  it('should have no eyedropper/custom-picker controls left — the search is the only way in', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.custom-color-chip')).toBeNull();
    expect(el.querySelector('.custom-color-picker')).toBeNull();
    expect(el.querySelector('input[type="color"]')).toBeNull();
  });

  it('should always render the full fixed palette, never filtered by the search query', () => {
    const el = fixture.nativeElement as HTMLElement;
    const primaryChipsBefore = el.querySelectorAll('.setting-group')[0].querySelectorAll('.color-chip').length;
    const accentChipsBefore = el.querySelectorAll('.setting-group')[1].querySelectorAll('.color-chip').length;

    component.onColorQueryChange('coral');
    fixture.detectChanges();

    const primaryChipsAfter = el.querySelectorAll('.setting-group')[0].querySelectorAll('.color-chip').length;
    const accentChipsAfter = el.querySelectorAll('.setting-group')[1].querySelectorAll('.color-chip').length;
    expect(primaryChipsAfter).toBe(primaryChipsBefore);
    expect(accentChipsAfter).toBe(accentChipsBefore);
    expect(primaryChipsBefore).toBe(component.primaryPresets.length);
    expect(accentChipsBefore).toBe(component.accentPresets.length);
  });

  it('should not filter results on every keystroke — only after the debounce pause', fakeAsync(() => {
    component.onColorQueryChange('c');
    component.onColorQueryChange('co');
    component.onColorQueryChange('cor');
    component.onColorQueryChange('coral');
    // Right after typing, the (debounced) matches must still be empty — no
    // filtering work has happened yet, only the visible input value changed.
    expect(component.globalColorMatches()).toEqual([]);
    expect(component.colorQuery).toBe('coral');

    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);

    const matches = component.globalColorMatches();
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].color.toLowerCase()).toBe('#ff7f50');
  }));

  it('should search the global color catalog by name (in es/en/pt) and apply it without touching the fixed palette', fakeAsync(() => {
    component.onColorQueryChange('coral');
    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);
    const matches = component.globalColorMatches();
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].color.toLowerCase()).toBe('#ff7f50');

    const primaryPresetsBefore = component.primaryPresets.length;
    const accentPresetsBefore = component.accentPresets.length;

    component.applyGlobalColor(matches[0], 'accent');

    expect(component.form.controls.accentColor.value.toLowerCase()).toBe('#ff7f50');
    expect(component.primaryPresets.length).toBe(primaryPresetsBefore);
    expect(component.accentPresets.length).toBe(accentPresetsBefore);
    expect(component.colorQuery).toBe('');
    // La limpieza tras aplicar es inmediata, sin esperar el debounce.
    expect(component.globalColorMatches()).toEqual([]);
  }));

  it('should find the same color by its Portuguese name too', fakeAsync(() => {
    component.onColorQueryChange('roxo');
    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);
    const matches = component.globalColorMatches();
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].color.toLowerCase()).toBe('#800080');
  }));

  it('should let a raw hex code be searched and applied even if it has no name in the catalog', fakeAsync(() => {
    component.onColorQueryChange('#123abc');
    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);
    const matches = component.globalColorMatches();
    expect(matches.length).toBe(1);
    expect(matches[0].color.toLowerCase()).toBe('#123abc');

    component.applyGlobalColor(matches[0], 'primary');
    expect(component.form.controls.primaryColor.value.toLowerCase()).toBe('#123abc');
  }));

  it('should allow a second search and apply right after applying a color, without saving first', fakeAsync(() => {
    component.onColorQueryChange('coral');
    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);
    component.applyGlobalColor(component.globalColorMatches()[0], 'primary');
    expect(component.colorDropdownOpen).toBeFalse();

    component.onColorQueryChange('roxo');
    expect(component.colorDropdownOpen).toBeTrue();
    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);
    const matches = component.globalColorMatches();
    expect(matches[0].color.toLowerCase()).toBe('#800080');

    component.applyGlobalColor(matches[0], 'accent');
    expect(component.form.controls.primaryColor.value.toLowerCase()).toBe('#ff7f50');
    expect(component.form.controls.accentColor.value.toLowerCase()).toBe('#800080');
  }));

  it('should find the same term again when typed quickly right after applying it', fakeAsync(() => {
    component.onColorQueryChange('coral');
    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);
    component.applyGlobalColor(component.globalColorMatches()[0], 'primary');

    // Se vuelve a escribir antes de que termine el debounce del '' de la limpieza.
    tick(50);
    component.onColorQueryChange('coral');
    tick(PAST_COLOR_SEARCH_DEBOUNCE_MS);

    expect(component.globalColorMatches().length).toBeGreaterThan(0);
    expect(component.colorDropdownOpen).toBeTrue();
  }));
});
