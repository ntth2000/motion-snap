import { format,formatDistanceToNow } from 'date-fns';
import { enUS,vi } from 'date-fns/locale';

export function formatDate(dateInput: string | number | Date, language: string = 'vi'): string {
  if (language === 'vi') return format(new Date(dateInput), "d 'tháng' M, yyyy", { locale: vi });
  return format(new Date(dateInput), "d MMM yyyy", { locale: enUS });
}

export function getFirstChar(name: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
}

export function generateRandomHexColor() {
  const randomNum = Math.floor(Math.random() * 16777215);
  const hexCode = randomNum.toString(16);
  const fullHexCode = `#${hexCode.padStart(6, '0')}`;
  return fullHexCode.toUpperCase();
}

export function formatRelativeTime(date: string | Date, language: string = 'vi') {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: language === 'vi' ? vi : enUS,
  });
}
