export type ThemeOption = 'claro' | 'oscuro';
export type DensityOption = 'compacta' | 'comoda' | 'amplia';
export type LanguageCode = 'es' | 'en' | 'pt';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface SystemLogos {
  principal: string | null;
  login: string | null;
  favicon: string | null;
}

/**
 * Ajustes globales de la plataforma: una sola copia, compartida por todos los
 * usuarios. Los administra `SettingsService` (borrador vs. guardado) y los
 * aplica en vivo `ThemeService`.
 */
export interface SystemConfig {
  theme: ThemeOption;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  density: DensityOption;
  highContrast: boolean;
  readOnly: boolean;
  largeIcons: boolean;
  language: LanguageCode;
  notifications: boolean;
  timezone: string;
  dateFormat: DateFormat;
  logos: SystemLogos;
}

export interface ColorPreset {
  id: string;
  name: string;
  color: string;
}

export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  description: string;
}

export interface SizePreset {
  label: string;
  value: number;
  desc: string;
}

export interface RadiusPreset {
  label: string;
  value: number;
}

export const DEFAULT_SETTINGS: SystemConfig = {
  theme: 'claro',
  primaryColor: '#193b73',
  accentColor: '#49b009',
  fontFamily: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: 15,
  borderRadius: 12,
  density: 'comoda',
  highContrast: false,
  readOnly: false,
  largeIcons: false,
  language: 'es',
  notifications: true,
  timezone: 'America/Bogota',
  dateFormat: 'DD/MM/YYYY',
  // Assets reales de marca en src/assets/logos/ (servidos gracias al input
  // adicional agregado en angular.json). Hoy están en PNG porque son los
  // archivos disponibles; si se agregan versiones .svg más adelante, basta
  // con cambiar estas 3 rutas.
  logos: {
    principal: '/assets/logos/logo-principal.png',
    login: '/assets/logos/logo-login.png',
    favicon: '/assets/logos/favicon.png'
  }
};

/**
 * Paleta oficial de marca para "Color principal": 4 colores de marca + 5
 * neutrales, exactamente 9 swatches. Cualquier otro color se elige con el
 * chip "Personalizado" (selector nativo), que se marca activo cuando el
 * color guardado no coincide con ninguno de estos 9.
 */
export const PRIMARY_COLOR_PRESETS: ColorPreset[] = [
  { id: 'brand-green', name: 'Verde', color: '#7DB728' },
  { id: 'brand-blue', name: 'Azul', color: '#1FACE3' },
  { id: 'brand-light-gray', name: 'Gris claro', color: '#F1F1F1' },
  { id: 'brand-dark-blue', name: 'Azul oscuro', color: '#002237' },
  { id: 'neutral-50', name: 'Neutral 50', color: '#F1F1F1' },
  { id: 'neutral-100', name: 'Neutral 100', color: '#D4D4D4' },
  { id: 'neutral-400', name: 'Neutral 400', color: '#8F8F8F' },
  { id: 'neutral-700', name: 'Neutral 700', color: '#525252' },
  { id: 'neutral-900', name: 'Neutral 900', color: '#303030' }
];

export const ACCENT_COLOR_PRESETS: ColorPreset[] = [
  { id: 'acc-green', name: 'Verde Éxito', color: '#49b009' },
  { id: 'acc-blue', name: 'Azul Real', color: '#2563eb' },
  { id: 'acc-orange', name: 'Naranja Vivo', color: '#ea580c' },
  { id: 'acc-purple', name: 'Púrpura Vibrante', color: '#7c3aed' },
  { id: 'acc-teal', name: 'Turquesa', color: '#0d9488' },
  { id: 'acc-rose', name: 'Rosa Intenso', color: '#e11d48' }
];

export const FONT_OPTIONS: FontOption[] = [
  { id: 'work-sans', name: 'Work Sans', fontFamily: "'Work Sans', sans-serif", description: 'Tipografía oficial del sistema, moderna y limpia.' },
  { id: 'inter', name: 'Inter', fontFamily: "'Inter', sans-serif", description: 'Optimizada para pantallas e interfaces de usuario.' },
  { id: 'roboto', name: 'Roboto', fontFamily: "'Roboto', sans-serif", description: 'Estilo clásico, claro y de máxima legibilidad.' },
  { id: 'poppins', name: 'Poppins', fontFamily: "'Poppins', sans-serif", description: 'Geométrica, elegante y con personalidad.' },
  { id: 'open-sans', name: 'Open Sans', fontFamily: "'Open Sans', sans-serif", description: 'Amigable, equilibrada y muy accesible.' },
  { id: 'system', name: 'Sistema (Segoe UI / San Francisco)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", description: 'Fuente nativa del sistema operativo del usuario.' }
];

export const SIZE_PRESETS: SizePreset[] = [
  { label: 'Pequeño', value: 13, desc: '85% - Mayor densidad' },
  { label: 'Normal', value: 15, desc: '100% - Recomendado' },
  { label: 'Grande', value: 17, desc: '115% - Más legible' },
  { label: 'Muy Grande', value: 19, desc: '130% - Accesibilidad visual' }
];

export const RADIUS_PRESETS: RadiusPreset[] = [
  { label: 'Recto', value: 4 },
  { label: 'Suave', value: 8 },
  { label: 'Redondeado', value: 12 },
  { label: 'Píldora', value: 20 }
];

export const THEME_OPTIONS: { id: ThemeOption; label: string }[] = [
  { id: 'claro', label: 'Claro' },
  { id: 'oscuro', label: 'Oscuro' }
];

export const DENSITY_OPTIONS: { id: DensityOption; label: string }[] = [
  { id: 'compacta', label: 'Compacta' },
  { id: 'comoda', label: 'Cómoda' },
  { id: 'amplia', label: 'Espaciosa' }
];

export const LANGUAGE_OPTIONS: { id: LanguageCode; flag: string; name: string; native: string }[] = [
  { id: 'es', flag: 'ES', name: 'Español', native: 'Español' },
  { id: 'en', flag: 'EN', name: 'English', native: 'English' },
  { id: 'pt', flag: 'PT', name: 'Português', native: 'Português' }
];

export const TIMEZONE_OPTIONS: string[] = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Lima',
  'America/Santiago',
  'America/New_York',
  'Europe/Madrid'
];

export const DATE_FORMAT_OPTIONS: DateFormat[] = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

export function cloneSettings(config: SystemConfig): SystemConfig {
  return { ...config, logos: { ...config.logos } };
}
