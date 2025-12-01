import { Router, Request, Response } from 'express'
import { getSurveyResponses, getResponseCount } from '../services/responseService.js'
import { SurveyResponseQuery } from '../types/response.js'

const router = Router()

/**
 * GET /api/survey-responses
 * Fetches survey responses with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query: SurveyResponseQuery = {
      surveyId: req.query.surveyId as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      status: req.query.status as 'completed' | 'partial' | 'abandoned' | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    }

    // Allow custom table name via query param (for different environments)
    const tableName = req.query.tableName as string | undefined

    const responses = await getSurveyResponses(query, tableName)

    res.json({
      success: true,
      data: responses,
      count: responses.length
    })
  } catch (error) {
    console.error('Error in GET /responses:', error)
    res.status(500).json({
      success: false,
      error: (error as Error).message
    })
  }
})

/**
 * GET /api/survey-responses/:surveyId
 * Fetches all responses for a specific survey
 */
router.get('/:surveyId', async (req: Request, res: Response) => {
  try {
    const { surveyId } = req.params
    const query: SurveyResponseQuery = {
      surveyId,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    }

    const tableName = req.query.tableName as string | undefined

    const responses = await getSurveyResponses(query, tableName)
    const totalCount = await getResponseCount(surveyId, tableName)

    res.json({
      success: true,
      data: responses,
      count: responses.length,
      total: totalCount
    })
  } catch (error) {
    console.error('Error in GET /responses/:surveyId:', error)
    res.status(500).json({
      success: false,
      error: (error as Error).message
    })
  }
})

/**
 * GET /api/survey-responses/:surveyId/count
 * Gets the count of responses for a survey
 */
router.get('/:surveyId/count', async (req: Request, res: Response) => {
  try {
    const { surveyId } = req.params
    const tableName = req.query.tableName as string | undefined

    const count = await getResponseCount(surveyId, tableName)

    res.json({
      success: true,
      count
    })
  } catch (error) {
    console.error('Error in GET /responses/:surveyId/count:', error)
    res.status(500).json({
      success: false,
      error: (error as Error).message
    })
  }
})

export default router

