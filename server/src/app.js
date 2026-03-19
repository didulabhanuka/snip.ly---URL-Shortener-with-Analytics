const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/auth')
const shortenRoutes = require('./routes/shorten')
const analyticsRoutes = require('./routes/analytics')
const redirectRoutes = require('./routes/redirect')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

// Security & parsing
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/shorten', shortenRoutes)
app.use('/api/analytics', analyticsRoutes)

// Redirect route — must come last (catches /:slug)
app.use('/', redirectRoutes)

// Global error handler
app.use(errorHandler)

module.exports = app