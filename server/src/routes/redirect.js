const express = require('express')
const prisma = require('../db/client')
const { getCachedSlug, cacheSlug } = require('../services/redis')
const { captureClick } = require('../services/clickWorker')

const router = express.Router()

// GET /:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params

    // 1. Try Redis cache first (hot path)
    let originalUrl = await getCachedSlug(slug)

    if (originalUrl) {
      // Fire-and-forget analytics — never block the redirect
      captureClick(req, slug)
      return res.redirect(302, originalUrl)
    }

    // 2. Cache miss — hit the database
    const record = await prisma.url.findUnique({ where: { slug } })

    if (!record) {
      return res.status(404).json({ error: 'Short link not found' })
    }

    // Warm the cache for next time
    await cacheSlug(slug, record.originalUrl)

    // Fire-and-forget analytics
    captureClick(req, record.id)

    return res.redirect(302, record.originalUrl)
  } catch (err) {
    next(err)
  }
})

module.exports = router