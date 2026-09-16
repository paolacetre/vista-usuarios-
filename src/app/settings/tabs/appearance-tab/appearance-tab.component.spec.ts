import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppearanceTabComponent } from './appearance-tab.component';

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

  it('should expose exactly the 9-swatch official brand palette for "Color principal"', () => {
    expect(component.primaryPresets.length).toBe(9);
    expect(component.primaryPresets.map((preset) => preset.color)).toEqual([
      '#7DB728', '#1FACE3', '#F1F1F1', '#002237', '#F1F1F1', '#D4D4D4', '#8F8F8F', '#525252', '#303030'
    ]);
  });

  it('should mark "Personalizado" as active only when the current color is not one of the 9 brand swatches', () => {
    component.setPrimaryColor('#7DB728');
    expect(component.isCustomPrimaryColor()).toBeFalse();

    component.setPrimaryColor('#123456');
    expect(component.isCustomPrimaryColor()).toBeTrue();
  });

  it('should toggle the custom color picker panel independently of whether the color is already custom', () => {
    expect(component.showCustomPrimaryPicker).toBeFalse();

    component.toggleCustomPrimaryPicker();
    expect(component.showCustomPrimaryPicker).toBeTrue();

    component.toggleCustomPrimaryPicker();
    expect(component.showCustomPrimaryPicker).toBeFalse();
  });
});
