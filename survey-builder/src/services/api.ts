import { SurveyResponse } from "../types/survey";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_PREFIX = "/api";

// Cache API health check to avoid repeated failed requests
let apiHealthCache: { available: boolean; timestamp: number } | null = null;
const API_HEALTH_CACHE_DURATION = 60000; // 1 minute cache

export interface GameDataDTO {
  id: string;
  data: any; // JSON data containing survey response
  exerciseId: string;
  gameConfigId: string;
  organizationId: string;
  userId?: string;
  groupName?: string;
  creationTimestamp: number;
}

export interface GameDataListDTO {
  gameData: GameDataDTO[];
}

export interface ResponseQueryParams {
  surveyId?: string;
  exerciseId?: string;
  gameConfigId?: string;
  organizationId?: string;
  userId?: string;
}

/**
 * Maps GameDataDTO to SurveyResponse format
 */
const mapGameDataToSurveyResponse = (
  gameData: GameDataDTO
): SurveyResponse | null => {
  try {
    // Parse the data field - it may be a string or already parsed
    let dataContent: any;
    if (typeof gameData.data === "string") {
      dataContent = JSON.parse(gameData.data);
    } else {
      dataContent = gameData.data;
    }

    // Handle nested data structure (platform format)
    const innerData = dataContent.data
      ? typeof dataContent.data === "string"
        ? JSON.parse(dataContent.data)
        : dataContent.data
      : dataContent;

    // Check if this is a survey response
    if (!innerData.surveyId && !innerData.answers) {
      return null; // Not a survey response
    }

    return {
      id: gameData.id,
      surveyId: innerData.surveyId || "",
      surveyTitle: innerData.surveyTitle || innerData.survey_title || "",
      answers: innerData.answers || {},
      timestamp: new Date(gameData.creationTimestamp).toISOString(),
      completedAt: innerData.completedAt || innerData.completed_at,
      sessionId: innerData.sessionId || innerData.session_id,
      timeSpent: innerData.timeSpent || innerData.time_spent,
      status: (innerData.status || "completed") as
        | "completed"
        | "partial"
        | "abandoned",
      userId: gameData.userId,
      organizationId: gameData.organizationId,
      exerciseId: gameData.exerciseId,
    };
  } catch (error) {
    console.warn(
      "Failed to map game data to survey response:",
      error,
      gameData
    );
    return null;
  }
};

/**
 * Fetches survey responses from the platform API
 */
export const fetchSurveyResponses = async (
  params?: ResponseQueryParams
): Promise<SurveyResponse[]> => {
  try {
    let url: string;
    let queryParams = new URLSearchParams();

    // Use searchGameData endpoint if we have specific filters
    if (
      params?.exerciseId ||
      params?.gameConfigId ||
      params?.organizationId ||
      params?.userId
    ) {
      url = `${API_BASE_URL}${API_PREFIX}/searchGameData`;
      if (params.exerciseId)
        queryParams.append("exerciseId", params.exerciseId);
      if (params.gameConfigId)
        queryParams.append("gameConfigId", params.gameConfigId);
      if (params.organizationId)
        queryParams.append("organizationId", params.organizationId);
      if (params.userId) queryParams.append("userId", params.userId);
    } else {
      // Use general getGameData endpoint
      url = `${API_BASE_URL}${API_PREFIX}/gameData`;
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const result: GameDataListDTO = await response.json();

    // Filter and map to survey responses
    const surveyResponses: SurveyResponse[] = [];

    for (const gameData of result.gameData || []) {
      // If surveyId filter is provided, check the data
      if (params?.surveyId) {
        try {
          const dataContent =
            typeof gameData.data === "string"
              ? JSON.parse(gameData.data)
              : gameData.data;
          const innerData = dataContent.data
            ? typeof dataContent.data === "string"
              ? JSON.parse(dataContent.data)
              : dataContent.data
            : dataContent;

          if (innerData.surveyId !== params.surveyId) {
            continue; // Skip if surveyId doesn't match
          }
        } catch {
          continue; // Skip if we can't parse
        }
      }

      const surveyResponse = mapGameDataToSurveyResponse(gameData);
      if (surveyResponse) {
        surveyResponses.push(surveyResponse);
      }
    }

    return surveyResponses;
  } catch (error) {
    // Re-throw connection errors so caller can handle fallback
    // Don't log connection refused errors as they're expected
    if (error instanceof Error) {
      if (
        error.name === "AbortError" ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_CONNECTION_REFUSED")
      ) {
        // Expected connection errors - let caller handle gracefully
        throw error;
      }
    }
    console.error("Error fetching survey responses:", error);
    throw error;
  }
};

/**
 * Gets the count of responses for a survey
 */
export const getResponseCount = async (
  surveyId: string,
  exerciseId?: string,
  gameConfigId?: string
): Promise<number> => {
  try {
    const responses = await fetchSurveyResponses({
      surveyId,
      exerciseId,
      gameConfigId,
    });
    return responses.length;
  } catch (error) {
    console.error("Error getting response count:", error);
    throw error;
  }
};

/**
 * Checks if the platform API is available
 * Returns false silently if connection fails (expected when backend is not running)
 * Uses caching to avoid repeated failed requests
 */
export const checkApiHealth = async (
  forceCheck: boolean = false
): Promise<boolean> => {
  // Check cache first
  if (!forceCheck && apiHealthCache) {
    const age = Date.now() - apiHealthCache.timestamp;
    if (age < API_HEALTH_CACHE_DURATION) {
      return apiHealthCache.available;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout (fast fail)

    // Use minimal request to check health
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/gameData`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-cache",
    }).catch(() => {
      // Immediately catch network errors - don't let them propagate
      return null;
    });

    clearTimeout(timeoutId);

    const isAvailable = response !== null && response.ok;

    // Cache the result
    apiHealthCache = {
      available: isAvailable,
      timestamp: Date.now(),
    };

    return isAvailable;
  } catch (error) {
    // All errors are expected when backend is not running - cache as unavailable
    apiHealthCache = {
      available: false,
      timestamp: Date.now(),
    };
    return false;
  }
};

/**
 * Clears the API health cache (useful for retrying after backend starts)
 */
export const clearApiHealthCache = (): void => {
  apiHealthCache = null;
};
