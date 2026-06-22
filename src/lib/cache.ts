interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheItem<any>>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt < now) {
      cache.delete(key);
    }
  }
}, 60000);

export async function cacheGet<T>(key: string): Promise<T | null> {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

export async function cacheSet<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

export async function cacheInvalidate(keyOrPattern: string): Promise<void> {
  if (keyOrPattern.includes("*")) {
    const pattern = keyOrPattern.replace("*", "");
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.delete(keyOrPattern);
  }
}

export async function cacheClear(): Promise<void> {
  cache.clear();
}
