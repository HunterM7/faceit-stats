type StorageSchema = Record<string, unknown>

type Path<T> = T extends Record<string, unknown>
  ? {
    [K in keyof T & string]:
    T[K] extends Record<string, unknown>
      ? `${K}` | `${K}.${Path<T[K]>}`
      : `${K}`;
  }[keyof T & string]
  : never

type PathValue<T, TPath extends string> = TPath extends `${infer TKey}.${infer TRest}`
  ? TKey extends keyof T
    ? PathValue<T[TKey], TRest>
    : never
  : TPath extends keyof T
    ? T[TPath]
    : never

type StoragePath<TValue> = {
  set: (value: TValue) => void;
  get: (defaultValue: TValue) => TValue;
  delete: () => void;
}

export class LocalStorage<TSchema extends StorageSchema> {
  private readonly storage: Storage | null
  private readonly storageKey: string

  constructor(storageKey: string) {
    this.storageKey = storageKey
    this.storage = typeof window === 'undefined' ? null : window.localStorage
  }

  set<TKey extends keyof TSchema>(key: TKey, value: TSchema[TKey]): void {
    if (!this.storage) {
      return
    }
    this.path(String(key) as Path<TSchema>).set(value as PathValue<TSchema, Path<TSchema>>)
  }

  get<TKey extends keyof TSchema>(key: TKey, defaultValue: TSchema[TKey]): TSchema[TKey] {
    return this.path(String(key) as Path<TSchema>).get(defaultValue as PathValue<TSchema, Path<TSchema>>) as TSchema[TKey]
  }

  delete<TKey extends keyof TSchema>(key: TKey): void {
    this.path(String(key) as Path<TSchema>).delete()
  }

  path<TPath extends Path<TSchema>>(path: TPath): StoragePath<PathValue<TSchema, TPath>> {
    return {
      set: (value) => this.setByPath(path, value),
      get: (defaultValue) => this.getByPath(path, defaultValue),
      delete: () => this.deleteByPath(path),
    }
  }

  private getByPath<TPath extends Path<TSchema>>(
    path: TPath,
    defaultValue: PathValue<TSchema, TPath>,
  ): PathValue<TSchema, TPath> {
    const bucket = this.readBucket()
    const pathParts = String(path).split('.')
    let currentValue: unknown = bucket

    for (const part of pathParts) {
      if (!currentValue || typeof currentValue !== 'object' || Array.isArray(currentValue)) {
        return defaultValue
      }
      currentValue = (currentValue as Record<string, unknown>)[part]
      if (currentValue === undefined) {
        return defaultValue
      }
    }

    return currentValue as PathValue<TSchema, TPath>
  }

  private setByPath<TPath extends Path<TSchema>>(path: TPath, value: PathValue<TSchema, TPath>): void {
    if (!this.storage) {
      return
    }

    const bucket = this.readBucket()
    const pathParts = String(path).split('.')
    const leafKey = pathParts[pathParts.length - 1]

    let currentNode: Record<string, unknown> = bucket
    for (let index = 0; index < pathParts.length - 1; index += 1) {
      const part = pathParts[index]
      const nextValue = currentNode[part]
      if (!nextValue || typeof nextValue !== 'object' || Array.isArray(nextValue)) {
        currentNode[part] = {}
      }
      currentNode = currentNode[part] as Record<string, unknown>
    }

    currentNode[leafKey] = value
    this.writeBucket(bucket)
  }

  private deleteByPath<TPath extends Path<TSchema>>(path: TPath): void {
    if (!this.storage) {
      return
    }

    const bucket = this.readBucket()
    const pathParts = String(path).split('.')
    const nodes: Record<string, unknown>[] = [ bucket ]

    let currentNode: Record<string, unknown> = bucket
    for (let index = 0; index < pathParts.length - 1; index += 1) {
      const part = pathParts[index]
      const nextValue = currentNode[part]
      if (!nextValue || typeof nextValue !== 'object' || Array.isArray(nextValue)) {
        return
      }
      currentNode = nextValue as Record<string, unknown>
      nodes.push(currentNode)
    }

    const leafKey = pathParts[pathParts.length - 1]
    delete currentNode[leafKey]

    for (let index = nodes.length - 1; index > 0; index -= 1) {
      const node = nodes[index]
      if (Object.keys(node).length > 0) {
        break
      }
      const parentNode = nodes[index - 1]
      const parentKey = pathParts[index - 1]
      delete parentNode[parentKey]
    }

    this.writeBucket(bucket)
  }

  private readBucket(): Record<string, unknown> {
    if (!this.storage) {
      return {}
    }

    const rawValue = this.storage.getItem(this.storageKey)
    if (!rawValue) {
      return {}
    }

    try {
      const parsed = JSON.parse(rawValue)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      // Keep default empty object when stored value is invalid.
    }

    return {}
  }

  private writeBucket(bucket: Record<string, unknown>): void {
    if (!this.storage) {
      return
    }
    this.storage.setItem(this.storageKey, JSON.stringify(bucket))
  }
}
