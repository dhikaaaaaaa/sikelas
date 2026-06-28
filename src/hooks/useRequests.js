import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { storage } from '../utils/storage.js'

export function useRequests(endpoint, filterFn) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .get(endpoint)
      .then((res) => {
        if (active) {
          setRequests(res.data.requests || [])
          setUsingMock(false)
        }
      })
      .catch(() => {
        if (active) {
          // Gunakan database localStorage agar interaktif
          const allReqs = storage.getRequests()
          setRequests(filterFn ? allReqs.filter(filterFn) : allReqs)
          setUsingMock(true)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [endpoint, filterFn])

  return { requests, setRequests, loading, usingMock }
}

