const prisma = require('../db/client')
const { getCountry, parseUserAgent, getClientIp } = require('./geo')

/**
 * Fire-and-forget: captures click data asynchronously.
 * Never awaited on the redirect path — keeps redirects under 20ms.
 */
async function captureClick(req, urlId) {
  try {
    const ip = getClientIp(req)
    const country = getCountry(ip)
    const { browser, os, device } = parseUserAgent(req.headers['user-agent'] || '')
    const referrer = req.headers['referer'] || req.headers['referrer'] || null

    await prisma.click.create({
      data: {
        urlId,
        ip,
        country,
        referrer,
        browser,
        os,
        device,
      },
    })
  } catch (err) {
    // Never let analytics errors affect redirect flow
    console.error('[ClickWorker] failed to capture click:', err.message)
  }
}

module.exports = { captureClick }