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
  /** Escala de texto: 14 / 16 / 18 / 20 px de párrafo (16 = tamaño de Figma, 100%). */
  fontSize: number;
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

export interface GlobalColorEntry {
  id: string;
  nameEs: string;
  nameEn: string;
  namePt: string;
  color: string;
}

export interface SizePreset {
  label: string;
  value: number;
  desc: string;
}

export const DEFAULT_SETTINGS: SystemConfig = {
  theme: 'claro',
  primaryColor: '#001631',
  accentColor: '#7DB728',
  fontSize: 16,
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
  // El principal es solo el símbolo (sin "Observatorio Laboral y
  // Ocupacional"): en el menú lateral va al lado del nombre de la plataforma.
  logos: {
    principal: '/assets/logos/logo-simbolo.png',
    login: '/assets/logos/logo-login.png',
    favicon: '/assets/logos/favicon.png'
  }
};

/**
 * Sistema visual (Figma "Ecosistema visual nivel fábrica").
 * Tipografía: solo Work Sans. Radio: solo "Suave" (16px, el de los botones en
 * Figma). Ninguno es configurable: son constantes del sistema.
 */
export const APP_FONT_FAMILY = "'Work Sans', sans-serif";
export const SOFT_BORDER_RADIUS = 16;

/**
 * Brand Colors de Figma: 3 de marca + escala Neutral (neutral-50 es el mismo
 * #F1F1F1 de "Background body"). Cualquier otro color solo se elige con el
 * chip "Personalizado" (selector nativo), que se marca activo cuando el color
 * guardado no coincide con ninguno de estos.
 */
export const PRIMARY_COLOR_PRESETS: ColorPreset[] = [
  { id: 'brand-green', name: 'Verde', color: '#7DB728' },
  { id: 'brand-blue', name: 'Azul', color: '#1FACE3' },
  { id: 'brand-dark-blue', name: 'Azul oscuro', color: '#001631' },
  { id: 'neutral-50', name: 'Neutral 50', color: '#F1F1F1' },
  { id: 'neutral-100', name: 'Neutral 100', color: '#D4D4D4' },
  { id: 'neutral-400', name: 'Neutral 400', color: '#8F8F8F' },
  { id: 'neutral-700', name: 'Neutral 700', color: '#525252' },
  { id: 'neutral-900', name: 'Neutral 900', color: '#303030' }
];

/** Color de acción (botones): solo colores de marca. */
export const ACCENT_COLOR_PRESETS: ColorPreset[] = [
  { id: 'brand-green', name: 'Verde', color: '#7DB728' },
  { id: 'brand-blue', name: 'Azul', color: '#1FACE3' },
  { id: 'brand-dark-blue', name: 'Azul oscuro', color: '#001631' }
];

/**
 * Catálogo global de colores (nombre en español/inglés/portugués -> hex),
 * independiente de los swatches de marca. El buscador de "Color" lo usa para
 * que el usuario encuentre y aplique CUALQUIER color por nombre en
 * cualquiera de los 3 idiomas de la app (p. ej. "Azul marino"/"Navy"/"Azul-
 * marinho"), no solo los 8/3 swatches predefinidos — igual que ya permitía
 * el selector "Personalizado", pero encontrable por nombre en vez de tener
 * que abrir el selector nativo del sistema operativo.
 * Vive 100% en memoria (ningún fetch/red): es un array estático que se
 * recorre por filtro de texto, ~70 elementos — trivial para el hilo
 * principal incluso sin ninguna otra optimización.
 */
