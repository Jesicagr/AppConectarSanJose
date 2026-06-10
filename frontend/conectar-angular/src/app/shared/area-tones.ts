export const WEBP_MAP: Record<string, string> = {
  'Mujeres Género y Diversidad': 'assets/mujer.webp',
  'Mujer': 'assets/mujer.webp',
  'Niñez, Adolescencia y Familia': 'assets/ninez.webp',
  'Niñez': 'assets/ninez.webp',
  'Personas Mayores': 'assets/mayores.webp',
  'Desarrollo Comunitario': 'assets/comunidad.webp',
  'Discapacidad': 'assets/discapacidad.webp',
  'Salud': 'assets/salud.webp',
  'Salud Social y Comunitaria': 'assets/salud.webp',
  'Trabajo y Producción': 'assets/trabajo.webp',
  'Trabajo': 'assets/trabajo.webp',
  'Deportes y Recreación': 'assets/deportes.webp',
  'Deportes': 'assets/deportes.webp',
  'Turismo': 'assets/turismo.webp',
  'Cultura': 'assets/cultura.webp',
  'Educación': 'assets/educacion.webp',
};

export const AREA_TONE_MAP: Record<string, string> = {
  'Mujeres Género y Diversidad': 'tone-rose',
  'Niñez': 'tone-amber',
  'Personas Mayores': 'tone-purple',
  'Desarrollo Comunitario': 'tone-teal',
  'Discapacidad': 'tone-blue',
  'Salud': 'tone-emerald',
  'Trabajo': 'tone-indigo',
  'Deportes': 'tone-orange',
  'Turismo': 'tone-cyan',
  'Cultura': 'tone-red',
  'Educación': 'tone-pink',
};

export function getAreaTone(areaName: string): string {
  return AREA_TONE_MAP[areaName] || 'tone-gray';
}

export const AREA_ORDER = [
  'Mujeres Género y Diversidad',
  'Niñez',
  'Niñez, Adolescencia y Familia',
  'Personas Mayores',
  'Desarrollo Comunitario',
  'Discapacidad',
  'Salud',
  'Salud Social y Comunitaria',
  'Trabajo',
  'Trabajo y Producción',
  'Deportes',
  'Deportes y Recreación',
  'Turismo',
  'Cultura',
  'Educación',
];
