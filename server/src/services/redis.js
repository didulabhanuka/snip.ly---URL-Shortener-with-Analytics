const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    // Stop retrying after 3 attempts — don't spam logs
    if (times > 3) return null
    return Math.min(times * 200, 1000)
  },
  reconnectOnError() {
    return false
  },
})

let redisAvailable = false

redis.on('connect', () => {
  redisAvailable = true
  console.log('[Redis] connected')
})

redis.on('error', (err) => {
  if (redisAvailable) {
    console.error('[Redis] connection error:', err.message)
  } else {
    // Only log once on first failure, not on every retry
    redisAvailable = false
  }
})

redis.on('close', () => {
  if (redisAvailable) {
    console.warn('[Redis] unavailable — running without cache')
    redisAvailable = false
  }
})

const SLUG_TTL = 60 * 60 * 24 // 24 hours

async function cacheSlug(slug, originalUrl) {
  if (!redisAvailable) return
  try {
    await redis.set(`slug:${slug}`, originalUrl, 'EX', SLUG_TTL)
  } catch {
    // Silently skip cache on failure
  }
}

async function getCachedSlug(slug) {
  if (!redisAvailable) return null
  try {
    return await redis.get(`slug:${slug}`)
  } catch {
    return null
  }
}

async function deleteCachedSlug(slug) {
  if (!redisAvailable) return
  try {
    await redis.del(`slug:${slug}`)
  } catch {
    // Silently skip
  }
}

module.exports = { redis, cacheSlug, getCachedSlug, deleteCachedSlug }