export const GLOBAL_COLOR_CATALOG: GlobalColorEntry[] = [
  { id: 'red', nameEs: 'Rojo', nameEn: 'Red', namePt: 'Vermelho', color: '#FF0000' },
  { id: 'crimson', nameEs: 'Carmesí', nameEn: 'Crimson', namePt: 'Carmesim', color: '#DC143C' },
  { id: 'firebrick', nameEs: 'Ladrillo', nameEn: 'Firebrick', namePt: 'Tijolo', color: '#B22222' },
  { id: 'maroon', nameEs: 'Granate', nameEn: 'Maroon', namePt: 'Grená', color: '#800000' },
  { id: 'burgundy', nameEs: 'Borgoña', nameEn: 'Burgundy', namePt: 'Borgonha', color: '#800020' },
  { id: 'tomato', nameEs: 'Tomate', nameEn: 'Tomato', namePt: 'Tomate', color: '#FF6347' },
  { id: 'coral', nameEs: 'Coral', nameEn: 'Coral', namePt: 'Coral', color: '#FF7F50' },
  { id: 'salmon', nameEs: 'Salmón', nameEn: 'Salmon', namePt: 'Salmão', color: '#FA8072' },
  { id: 'terracotta', nameEs: 'Terracota', nameEn: 'Terracotta', namePt: 'Terracota', color: '#E2725B' },
  { id: 'rust', nameEs: 'Óxido', nameEn: 'Rust', namePt: 'Ferrugem', color: '#B7410E' },
  { id: 'pink', nameEs: 'Rosado', nameEn: 'Pink', namePt: 'Rosa', color: '#FFC0CB' },
  { id: 'pastel-pink', nameEs: 'Rosa pastel', nameEn: 'Pastel Pink', namePt: 'Rosa pastel', color: '#FFD1DC' },
  { id: 'hot-pink', nameEs: 'Rosa fuerte', nameEn: 'Hot Pink', namePt: 'Rosa choque', color: '#FF69B4' },
  { id: 'magenta', nameEs: 'Fucsia', nameEn: 'Magenta', namePt: 'Magenta', color: '#FF00FF' },
  { id: 'ruby', nameEs: 'Rubí', nameEn: 'Ruby', namePt: 'Rubi', color: '#E0115F' },
  { id: 'orange', nameEs: 'Naranja', nameEn: 'Orange', namePt: 'Laranja', color: '#FFA500' },
  { id: 'dark-orange', nameEs: 'Naranja oscuro', nameEn: 'Dark Orange', namePt: 'Laranja escuro', color: '#FF8C00' },
  { id: 'amber', nameEs: 'Ámbar', nameEn: 'Amber', namePt: 'Âmbar', color: '#FFBF00' },
  { id: 'gold', nameEs: 'Dorado', nameEn: 'Gold', namePt: 'Dourado', color: '#FFD700' },
  { id: 'yellow', nameEs: 'Amarillo', nameEn: 'Yellow', namePt: 'Amarelo', color: '#FFFF00' },
  { id: 'mustard', nameEs: 'Mostaza', nameEn: 'Mustard', namePt: 'Mostarda', color: '#FFDB58' },
  { id: 'khaki', nameEs: 'Caqui', nameEn: 'Khaki', namePt: 'Cáqui', color: '#F0E68C' },
  { id: 'olive', nameEs: 'Verde oliva', nameEn: 'Olive', namePt: 'Verde-oliva', color: '#808000' },
  { id: 'lime', nameEs: 'Verde lima', nameEn: 'Lime', namePt: 'Verde-limão', color: '#00FF00' },
  { id: 'green', nameEs: 'Verde', nameEn: 'Green', namePt: 'Verde', color: '#008000' },
  { id: 'dark-green', nameEs: 'Verde oscuro', nameEn: 'Dark Green', namePt: 'Verde escuro', color: '#006400' },
  { id: 'forest-green', nameEs: 'Verde bosque', nameEn: 'Forest Green', namePt: 'Verde floresta', color: '#228B22' },
  { id: 'emerald', nameEs: 'Esmeralda', nameEn: 'Emerald', namePt: 'Esmeralda', color: '#50C878' },
  { id: 'jade', nameEs: 'Jade', nameEn: 'Jade', namePt: 'Jade', color: '#00A86B' },
  { id: 'mint', nameEs: 'Menta', nameEn: 'Mint', namePt: 'Menta', color: '#3EB489' },
  { id: 'sage', nameEs: 'Salvia', nameEn: 'Sage', namePt: 'Sálvia', color: '#9CAF88' },
  { id: 'teal', nameEs: 'Verde azulado', nameEn: 'Teal', namePt: 'Verde-azulado', color: '#008080' },
  { id: 'cyan', nameEs: 'Cian', nameEn: 'Cyan', namePt: 'Ciano', color: '#00FFFF' },
  { id: 'turquoise', nameEs: 'Turquesa', nameEn: 'Turquoise', namePt: 'Turquesa', color: '#40E0D0' },
  { id: 'aquamarine', nameEs: 'Aguamarina', nameEn: 'Aquamarine', namePt: 'Água-marinha', color: '#7FFFD4' },
  { id: 'sky-blue', nameEs: 'Azul cielo', nameEn: 'Sky Blue', namePt: 'Azul-celeste', color: '#87CEEB' },
  { id: 'steel-blue', nameEs: 'Azul acero', nameEn: 'Steel Blue', namePt: 'Azul aço', color: '#4682B4' },
  { id: 'royal-blue', nameEs: 'Azul rey', nameEn: 'Royal Blue', namePt: 'Azul royal', color: '#4169E1' },
  { id: 'blue', nameEs: 'Azul', nameEn: 'Blue', namePt: 'Azul', color: '#0000FF' },
  { id: 'navy', nameEs: 'Azul marino', nameEn: 'Navy', namePt: 'Azul-marinho', color: '#000080' },
  { id: 'sapphire', nameEs: 'Zafiro', nameEn: 'Sapphire', namePt: 'Safira', color: '#0F52BA' },
  { id: 'indigo', nameEs: 'Índigo', nameEn: 'Indigo', namePt: 'Índigo', color: '#4B0082' },
  { id: 'blue-violet', nameEs: 'Violeta azulado', nameEn: 'Blue Violet', namePt: 'Violeta-azulado', color: '#8A2BE2' },
  { id: 'violet', nameEs: 'Violeta', nameEn: 'Violet', namePt: 'Violeta', color: '#EE82EE' },
  { id: 'purple', nameEs: 'Morado', nameEn: 'Purple', namePt: 'Roxo', color: '#800080' },
  { id: 'lavender', nameEs: 'Lavanda', nameEn: 'Lavender', namePt: 'Lavanda', color: '#E6E6FA' },
  { id: 'lilac', nameEs: 'Lila', nameEn: 'Lilac', namePt: 'Lilás', color: '#C8A2C8' },
  { id: 'orchid', nameEs: 'Orquídea', nameEn: 'Orchid', namePt: 'Orquídea', color: '#DA70D6' },
  { id: 'plum', nameEs: 'Ciruela', nameEn: 'Plum', namePt: 'Ameixa', color: '#DDA0DD' },
  { id: 'mauve', nameEs: 'Malva', nameEn: 'Mauve', namePt: 'Malva', color: '#E0B0FF' },
  { id: 'brown', nameEs: 'Marrón', nameEn: 'Brown', namePt: 'Marrom', color: '#A52A2A' },
  { id: 'chocolate', nameEs: 'Chocolate', nameEn: 'Chocolate', namePt: 'Chocolate', color: '#D2691E' },
  { id: 'coffee', nameEs: 'Café', nameEn: 'Coffee', namePt: 'Café', color: '#6F4E37' },
  { id: 'cinnamon', nameEs: 'Canela', nameEn: 'Cinnamon', namePt: 'Canela', color: '#C97848' },
  { id: 'bronze', nameEs: 'Bronce', nameEn: 'Bronze', namePt: 'Bronze', color: '#CD7F32' },
  { id: 'copper', nameEs: 'Cobre', nameEn: 'Copper', namePt: 'Cobre', color: '#B87333' },
  { id: 'beige', nameEs: 'Beige', nameEn: 'Beige', namePt: 'Bege', color: '#F5F5DC' },
  { id: 'sand', nameEs: 'Arena', nameEn: 'Sand', namePt: 'Areia', color: '#C2B280' },
  { id: 'peach', nameEs: 'Durazno', nameEn: 'Peach', namePt: 'Pêssego', color: '#FFE5B4' },
  { id: 'cream', nameEs: 'Crema', nameEn: 'Cream', namePt: 'Creme', color: '#FFFDD0' },
  { id: 'ivory', nameEs: 'Marfil', nameEn: 'Ivory', namePt: 'Marfim', color: '#FFFFF0' },
  { id: 'pearl', nameEs: 'Perla', nameEn: 'Pearl', namePt: 'Pérola', color: '#EAE0C8' },
  { id: 'topaz', nameEs: 'Topacio', nameEn: 'Topaz', namePt: 'Topázio', color: '#FFC87C' },
  { id: 'white', nameEs: 'Blanco', nameEn: 'White', namePt: 'Branco', color: '#FFFFFF' },
  { id: 'white-smoke', nameEs: 'Blanco humo', nameEn: 'White Smoke', namePt: 'Branco fumê', color: '#F5F5F5' },
  { id: 'light-gray', nameEs: 'Gris claro', nameEn: 'Light Gray', namePt: 'Cinza claro', color: '#D3D3D3' },
  { id: 'silver', nameEs: 'Plata', nameEn: 'Silver', namePt: 'Prata', color: '#C0C0C0' },
  { id: 'gray', nameEs: 'Gris', nameEn: 'Gray', namePt: 'Cinza', color: '#808080' },
  { id: 'dark-gray', nameEs: 'Gris oscuro', nameEn: 'Dark Gray', namePt: 'Cinza escuro', color: '#A9A9A9' },
  { id: 'charcoal', nameEs: 'Carbón', nameEn: 'Charcoal', namePt: 'Carvão', color: '#36454F' },
  { id: 'onyx', nameEs: 'Ónix', nameEn: 'Onyx', namePt: 'Ônix', color: '#353839' },
  { id: 'black', nameEs: 'Negro', nameEn: 'Black', namePt: 'Preto', color: '#000000' }
];

