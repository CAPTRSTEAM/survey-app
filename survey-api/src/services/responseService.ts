import { executeQuery } from '../config/snowflake.js'
import { SurveyResponse, SurveyResponseQuery } from '../types/response.js'

/**
 * Maps Snowflake row data to SurveyResponse format
 * Handles multiple possible column naming conventions (case-insensitive)
 * Supports both GAME_DATA table format and custom survey response tables
 */
const mapRowToResponse = (row: any): SurveyResponse => {
  // Helper to get value case-insensitively
  const getValue = (keys: string[]): any => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null) return row[key]
      // Try case-insensitive match
      const upperKey = key.toUpperCase()
      const lowerKey = key.toLowerCase()
      if (row[upperKey] !== undefined && row[upperKey] !== null) return row[upperKey]
      if (row[lowerKey] !== undefined && row[lowerKey] !== null) return row[lowerKey]
    }
    return undefined
  }

  // Parse the data column if it's a JSON string
  let answers: Record<string, any> = {}
  let surveyId = ''
  let surveyTitle = ''
  
  try {
    // Try multiple possible column names for data
    const dataStr = getValue(['data', 'DATA', 'survey_data', 'SURVEY_DATA', 'game_data', 'GAME_DATA'])
    
    if (dataStr) {
      let parsed: any
      
      // Handle string JSON
      if (typeof dataStr === 'string') {
        try {
          parsed = JSON.parse(dataStr)
        } catch {
          // Might be double-encoded
          parsed = JSON.parse(JSON.parse(dataStr))
        }
      } else {
        parsed = dataStr
      }
      
      // Handle nested data structure (platform format)
      const innerData = parsed.data 
        ? (typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data)
        : parsed
      
      answers = innerData.answers || parsed.answers || {}
      surveyId = innerData.surveyId || parsed.surveyId || innerData.survey_id || parsed.survey_id || ''
      surveyTitle = innerData.surveyTitle || parsed.surveyTitle || innerData.survey_title || parsed.survey_title || ''
    }
  } catch (error) {
    console.warn('Failed to parse response data:', error)
    console.warn('Row keys:', Object.keys(row))
  }

  // Get other fields with case-insensitive matching
  const id = getValue(['id', 'ID', 'response_id', 'RESPONSE_ID', 'game_data_id', 'GAME_DATA_ID']) || `response_${Date.now()}`
  const timestamp = getValue(['timestamp', 'TIMESTAMP', 'created_at', 'CREATED_AT', 'CREATED_TIMESTAMP']) || new Date().toISOString()
  const completedAt = getValue(['completed_at', 'COMPLETED_AT', 'completed_timestamp', 'COMPLETED_TIMESTAMP'])
  const sessionId = getValue(['session_id', 'SESSION_ID'])
  const timeSpent = getValue(['time_spent', 'TIME_SPENT', 'timeSpent'])
  const status = (getValue(['status', 'STATUS']) || 'completed') as 'completed' | 'partial' | 'abandoned'
  const userId = getValue(['user_id', 'USER_ID', 'userId'])
  const organizationId = getValue(['organization_id', 'ORGANIZATION_ID', 'organizationId', 'org_id', 'ORG_ID'])
  const exerciseId = getValue(['exercise_id', 'EXERCISE_ID', 'exerciseId'])

  return {
    id: String(id),
    surveyId: surveyId || '',
    surveyTitle: surveyTitle || '',
    answers,
    timestamp: typeof timestamp === 'string' ? timestamp : new Date(timestamp).toISOString(),
    completedAt: completedAt ? (typeof completedAt === 'string' ? completedAt : new Date(completedAt).toISOString()) : undefined,
    sessionId: sessionId ? String(sessionId) : undefined,
    timeSpent: timeSpent ? Number(timeSpent) : undefined,
    status,
    userId: userId ? String(userId) : undefined,
    organizationId: organizationId ? String(organizationId) : undefined,
    exerciseId: exerciseId ? String(exerciseId) : undefined
  }
}

/**
 * Builds SQL query based on filters
 * Adjust table/column names based on your actual Snowflake schema
 * Default table name can be overridden via environment variable SNOWFLAKE_TABLE_NAME
 */
const buildQuery = (query: SurveyResponseQuery, tableName?: string): string => {
  // Use environment variable or default
  const defaultTable = process.env.SNOWFLAKE_TABLE_NAME || 'GAME_DATA'
  const finalTableName = tableName || defaultTable
  const conditions: string[] = []
  const binds: any[] = []
  let bindIndex = 1

  // Extract surveyId from data column if needed
  if (query.surveyId) {
    conditions.push(`PARSE_JSON(data):surveyId = ? OR PARSE_JSON(PARSE_JSON(data):data):surveyId = ?`)
    binds.push(query.surveyId, query.surveyId)
    bindIndex += 2
  }

  if (query.startDate) {
    conditions.push(`timestamp >= ?`)
    binds.push(query.startDate)
    bindIndex++
  }

  if (query.endDate) {
    conditions.push(`timestamp <= ?`)
    binds.push(query.endDate)
    bindIndex++
  }

  if (query.status) {
    conditions.push(`status = ?`)
    binds.push(query.status)
    bindIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = query.limit || 1000
  const offset = query.offset || 0

  // Handle different possible column structures
  // Try common column names: DATA, data, survey_data, SURVEY_DATA
  // Try common timestamp columns: timestamp, TIMESTAMP, created_at, CREATED_AT
  return `
    SELECT *
    FROM ${finalTableName}
    ${whereClause}
    ORDER BY COALESCE(timestamp, TIMESTAMP, created_at, CREATED_AT, CURRENT_TIMESTAMP()) DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

/**
 * Fetches survey responses from Snowflake
 */
export const getSurveyResponses = async (
  query: SurveyResponseQuery = {},
  tableName?: string
): Promise<SurveyResponse[]> => {
  try {
    const sql = buildQuery(query, tableName)
    const rows = await executeQuery<any>(sql)
    return rows.map(mapRowToResponse)
  } catch (error) {
    console.error('Error fetching survey responses:', error)
    throw new Error(`Failed to fetch survey responses: ${(error as Error).message}`)
  }
}

/**
 * Gets response count for a survey
 */
export const getResponseCount = async (
  surveyId: string,
  tableName?: string
): Promise<number> => {
  try {
    const defaultTable = process.env.SNOWFLAKE_TABLE_NAME || 'GAME_DATA'
    const finalTableName = tableName || defaultTable
    
    // Try multiple query patterns to find surveyId in the data column
    const sql = `
      SELECT COUNT(*) as count
      FROM ${finalTableName}
      WHERE 
        PARSE_JSON(COALESCE(data, DATA, survey_data, SURVEY_DATA)):surveyId = ?
        OR PARSE_JSON(PARSE_JSON(COALESCE(data, DATA, survey_data, SURVEY_DATA)):data):surveyId = ?
        OR PARSE_JSON(COALESCE(data, DATA, survey_data, SURVEY_DATA)):survey_id = ?
        OR PARSE_JSON(PARSE_JSON(COALESCE(data, DATA, survey_data, SURVEY_DATA)):data):survey_id = ?
    `
    const rows = await executeQuery<{ count: number }>(sql, [surveyId, surveyId, surveyId, surveyId])
    return rows[0]?.count || 0
  } catch (error) {
    console.error('Error getting response count:', error)
    throw new Error(`Failed to get response count: ${(error as Error).message}`)
  }
}

