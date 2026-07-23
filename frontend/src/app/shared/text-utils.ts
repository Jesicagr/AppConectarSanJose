export function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function soloNumeros(value: string): string {
  return value.replace(/\D/g, '');
}
