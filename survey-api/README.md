# Survey API - Snowflake Integration

Backend API service for the Survey Builder application that connects to Snowflake to fetch survey response data.

## Features

- ✅ Snowflake database integration
- ✅ RESTful API endpoints for survey responses
- ✅ Query filtering (by survey ID, date range, status)
- ✅ Pagination support
- ✅ Error handling and logging
- ✅ TypeScript for type safety
- ✅ Environment-based configuration

## Prerequisites

- Node.js 18+ 
- Snowflake account with access to survey response data
- Snowflake credentials (account, username, password, warehouse, database, schema)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Snowflake credentials (matching A3P-After-Action-Reports pattern):
   ```env
   SNOWFLAKE_ACCOUNT=your-account
   SNOWFLAKE_USER=your-username
   SNOWFLAKE_PASSWORD=your-password
   SNOWFLAKE_WAREHOUSE=your-warehouse
   SNOWFLAKE_DATABASE_1=your-database
   SNOWFLAKE_SCHEMA_1=your-schema
   SNOWFLAKE_TABLE_NAME=GAME_DATA  # Optional, defaults to GAME_DATA
   SNOWFLAKE_ROLE=your-role  # Optional
   ```
   
   **Note:** The API also supports alternative names: `SNOWFLAKE_USERNAME`, `SNOWFLAKE_DATABASE`, `SNOWFLAKE_SCHEMA`

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   # Development (with hot reload)
   npm run dev
   
   # Production
   npm start
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Get Survey Responses
```
GET /api/survey-responses?surveyId={surveyId}&limit={limit}&offset={offset}
```

**Query Parameters:**
- `surveyId` (optional): Filter by survey ID
- `startDate` (optional): Filter responses from this date (ISO format)
- `endDate` (optional): Filter responses until this date (ISO format)
- `status` (optional): Filter by status (`completed`, `partial`, `abandoned`)
- `limit` (optional): Maximum number of responses (default: 1000)
- `offset` (optional): Pagination offset (default: 0)
- `tableName` (optional): Custom table name (default: `SURVEY_RESPONSES`)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### Get Responses for Specific Survey
```
GET /api/survey-responses/:surveyId
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10,
  "total": 50
}
```

### Get Response Count
```
GET /api/survey-responses/:surveyId/count
```

**Response:**
```json
{
  "success": true,
  "count": 50
}
```

## Snowflake Table Structure

The API expects a table with the following structure (adjust column names in `responseService.ts` if different):

```sql
CREATE TABLE SURVEY_RESPONSES (
  id VARCHAR PRIMARY KEY,
  data VARIANT,  -- JSON containing survey data and answers
  timestamp TIMESTAMP_NTZ,
  completed_at TIMESTAMP_NTZ,
  session_id VARCHAR,
  time_spent NUMBER,
  status VARCHAR,
  user_id VARCHAR,
  organization_id VARCHAR,
  exercise_id VARCHAR
);
```

The `data` column should contain JSON in one of these formats:

**Format 1 (Platform format):**
```json
{
  "data": "{\"surveyId\":\"survey_123\",\"surveyTitle\":\"My Survey\",\"answers\":{...}}"
}
```

**Format 2 (Direct format):**
```json
{
  "surveyId": "survey_123",
  "surveyTitle": "My Survey",
  "answers": {...}
}
```

## Customization

### Adjust Table/Column Names

If your Snowflake table has different names, update `src/services/responseService.ts`:

1. Change the default `tableName` parameter
2. Update the `mapRowToResponse` function to match your column names
3. Adjust the SQL queries in `buildQuery` function

### Custom Query Logic

Modify `src/services/responseService.ts` to add custom filtering or data transformation logic.

## Development

```bash
# Run with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## Error Handling

The API includes comprehensive error handling:
- Connection errors are logged and returned with appropriate HTTP status codes
- Query errors are caught and returned as JSON error responses
- Invalid requests return 400 status codes

## Security Notes

- Never commit `.env` file to version control
- Use environment variables for all sensitive credentials
- Consider using Snowflake key-pair authentication for production
- Implement authentication/authorization middleware for production use
- Use HTTPS in production

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify Snowflake credentials in `.env`
2. Check network connectivity to Snowflake
3. Verify warehouse, database, and schema names
4. Check user permissions

### Query Issues

If queries fail:
1. Verify table name and column names match your schema
2. Check SQL syntax in `responseService.ts`
3. Review Snowflake query logs

### Data Format Issues

If response data isn't parsing correctly:
1. Check the structure of your `data` column
2. Update `mapRowToResponse` function to match your format
3. Add logging to see raw data structure

