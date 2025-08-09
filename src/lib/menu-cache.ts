import fs from 'fs/promises'
import path from 'path'

interface MenuCacheData {
  products: any[]
  categories: any[]
  combos: any[]
  lastUpdated: string
  version: string
}

const CACHE_FILE_PATH = path.join(process.cwd(), 'menu-cache.json')
const CACHE_VERSION = '1.1'

export class MenuCache {
  private static instance: MenuCache
  private cache: MenuCacheData | null = null

  private constructor() {}

  static getInstance(): MenuCache {
    if (!MenuCache.instance) {
      MenuCache.instance = new MenuCache()
    }
    return MenuCache.instance
  }

  async load(): Promise<MenuCacheData | null> {
    try {
      const data = await fs.readFile(CACHE_FILE_PATH, 'utf-8')
      const cache = JSON.parse(data)
      
      // Check if cache is valid
      if (cache.version !== CACHE_VERSION) {
        return null
      }
      
      this.cache = cache
      return cache
    } catch (error) {
      // File doesn't exist or is invalid
      return null
    }
  }

  async save(products: any[], categories: any[], combos: any[] = []): Promise<void> {
    const cache: MenuCacheData = {
      products,
      categories,
      combos,
      lastUpdated: new Date().toISOString(),
      version: CACHE_VERSION
    }

    try {
      await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2))
      this.cache = cache
    } catch (error) {
      console.error('Error saving menu cache:', error)
    }
  }

  async invalidate(): Promise<void> {
    try {
      await fs.unlink(CACHE_FILE_PATH)
      this.cache = null
    } catch (error) {
      // File doesn't exist
      console.error('Error invalidating menu cache:', error)
    }
  }

  getCache(): MenuCacheData | null {
    return this.cache
  }

  isCacheValid(): boolean {
    if (!this.cache) return false
    
    // Check if cache is older than 5 minutes
    const cacheTime = new Date(this.cache.lastUpdated).getTime()
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    return (now - cacheTime) < fiveMinutes
  }
}

export default MenuCache