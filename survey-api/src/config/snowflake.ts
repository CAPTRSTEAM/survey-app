import snowflake from 'snowflake-sdk'
import { config } from './env.js'

let connection: snowflake.Connection | null = null

export interface SnowflakeConfig {
  account: string
  username: string
  password: string
  warehouse: string
  database: string
  schema: string
  role?: string
}

export const getSnowflakeConfig = (): SnowflakeConfig => {
  return {
    account: config.SNOWFLAKE_ACCOUNT || '',
    username: config.SNOWFLAKE_USER || config.SNOWFLAKE_USERNAME || '',
    password: config.SNOWFLAKE_PASSWORD,
    warehouse: config.SNOWFLAKE_WAREHOUSE,
    database: config.SNOWFLAKE_DATABASE || config.SNOWFLAKE_DATABASE_1 || '',
    schema: config.SNOWFLAKE_SCHEMA || config.SNOWFLAKE_SCHEMA_1 || '',
    role: config.SNOWFLAKE_ROLE
  }
}

export const connectToSnowflake = (): Promise<snowflake.Connection> => {
  return new Promise((resolve, reject) => {
    if (connection) {
      resolve(connection)
      return
    }

    const sfConfig = getSnowflakeConfig()
    
    connection = snowflake.createConnection({
      account: sfConfig.account,
      username: sfConfig.username,
      password: sfConfig.password,
      warehouse: sfConfig.warehouse,
      database: sfConfig.database,
      schema: sfConfig.schema,
      role: sfConfig.role
    })

    connection.connect((err, conn) => {
      if (err) {
        console.error('Failed to connect to Snowflake:', err)
        connection = null
        reject(err)
        return
      }
      console.log('Successfully connected to Snowflake')
      resolve(conn)
    })
  })
}

export const executeQuery = <T = any>(
  query: string,
  binds?: any[]
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    connectToSnowflake()
      .then(connection => {
        connection.execute({
          sqlText: query,
          binds: binds || [],
          complete: (err, stmt, rows) => {
            if (err) {
              console.error('Query execution error:', err)
              reject(err)
              return
            }
            resolve(rows as T[])
          }
        })
      })
      .catch(reject)
  })
}

export const closeConnection = (): void => {
  if (connection) {
    connection.destroy((err) => {
      if (err) {
        console.error('Error closing Snowflake connection:', err)
      } else {
        console.log('Snowflake connection closed')
      }
    })
    connection = null
  }
}

