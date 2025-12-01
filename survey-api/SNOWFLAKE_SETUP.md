# Snowflake Setup Guide

This guide helps you configure the Survey API to connect to your Snowflake database.

## Environment Variables

Based on your existing A3P-After-Action-Reports setup, create a `.env` file with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Snowflake Configuration (matching A3P repo pattern)
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_DATABASE_1=your_database
SNOWFLAKE_SCHEMA_1=your_schema
SNOWFLAKE_WAREHOUSE=your_warehouse

# Optional: Custom table name (defaults to GAME_DATA)
SNOWFLAKE_TABLE_NAME=GAME_DATA

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# API Configuration
API_PREFIX=/api/survey-responses
```

## Alternative Environment Variable Names

The API also supports these alternative names (for compatibility):

- `SNOWFLAKE_USERNAME` (instead of `SNOWFLAKE_USER`)
- `SNOWFLAKE_DATABASE` (instead of `SNOWFLAKE_DATABASE_1`)
- `SNOWFLAKE_SCHEMA` (instead of `SNOWFLAKE_SCHEMA_1`)

## Table Structure

The API expects a table containing survey response data. The default table name is `GAME_DATA`, but you can override it with `SNOWFLAKE_TABLE_NAME`.

### Expected Columns

The API handles multiple column naming conventions (case-insensitive):

**Data Column (required):**
- `data`, `DATA`, `survey_data`, `SURVEY_DATA`, `game_data`, `GAME_DATA`

**ID Column:**
- `id`, `ID`, `response_id`, `RESPONSE_ID`, `game_data_id`, `GAME_DATA_ID`

**Timestamp Columns:**
- `timestamp`, `TIMESTAMP`, `created_at`, `CREATED_AT`, `CREATED_TIMESTAMP`

**Other Columns (optional):**
- `completed_at`, `COMPLETED_AT`
- `session_id`, `SESSION_ID`
- `time_spent`, `TIME_SPENT`
- `status`, `STATUS`
- `user_id`, `USER_ID`
- `organization_id`, `ORGANIZATION_ID`
- `exercise_id`, `EXERCISE_ID`

### Data Format

The `data` column should contain JSON in one of these formats:

**Format 1 (Platform format - nested):**
```json
{
  "data": "{\"surveyId\":\"survey_123\",\"surveyTitle\":\"My Survey\",\"answers\":{\"q1\":\"answer1\"}}"
}
```

**Format 2 (Direct format):**
```json
{
  "surveyId": "survey_123",
  "surveyTitle": "My Survey",
  "answers": {
    "q1": "answer1"
  }
}
```

## Testing the Connection

1. Start the API server:
   ```bash
   npm run dev
   ```

2. Check health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

3. Test fetching responses:
   ```bash
   curl "http://localhost:3000/api/survey-responses?surveyId=your_survey_id"
   ```

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify all Snowflake credentials in `.env`
2. Check that your Snowflake account allows connections from your IP
3. Verify warehouse, database, and schema names are correct
4. Check user permissions (needs SELECT on the table)

### Query Issues

If queries fail:
1. Verify the table name matches your Snowflake schema
2. Check that the `data` column exists and contains JSON
3. Review the SQL queries in `src/services/responseService.ts`
4. Check Snowflake query logs for detailed error messages

### Data Format Issues

If responses aren't parsing correctly:
1. Check the structure of your `data` column
2. Verify JSON is valid (not double-encoded or malformed)
3. Check that `surveyId` exists in the JSON structure
4. Review the `mapRowToResponse` function in `src/services/responseService.ts`

## Custom Table Names

If your survey responses are in a different table, set:

```env
SNOWFLAKE_TABLE_NAME=YOUR_TABLE_NAME
```

Or pass it as a query parameter:
```
GET /api/survey-responses?tableName=YOUR_TABLE_NAME
```

## Security Notes

- Never commit `.env` file to version control
- Use environment variables for all credentials
- Consider using Snowflake key-pair authentication for production
- Implement authentication/authorization middleware for production use
- Use HTTPS in production

