import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

export function useLinks() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/shorten')
      setLinks(data)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to load links'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  const createLink = useCallback(async (url, customSlug, password) => {
    const { data } = await api.post('/api/shorten', { url, customSlug, password })
    setLinks((prev) => [{ ...data, clicks: 0, createdAt: new Date() }, ...prev])
    return data
  }, [])

  const deleteLink = useCallback(async (id) => {
    await api.delete(`/api/shorten/${id}`)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return { links, loading, error, fetchLinks, createLink, deleteLink }
}