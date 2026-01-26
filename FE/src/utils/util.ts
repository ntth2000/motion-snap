import { format, formatDistanceToNow } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

import { STAGE, STATUS } from '../constants';

export function formatDate(dateInput: string | number | Date, language: string = 'enUS'): string {
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

export function formatRelativeTime(date: string | Date, language: string = 'enUS') {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: language === 'vi' ? vi : enUS,
  });
}


export function displayStatus(status: string, stage: string) {
  if (status === STATUS.COMPLETED) {
    if (stage === STAGE.DRAWING_3D) {
      return "drawn 3D"
    } else if (stage === STAGE.EXTRACTING_POSES) {
      return "extracted poses"
    } else {
      return "new"
    }
  } else if (status === STATUS.PROCESSING) {
    if (stage === STAGE.UPLOADING) {
      return "uploading"
    } else if (stage === STAGE.EXTRACTING_POSES) {
      return "extracting poses"
    } else if (stage === STAGE.DRAWING_3D) {
      return "drawing 3D"
    } else {
      return "processing"
    }
  } else if (status === STATUS.FAILED) {
    return "failed"
  } else if (status === STATUS.PENDING) {
    return "pending"
  } else {
    return "new"
  }
}