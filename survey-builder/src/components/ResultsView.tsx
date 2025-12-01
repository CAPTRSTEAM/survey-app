import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  TableChart as TableChartIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

import { Survey, SurveyResponse, SurveyStatistics } from "../types/survey";
import {
  getResponsesForSurvey,
  loadResponsesFromAPI,
  calculateSurveyStatistics,
  exportResponsesToCSV,
  exportResponsesToJSON,
  importResponsesFromFile,
  importResponsesFromCSV,
} from "../utils/responseUtils";
import { checkApiHealth } from "../services/api";
import { formatDate } from "../utils/surveyUtils";
import { QuestionAnalytics } from "./QuestionAnalytics";

interface ResultsViewProps {
  survey: Survey;
  onBack: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ survey, onBack }) => {
  const [tabValue, setTabValue] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [useAPI, setUseAPI] = useState(true);
  const [apiConfigDialogOpen, setApiConfigDialogOpen] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [gameConfigIdFilter, setGameConfigIdFilter] = useState<string>(
    survey.metadata?.gameConfigId || ""
  );
  const [exerciseIdFilter, setExerciseIdFilter] = useState<string>(
    survey.metadata?.exerciseId || ""
  );

  // Check API availability and load responses
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Check if API is available (with silent error handling)
        // Don't await in a try-catch - let checkApiHealth handle errors internally
        // Also check for runtime API URL updates (platform may provide it after page load)
        let apiHealth = await checkApiHealth();
        
        // If API not available, wait a bit and check again (platform might send CONFIG message)
        if (!apiHealth && typeof window !== "undefined") {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
          apiHealth = await checkApiHealth(true); // Force check
        }
        
        console.log("[ResultsView] API Health Check Result:", apiHealth);
        setApiAvailable(apiHealth);

        // Load responses from platform API or fallback to localStorage
        let surveyResponses: SurveyResponse[];
        if (apiHealth && useAPI) {
          try {
            // Use gameConfigId/exerciseId from survey metadata or filter inputs
            const exerciseId = exerciseIdFilter || survey.metadata?.exerciseId;
            const gameConfigId = gameConfigIdFilter || survey.metadata?.gameConfigId;
            
            surveyResponses = await loadResponsesFromAPI(
              survey.id,
              exerciseId,
              gameConfigId,
              true
            );
          } catch (error) {
            // Log the error for debugging
            console.log("[ResultsView] API fetch error:", error);
            // Check if it's an auth error
            if (
              error instanceof Error &&
              error.message === "Authentication required"
            ) {
              console.warn(
                "[ResultsView] Authentication required for API access"
              );
              // Still fall back to localStorage, but keep useAPI true so user can retry after auth
            } else {
              // For other errors, disable API usage
              setUseAPI(false);
            }
            surveyResponses = getResponsesForSurvey(survey.id);
          }
        } else {
          surveyResponses = getResponsesForSurvey(survey.id);
          setUseAPI(false);
        }

        setResponses(surveyResponses);
        const stats = calculateSurveyStatistics(survey, surveyResponses);
        setStatistics(stats);
      } catch (error) {
        // Final fallback to localStorage
        const surveyResponses = getResponsesForSurvey(survey.id);
        setResponses(surveyResponses);
        const stats = calculateSurveyStatistics(survey, surveyResponses);
        setStatistics(stats);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [survey, refreshKey, useAPI]);

  // Show loading state
  if (loading || !statistics) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <LinearProgress sx={{ width: 300, mb: 2 }} />
          <Typography>Loading survey responses...</Typography>
        </Box>
      </Box>
    );
  }

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportError(null);

    try {
      if (importFile.name.endsWith(".csv")) {
        await importResponsesFromCSV(importFile);
      } else if (importFile.name.endsWith(".json")) {
        await importResponsesFromFile(importFile);
      } else {
        setImportError(
          "Unsupported file type. Please upload a CSV or JSON file."
        );
        setImporting(false);
        return;
      }

      setImportDialogOpen(false);
      setImportFile(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setImportError((error as Error).message || "Failed to import responses");
    } finally {
      setImporting(false);
    }
  };

  const handleExportCSV = () => {
    exportResponsesToCSV(responses, survey);
  };

  const handleExportJSON = () => {
    exportResponsesToJSON(responses, survey);
  };

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 4 }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "primary.dark",
          color: "white",
          position: "fixed",
          top: 0,
          left: "12.5%",
          right: "12.5%",
          zIndex: 1200,
          height: 64,
          display: "flex",
          alignItems: "center",
          px: 3,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <IconButton onClick={onBack} sx={{ color: "white", mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          Survey Results: {survey.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialogOpen(true)}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportJSON}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Export JSON
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, pt: 16 }}>
        {/* API Status Indicator */}
        {apiAvailable && useAPI ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Connected to platform API
            <Button
              size="small"
              onClick={() => {
                // Clear cache and retry
                import("../services/api").then(({ clearApiHealthCache }) => {
                  clearApiHealthCache();
                  setRefreshKey((prev) => prev + 1);
                });
              }}
              sx={{ ml: 1 }}
            >
              Refresh
            </Button>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            Using local storage (Platform API unavailable or disabled).
            <Button
              size="small"
              onClick={() => {
                // Load current API URL from localStorage
                const currentUrl = localStorage.getItem("captrs_api_url") || "";
                setApiUrlInput(currentUrl);
                setApiConfigDialogOpen(true);
              }}
              sx={{ ml: 1 }}
            >
              Configure API URL
            </Button>
            {apiAvailable && (
              <Button
                size="small"
                onClick={() => {
                  import("../services/api").then(({ clearApiHealthCache }) => {
                    clearApiHealthCache();
                    setUseAPI(true);
                    setRefreshKey((prev) => prev + 1);
                  });
                }}
                sx={{ ml: 1 }}
              >
                Connect to Platform API
              </Button>
            )}
            <Button
              size="small"
              onClick={() => {
                import("../services/api").then(({ clearApiHealthCache }) => {
                  clearApiHealthCache();
                  setRefreshKey((prev) => prev + 1);
                });
              }}
              sx={{ ml: 1 }}
            >
              Retry Connection
            </Button>
          </Alert>
        )}

        {/* Overview Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  {statistics?.totalResponses || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Responses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  {statistics?.completionRate.toFixed(1) || "0.0"}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  {statistics
                    ? `${Math.floor(statistics.averageTimeSpent / 60)}m ${
                        statistics.averageTimeSpent % 60
                      }s`
                    : "0m 0s"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Time Spent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  {survey.sections.reduce(
                    (sum, s) => sum + s.questions.length,
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Questions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              icon={<AssessmentIcon />}
              iconPosition="start"
              label="Analytics"
            />
            <Tab
              icon={<TableChartIcon />}
              iconPosition="start"
              label="Individual Responses"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            {statistics && statistics.questionStats.length === 0 ? (
              <Alert severity="info">
                No responses available. Import response data to view analytics.
              </Alert>
            ) : (
              statistics &&
              statistics.questionStats.map((questionStat) => (
                <QuestionAnalytics
                  key={questionStat.questionId}
                  questionStat={questionStat}
                  survey={survey}
                  responses={responses}
                />
              ))
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {responses.length === 0 ? (
              <Alert severity="info">
                No responses available. Import response data to view individual
                responses.
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Response ID</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time Spent</TableCell>
                      {survey.sections.flatMap((section) =>
                        section.questions.map((q) => (
                          <TableCell key={q.id}>{q.question}</TableCell>
                        ))
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {responses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>{response.id.substring(0, 8)}...</TableCell>
                        <TableCell>{formatDate(response.timestamp)}</TableCell>
                        <TableCell>
                          <Chip
                            label={response.status}
                            size="small"
                            color={
                              response.status === "completed"
                                ? "success"
                                : response.status === "partial"
                                ? "warning"
                                : "error"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {response.timeSpent
                            ? `${Math.floor(response.timeSpent / 60)}m ${
                                response.timeSpent % 60
                              }s`
                            : "N/A"}
                        </TableCell>
                        {survey.sections.flatMap((section) =>
                          section.questions.map((q) => {
                            const answer = response.answers[q.id];
                            let displayValue = "";
                            if (
                              answer === undefined ||
                              answer === null ||
                              answer === ""
                            ) {
                              displayValue = "-";
                            } else if (Array.isArray(answer)) {
                              displayValue = answer.join(", ");
                            } else {
                              displayValue = String(answer);
                            }
                            return (
                              <TableCell key={q.id} sx={{ maxWidth: 200 }}>
                                <Tooltip title={displayValue}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {displayValue}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                            );
                          })
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Container>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Survey Responses</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload a CSV or JSON file containing survey responses. The file
            should match the platform export format.
          </Typography>
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}
          <TextField
            type="file"
            inputProps={{ accept: ".csv,.json" }}
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              setImportFile(file || null);
              setImportError(null);
            }}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!importFile || importing}
          >
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* API Configuration Dialog */}
      <Dialog
        open={apiConfigDialogOpen}
        onClose={() => setApiConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configure Platform API URL</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the base URL of your CAPTRS platform API (e.g., https://api.captrs.com or http://localhost:8080).
            This will be saved in your browser's local storage.
          </Typography>
          <TextField
            label="API Base URL"
            value={apiUrlInput}
            onChange={(e) => setApiUrlInput(e.target.value)}
            placeholder="https://api.captrs.com"
            fullWidth
            sx={{ mt: 2 }}
            helperText="The base URL without /api suffix"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiConfigDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (apiUrlInput.trim()) {
                // Remove trailing slash if present
                const cleanUrl = apiUrlInput.trim().replace(/\/$/, "");
                // Set the API URL
                const { setApiBaseUrl, clearApiHealthCache } = await import("../services/api");
                setApiBaseUrl(cleanUrl);
                clearApiHealthCache();
                setApiConfigDialogOpen(false);
                // Refresh to test the connection
                setRefreshKey((prev) => prev + 1);
              }
            }}
            variant="contained"
            disabled={!apiUrlInput.trim()}
          >
            Save & Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Survey Results</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Filter results by Game Config ID or Exercise ID. These IDs are used to identify
            which survey instance to query in the platform. Leave empty to search all instances
            with this survey ID.
          </Typography>
          <TextField
            label="Game Config ID"
            value={gameConfigIdFilter}
            onChange={(e) => setGameConfigIdFilter(e.target.value)}
            placeholder="e.g., 11ee9a08d96eb0d5b17e02425a0573cc"
            fullWidth
            sx={{ mt: 2 }}
            helperText="The gameConfigId from the platform (optional)"
          />
          <TextField
            label="Exercise ID"
            value={exerciseIdFilter}
            onChange={(e) => setExerciseIdFilter(e.target.value)}
            placeholder="e.g., exercise-123"
            fullWidth
            sx={{ mt: 2 }}
            helperText="The exerciseId from the platform (optional)"
          />
          {survey.metadata?.gameConfigId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This survey has a stored Game Config ID: {survey.metadata.gameConfigId}
            </Alert>
          )}
          {survey.metadata?.exerciseId && (
            <Alert severity="info" sx={{ mt: 1 }}>
              This survey has a stored Exercise ID: {survey.metadata.exerciseId}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setFilterDialogOpen(false);
              // Refresh data with new filters
              setRefreshKey((prev) => prev + 1);
            }}
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
