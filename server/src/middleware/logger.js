const { createLogger, format, transports } = require('winston')

const winstonLogger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack, ...meta }) => {
      let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`
      if (stack) log += `\n${stack}`
      if (Object.keys(meta).length) log += `\n${JSON.stringify(meta, null, 2)}`
      return log
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

module.exports = { winstonLogger }