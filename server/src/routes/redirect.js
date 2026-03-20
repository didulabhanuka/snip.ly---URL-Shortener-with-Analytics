const express = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../db/client')
const { getCachedSlug, cacheSlug, deleteCachedSlug } = require('../services/redis')
const { captureClick } = require('../services/clickWorker')

const router = express.Router()

// GET /:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params

    // Always hit DB first to check passwordHash — Redis only used for final redirect
    const record = await prisma.url.findUnique({ where: { slug } })

    if (!record) {
      return res.status(404).json({ error: 'Short link not found' })
    }

    // Protected link — send browser to the password gate UI
    if (record.passwordHash) {
      // Evict from cache in case it was cached before password was set
      await deleteCachedSlug(slug)
      return res.redirect(302, `${process.env.CLIENT_ORIGIN}/p/${slug}`)
    }

    // Unprotected — try cache for the destination URL, warm if missing
    let destination = await getCachedSlug(slug)
    if (!destination) {
      await cacheSlug(slug, record.originalUrl)
      destination = record.originalUrl
    }

    captureClick(req, record.id)
    return res.redirect(302, destination)
  } catch (err) {
    next(err)
  }
})

// POST /api/verify/:slug — verify password and redirect
router.post('/api/verify/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    const record = await prisma.url.findUnique({ where: { slug } })

    if (!record) {
      return res.status(404).json({ error: 'Short link not found' })
    }

    if (!record.passwordHash) {
      captureClick(req, record.id)
      return res.json({ url: record.originalUrl })
    }

    const valid = await bcrypt.compare(password, record.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    captureClick(req, record.id)
    return res.json({ url: record.originalUrl })
  } catch (err) {
    next(err)
  }
})

module.exports = router