import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import responseRoutes from './routes/responses.js'
import { connectToSnowflake } from './config/snowflake.js'

const app = express()

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use(config.API_PREFIX, responseRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: config.NODE_ENV === 'production' ? 'Internal server error' : err.message
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

// Initialize Snowflake connection on startup
connectToSnowflake()
  .then(() => {
    console.log('✅ Snowflake connection initialized')
  })
  .catch((error) => {
    console.error('⚠️  Failed to initialize Snowflake connection:', error)
    console.error('   The server will start, but API calls may fail until connection is established')
  })

// Start server
const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`🚀 Survey API server running on port ${PORT}`)
  console.log(`   Environment: ${config.NODE_ENV}`)
  console.log(`   API prefix: ${config.API_PREFIX}`)
  console.log(`   CORS origin: ${config.CORS_ORIGIN}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

