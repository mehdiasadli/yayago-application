import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toggleMileageUnit(value: number, unit: 'KM' | 'MI') {
  if (unit === 'KM') {
    return value * 1.60934;
  }

  return value / 1.60934;
}

export function formatEnumValue(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function makeEnumLabel<T extends string>(value: T) {
  return {
    value,
    label: formatEnumValue(value),
  };
}

export function makeEnumLabels<T extends readonly string[]>(values: T) {
  return values.map(makeEnumLabel) as { value: T[number]; label: string }[];
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
