// lib/indexedDB.ts
// Client-side cache for instant loading

const DB_NAME = 'VibeRoomCache'
const DB_VERSION = 1
const VIDEO_STORE = 'videos'
const SEARCH_STORE = 'searches'

export interface CachedVideo {
  videoId: string
  title: string
  thumbnail: string
  channelTitle: string
  category: string
  cachedAt: number
  expiresAt: number
}

class IndexedDBCache {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(VIDEO_STORE)) {
          const videoStore = db.createObjectStore(VIDEO_STORE, { keyPath: 'videoId' })
          videoStore.createIndex('category', 'category', { unique: false })
          videoStore.createIndex('expiresAt', 'expiresAt', { unique: false })
        }
        
        if (!db.objectStoreNames.contains(SEARCH_STORE)) {
          const searchStore = db.createObjectStore(SEARCH_STORE, { keyPath: 'query' })
          searchStore.createIndex('expiresAt', 'expiresAt', { unique: false })
        }
      }
    })
  }

  async getVideos(category: string): Promise<CachedVideo[] | null> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEO_STORE], 'readonly')
      const store = transaction.objectStore(VIDEO_STORE)
      const index = store.index('category')
      const request = index.getAll(category)
      
      request.onsuccess = () => {
        const videos = request.result as CachedVideo[]
        const now = Date.now()
        const validVideos = videos.filter(v => v.expiresAt > now)
        resolve(validVideos.length > 0 ? validVideos : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveVideos(category: string, videos: any[]): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([VIDEO_STORE], 'readwrite')
    const store = transaction.objectStore(VIDEO_STORE)
    const now = Date.now()
    const expiresAt = now + 5 * 60 * 60 * 1000 // 5 hours
    
    videos.forEach(video => {
      store.put({
        ...video,
        category,
        cachedAt: now,
        expiresAt,
      })
    })
  }

  async getSearch(query: string): Promise<any[] | null> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SEARCH_STORE], 'readonly')
      const store = transaction.objectStore(SEARCH_STORE)
      const request = store.get(query.toLowerCase())
      
      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiresAt > Date.now()) {
          resolve(result.results)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveSearch(query: string, results: any[]): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([SEARCH_STORE], 'readwrite')
    const store = transaction.objectStore(SEARCH_STORE)
    
    store.put({
      query: query.toLowerCase(),
      results,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    })
  }
}

export const indexedDBCache = new IndexedDBCache()