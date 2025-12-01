import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Snowflake connection - support both naming conventions
  SNOWFLAKE_ACCOUNT: z.string().optional(),
  SNOWFLAKE_USER: z.string().optional(),
  SNOWFLAKE_USERNAME: z.string().optional(),
  SNOWFLAKE_PASSWORD: z.string(),
  SNOWFLAKE_WAREHOUSE: z.string(),
  SNOWFLAKE_DATABASE: z.string().optional(),
  SNOWFLAKE_DATABASE_1: z.string().optional(),
  SNOWFLAKE_SCHEMA: z.string().optional(),
  SNOWFLAKE_SCHEMA_1: z.string().optional(),
  SNOWFLAKE_ROLE: z.string().optional(),
  // Table name for survey responses (defaults to common patterns)
  SNOWFLAKE_TABLE_NAME: z.string().default('GAME_DATA'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  API_PREFIX: z.string().default('/api/survey-responses')
}).refine(
  (data) => data.SNOWFLAKE_ACCOUNT,
  { message: "SNOWFLAKE_ACCOUNT must be provided" }
).refine(
  (data) => data.SNOWFLAKE_USER || data.SNOWFLAKE_USERNAME,
  { message: "Either SNOWFLAKE_USER or SNOWFLAKE_USERNAME must be provided" }
).refine(
  (data) => (data.SNOWFLAKE_DATABASE || data.SNOWFLAKE_DATABASE_1) && (data.SNOWFLAKE_SCHEMA || data.SNOWFLAKE_SCHEMA_1),
  { message: "Database and Schema must be provided" }
)

const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      process.exit(1)
    }
    throw error
  }
}

export const config = parseEnv()

