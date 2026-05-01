import { LocalStorage } from '@utils/local-storage'

type AppLocalStorageSchema = {
  /** Виджеты. */
  widgets: {
    /** Виджет статистики игрока. */
    statistics: {
      /** Ник FACEIT. */
      nickname: string;
      /** Прозрачность фона карточки (1-100). */
      backgroundOpacity: string;
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
