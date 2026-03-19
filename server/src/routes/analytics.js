const express = require('express')
const prisma = require('../db/client')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// GET /api/analytics/:urlId — full analytics for one link
router.get('/:urlId', authenticate, async (req, res, next) => {
  try {
    const url = await prisma.url.findFirst({
      where: { id: req.params.urlId, userId: req.user.userId },
    })
    if (!url) return res.status(404).json({ error: 'Link not found' })

    const clicks = await prisma.click.findMany({
      where: { urlId: url.id },
      orderBy: { clickedAt: 'asc' },
    })

    // Clicks over time (grouped by date)
    const clicksByDate = clicks.reduce((acc, c) => {
      const date = c.clickedAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Country breakdown
    const byCountry = clicks.reduce((acc, c) => {
      const key = c.country || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    // Browser breakdown
    const byBrowser = clicks.reduce((acc, c) => {
      const key = c.browser || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    // Device breakdown
    const byDevice = clicks.reduce((acc, c) => {
      const key = c.device || 'desktop'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    // Top referrers
    const byReferrer = clicks.reduce((acc, c) => {
      const key = c.referrer || 'Direct'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    res.json({
      url: {
        id: url.id,
        slug: url.slug,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
      },
      totalClicks: clicks.length,
      clicksByDate,
      byCountry,
      byBrowser,
      byDevice,
      byReferrer,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router