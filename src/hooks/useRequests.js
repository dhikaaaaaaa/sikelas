import { useEffect, useState } from 'react'
import api from '../api/axios.js'

export function useRequests(endpoint, filterFn) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .get(endpoint)
      .then((res) => {
        if (active) {
          const data = res.data.requests || []
          setRequests(filterFn ? data.filter(filterFn) : data)
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data dari server:', err)
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
