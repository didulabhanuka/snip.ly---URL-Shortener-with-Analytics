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
      setError(err.response?.data?.error || 'Failed to load links')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const createLink = useCallback(async (url, customSlug) => {
    const { data } = await api.post('/api/shorten', { url, customSlug })
    setLinks((prev) => [{ ...data, clicks: 0, createdAt: new Date() }, ...prev])
    return data
  }, [])

  const deleteLink = useCallback(async (id) => {
    await api.delete(`/api/shorten/${id}`)
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return { links, loading, error, fetchLinks, createLink, deleteLink }
}