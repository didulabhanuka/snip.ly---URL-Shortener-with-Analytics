const Redis = require('ioredis')

// Railway provides REDIS_URL as a full connection string
// Fall back to host/port for local dev
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { lazyConnect: true })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      lazyConnect: true,
    })

redis.on('error', (err) => {
  console.error('[Redis] connection error:', err.message)
})

const SLUG_TTL = 60 * 60 * 24 // 24 hours

async function cacheSlug(slug, originalUrl) {
  await redis.set(`slug:${slug}`, originalUrl, 'EX', SLUG_TTL)
}

async function getCachedSlug(slug) {
  return redis.get(`slug:${slug}`)
}

async function deleteCachedSlug(slug) {
  await redis.del(`slug:${slug}`)
}

module.exports = { redis, cacheSlug, getCachedSlug, deleteCachedSlug }