import { ResourceTypes } from '@/enums/ResourceTypes';

export function getResourceIcon(type) {
  switch (type) {
    case ResourceTypes.BOOK:
      return '📘';
    case ResourceTypes.VIDEO:
      return '🎥';
    case ResourceTypes.WEBSITE:
      return '🌐';
    default:
      return '📎';
  }
}
