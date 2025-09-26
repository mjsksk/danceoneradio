interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface StreamMetadata {
  title?: string;
  artist?: string;
  song?: string;
  listeners?: string;
  bitrate?: string;
  status?: string;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 10000; // 10 seconds default

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  isStale(key: string, maxAge: number = this.defaultTTL): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp > maxAge;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Specific methods for stream metadata
  setStreamMetadata(data: StreamMetadata, ttl: number = 10000): void {
    this.set('stream-metadata', data, ttl);
  }

  getStreamMetadata(): StreamMetadata | null {
    return this.get<StreamMetadata>('stream-metadata');
  }

  isStreamMetadataStale(maxAge: number = 10000): boolean {
    return this.isStale('stream-metadata', maxAge);
  }
}

export const cacheService = new CacheService();