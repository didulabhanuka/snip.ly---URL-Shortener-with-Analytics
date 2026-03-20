const express = require('express')
const prisma = require('../db/client')
const { authenticate } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/requireAdmin')

const router = express.Router()

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin)

// GET /api/admin/stats — platform-wide overview
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalLinks, totalClicks] = await Promise.all([
      prisma.user.count(),
      prisma.url.count(),
      prisma.click.count(),
    ])

    // New users last 7 days
    const since = new Date()
    since.setDate(since.getDate() - 6)
    since.setHours(0, 0, 0, 0)

    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: since } },
    })

    const newLinks = await prisma.url.count({
      where: { createdAt: { gte: since } },
    })

    const newClicks = await prisma.click.count({
      where: { clickedAt: { gte: since } },
    })

    res.json({ totalUsers, totalLinks, totalClicks, newUsers, newLinks, newClicks })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/users — all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { urls: true } } },
    })

    res.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        linkCount: u._count.urls,
      }))
    )
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/users/:id — delete a user + all their links
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'User deleted' })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/links — all links across all users
router.get('/links', async (req, res, next) => {
  try {
    const urls = await prisma.url.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        _count: { select: { clicks: true } },
      },
    })

    res.json(
      urls.map((u) => ({
        id: u.id,
        slug: u.slug,
        originalUrl: u.originalUrl,
        protected: !!u.passwordHash,
        createdAt: u.createdAt,
        clicks: u._count.clicks,
        userEmail: u.user?.email || 'Unknown',
      }))
    )
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/links/:id — delete any link
router.delete('/links/:id', async (req, res, next) => {
  try {
    const url = await prisma.url.findUnique({ where: { id: req.params.id } })
    if (!url) return res.status(404).json({ error: 'Link not found' })

    await prisma.url.delete({ where: { id: req.params.id } })
    res.json({ message: 'Link deleted' })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/users/:id/role — promote or demote a user
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin' })
    }
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot change your own role' })
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    })

    res.json({ id: user.id, email: user.email, role: user.role })
  } catch (err) {
    next(err)
  }
})

module.exports = router