const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/auth')
const shortenRoutes = require('./routes/shorten')
const analyticsRoutes = require('./routes/analytics')
const redirectRoutes = require('./routes/redirect')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(helmet())

const allowedOrigins = [
  (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, ''),
  'http://localhost:5173',
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true)
    }
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/shorten', shortenRoutes)
app.use('/api/analytics', analyticsRoutes)

// Must come last — catches /:slug
app.use('/', redirectRoutes)

app.use(errorHandler)

module.exports = app