/** Escala de texto seleccionable: el párrafo base es 16px (100%). */
export const SIZE_PRESETS: SizePreset[] = [
  { label: 'Pequeño', value: 14, desc: '88%' },
  { label: 'Normal', value: 16, desc: '100% - Recomendado' },
  { label: 'Grande', value: 18, desc: '113%' },
  { label: 'Muy Grande', value: 20, desc: '125%' }
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

/**
 * Traducen un valor guardado (tema/tamaño/densidad) a su clave de i18n. Son
 * funciones puras (no dependen de un componente) porque tanto la pestaña
 * Apariencia como el resumen fijo de Configuración (`SettingsComponent`)
 * necesitan formatear el mismo valor de la misma forma.
 */
export function themeLabelKey(id: ThemeOption): string {
  return id === 'oscuro' ? 'appearance.themeOscuro' : 'appearance.themeClaro';
}

export function densityLabelKey(id: DensityOption): string {
  if (id === 'compacta') return 'appearance.densityCompacta';
  if (id === 'amplia') return 'appearance.densityAmplia';
  return 'appearance.densityComoda';
}

export function sizeLabelKey(value: number): string {
  if (value <= 14) return 'appearance.sizePequeno';
  if (value <= 16) return 'appearance.sizeNormal';
  if (value <= 18) return 'appearance.sizeGrande';
  return 'appearance.sizeMuyGrande';
}
