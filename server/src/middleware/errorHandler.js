const { winstonLogger } = require('./logger.js')

function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500

  winstonLogger.error({
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    method: req.method,
    url: req.url,
  })

  res.status(status).json({
    error: {
      message: status === 500 ? 'Internal server error' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  })
}

module.exports = { errorHandler }