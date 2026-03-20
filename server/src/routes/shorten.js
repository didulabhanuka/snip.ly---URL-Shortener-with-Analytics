const express = require('express')
const { nanoid } = require('nanoid')
const bcrypt = require('bcryptjs')
const prisma = require('../db/client')
const { cacheSlug } = require('../services/redis')
const { authenticate } = require('../middleware/auth')
const { shortenLimiter } = require('../middleware/rateLimiter')

const router = express.Router()

function isValidUrl(str) {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// POST /api/shorten
router.post('/', shortenLimiter, authenticate, async (req, res, next) => {
  try {
    const { url, customSlug, password } = req.body

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'A valid URL is required' })
    }

    const slug = customSlug || nanoid(6)

    if (customSlug) {
      const existing = await prisma.url.findUnique({ where: { slug } })
      if (existing) {
        return res.status(409).json({ error: 'Slug already taken' })
      }
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null

    const record = await prisma.url.create({
      data: {
        slug,
        originalUrl: url,
        passwordHash,
        user: { connect: { id: req.user.userId } },
      },
    })

    if (!passwordHash) {
      await cacheSlug(slug, url)
    }

    const shortUrl = `${process.env.BASE_URL}/${slug}`
    res.status(201).json({
      shortUrl,
      slug,
      originalUrl: url,
      id: record.id,
      protected: !!passwordHash,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/shorten — list current user's links
router.get('/', authenticate, async (req, res, next) => {
  try {
    const urls = await prisma.url.findMany({
      where: { user: { id: req.user.userId } },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { clicks: true } } },
    })

    res.json(
      urls.map((u) => ({
        id: u.id,
        slug: u.slug,
        originalUrl: u.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${u.slug}`,
        clicks: u._count.clicks,
        createdAt: u.createdAt,
        protected: !!u.passwordHash,
      }))
    )
  } catch (err) {
    next(err)
  }
})

// DELETE /api/shorten/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const url = await prisma.url.findFirst({
      where: { id: req.params.id, user: { id: req.user.userId } },
    })

    if (!url) return res.status(404).json({ error: 'Link not found' })

    await prisma.url.delete({ where: { id: url.id } })
    res.json({ message: 'Link deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router