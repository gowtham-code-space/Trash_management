-- ======================================================================
-- TIMEZONE CONFIGURATION FOR trash_management_test
-- ======================================================================
-- 
-- PURPOSE:
-- Ensure MySQL stores all DATETIME fields in UTC timezone
-- This allows proper timezone handling across different user timezones
--
-- USAGE:
-- Run this once on your MySQL database to set the timezone to UTC
-- ======================================================================

-- Set global timezone to UTC (requires SUPER privilege)
SET GLOBAL time_zone = '+00:00';

-- Set session timezone to UTC (for current connection)
SET time_zone = '+00:00';

-- Verify timezone settings
SELECT @@global.time_zone, @@session.time_zone, UTC_TIMESTAMP(), NOW();

-- ======================================================================
-- NOTES:
-- 1. UTC_TIMESTAMP() is now used in all INSERT/UPDATE operations
-- 2. Backend converts MySQL datetime to ISO 8601 (with 'Z' suffix)
-- 3. Frontend automatically converts UTC to user's local timezone
-- 4. Example flow:
--    - DB stores: 2026-02-19 05:55:17 (UTC)
--    - Backend returns: 2026-02-19T05:55:17.000Z (ISO 8601)
--    - User in IST (UTC+5:30) sees: 11:25:17 AM
-- ======================================================================
