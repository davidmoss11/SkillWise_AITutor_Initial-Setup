import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL,
  withCredentials: true
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Simple helper to safely extract payload from JWT without external libs
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch (e) {
    return null
  }
}
