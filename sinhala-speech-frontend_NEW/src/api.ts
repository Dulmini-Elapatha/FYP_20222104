import axios from 'axios'

const api = axios.create({
  // Point directly to your local FastAPI backend!
  baseURL: 'http://127.0.0.1:8000', 
  // We removed the JSON header here because FormData (audio files) needs to set its own special boundary headers automatically.
})

// Keep your interceptors exactly as they were
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api