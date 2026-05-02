import { LocalStorage } from '@utils/local-storage'

type AppLocalStorageSchema = {
  /** Виджеты. */
  widgets: {
    /** Виджет статистики игрока. */
    statistics: {
      /** Ник FACEIT. */
      nickname: string;
      /** Прозрачность фона карточки (0–100). */
      backgroundOpacity: number;
      /** Скругление углов виджета в px (0-18). */
      borderRadius: number;
      /** Режим лидерборда в ссылке виджета: страна (по умолчанию), регион или оба. */
      ratingMode: 'country' | 'region' | 'both';
    };
    /** Виджет оверлея. */
    overlay: {
      /** Ник FACEIT. */
      nickname: string;
    };
  };
}

let storageLocal: LocalStorage<AppLocalStorageSchema> | null = null

export function StorageLocal(): LocalStorage<AppLocalStorageSchema> {
  if (storageLocal) {
    return storageLocal
  }

  storageLocal = new LocalStorage<AppLocalStorageSchema>('faceit-stats')
  return storageLocal
}
