require('dotenv').config()
const app = require('./app')
const { redis } = require('./services/redis')
const prisma = require('./db/client')

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await prisma.$connect()
    console.log('[DB] PostgreSQL connected')
  } catch (err) {
    console.error('[Startup] DB connection failed:', err.message)
    process.exit(1)
  }

  try {
    await redis.connect()
    console.log('[Redis] connected')
  } catch (err) {
    console.warn('[Redis] unavailable — running without cache:', err.message)
  }

  app.listen(PORT, () => {
    console.log(`[Server] running on http://localhost:${PORT}`)
  })
}

start()