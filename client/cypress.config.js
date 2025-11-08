const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    env: {
      API_URL: 'http://localhost:3001/api'
    }
  }
})
