import { SurveyResponse } from "../types/survey";

// Determine API base URL:
// 1. Use environment variable if set
// 2. Use current origin (for deployed apps on same server)
// 3. Fall back to localhost:8080 for local development
const getApiBaseUrl = (): string => {
  // Priority 1: Environment variable (explicit override)
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log("[API] Using VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Priority 2: Use current origin when running in browser
  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    // Only use localhost:8080 if we're actually on localhost AND in dev mode
    if (
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1") &&
      import.meta.env.DEV
    ) {
      // For local dev, use localhost:8080
      const localDevUrl = "http://localhost:8080";
      console.log("[API] Local dev mode, using:", localDevUrl);
      return localDevUrl;
    }
    // For deployed apps (or production builds), always use same origin
    console.log("[API] Using current origin:", origin);
    return origin;
  }

  // Fallback for SSR or other environments
  const fallback = "http://localhost:8080";
  console.log("[API] Fallback to:", fallback);
  return fallback;
};

const API_BASE_URL = getApiBaseUrl();
const API_PREFIX = "/api";

// Cache API health check to avoid repeated failed requests
let apiHealthCache: { available: boolean; timestamp: number } | null = null;
const API_HEALTH_CACHE_DURATION = 60000; // 1 minute cache

// Try to get auth token from window (if running in platform context)
const getAuthToken = (): string | null => {
  // Check if we're in a platform context with auth
  if (typeof window !== "undefined") {
    // Try to get token from various possible locations
    const token =
      (window as any).__CAPTRS_TOKEN__ ||
      (window as any).token ||
      localStorage.getItem("captrs_token") ||
      sessionStorage.getItem("captrs_token");
    return token;
  }
  return null;
};

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

    // Try to get auth token
    const token = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add auth header if token is available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle authentication errors gracefully
    if (response.status === 401 || response.status === 403) {
      console.warn(
        "[API] Authentication required. Response status:",
        response.status
      );
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      console.error(
        "[API] Request failed:",
        response.status,
        response.statusText
      );
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
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    // Try to get auth token
    const token = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add auth header if token is available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Use minimal request to check health
    const healthCheckUrl = `${API_BASE_URL}${API_PREFIX}/gameData`;
    console.log("[API Health Check] Checking:", healthCheckUrl);
    const response = await fetch(healthCheckUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-cache",
    }).catch((error) => {
      // Log network errors for debugging
      console.log("[API Health Check] Network error:", error.message);
      return null;
    });

    clearTimeout(timeoutId);

    if (!response) {
      console.log("[API Health Check] No response received");
      apiHealthCache = {
        available: false,
        timestamp: Date.now(),
      };
      return false;
    }

    // Check response status - 200-299 is ok, 401/403 means API exists but needs auth
    const isAvailable = response.status >= 200 && response.status < 300;
    const needsAuth = response.status === 401 || response.status === 403;

    console.log(
      `[API Health Check] Status: ${response.status}, Available: ${isAvailable}, Needs Auth: ${needsAuth}`
    );

    // If we get 401/403, the API is available but needs authentication
    // For now, we'll consider it available (user can authenticate separately)
    const finalAvailable = isAvailable || needsAuth;

    // Cache the result
    apiHealthCache = {
      available: finalAvailable,
      timestamp: Date.now(),
    };

    return finalAvailable;
  } catch (error) {
    // Log unexpected errors
    console.log("[API Health Check] Exception:", error);
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
