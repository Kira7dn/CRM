/**
 * Date/Time Utilities - CRM Standard
 *
 * GOLDEN RULES:
 * 1. Backend chỉ biết UTC
 * 2. Frontend chịu trách nhiệm timezone
 * 3. Date != Calendar Date (Instant vs Civil Date)
 * 4. Mongo lưu Date, API trả ISO
 * 5. Không format trước UI
 */

// ========================================
// CORE UTILITIES
// ========================================

/**
 * Convert ISO string to Date object
 * Use this for parsing dates from API/DB
 */
export const fromISO = (iso: string): Date => new Date(iso)

/**
 * Convert Date to ISO string (UTC)
 * Use this before sending to API/DB
 */
export const toISO = (date: Date): string => date.toISOString()

/**
 * Get current UTC timestamp as ISO string
 */
export const now = (): string => new Date().toISOString()

// ========================================
// CALENDAR DATE UTILITIES
// ========================================

/**
 * Create UTC start of day (midnight UTC)
 * Use for calendar dates without specific time
 *
 * Example: toUTCStartOfDay(2025, 1, 15) → "2025-01-15T00:00:00.000Z"
 */
export const toUTCStartOfDay = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

/**
 * Create calendar date with local time → UTC ISO string
 * Use for AI-generated schedules with default publish time
 *
 * Example (GMT+7):
 * calendarDateWithLocalTime(2025, 1, 15, 20, 0)
 * → "2025-01-15T20:00" local → "2025-01-15T13:00:00.000Z" UTC
 *
 * @param year - Full year (2025)
 * @param month - Month 1-12
 * @param day - Day 1-31
 * @param hours - Local hour 0-23 (default: 20 = 8 PM)
 * @param minutes - Local minutes 0-59 (default: 0)
 */
export const calendarDateWithLocalTime = (
  year: number,
  month: number,
  day: number,
  hours: number = 20,
  minutes: number = 0
): string => {
  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  const hoursStr = String(hours).padStart(2, '0')
  const minutesStr = String(minutes).padStart(2, '0')
  const datetimeLocal = `${year}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}`
  return datetimeLocalToUTC(datetimeLocal)
}

/**
 * Check if two dates are same calendar day (local timezone)
 * Use for filtering posts by day in calendar views
 */
export const isSameCalendarDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

/**
 * Convert Date/ISO to YYYY-MM-DD string
 * Use for comparing dates without time component
 */
export const toCalendarDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ========================================
// DATETIME PICKER UTILITIES
// ========================================

/**
 * Convert datetime-local input → UTC ISO string
 * Use for scheduler/datetime pickers
 *
 * Example (GMT+7):
 * "2025-01-15T08:00" → "2025-01-15T01:00:00.000Z"
 */
export const datetimeLocalToUTC = (datetimeLocal: string): string => {
  return new Date(datetimeLocal).toISOString()
}

/**
 * Convert UTC ISO string → datetime-local format
 * Use for displaying scheduled times in datetime-local input
 *
 * Example (GMT+7):
 * "2025-01-15T01:00:00.000Z" → "2025-01-15T08:00"
 */
export const utcToDatetimeLocal = (isoString: string): string => {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// ========================================
// VALIDATION UTILITIES
// ========================================

/**
 * Check if date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() < Date.now()
}

/**
 * Check if date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() > Date.now()
}

// ========================================
// DISPLAY UTILITIES
// ========================================

/**
 * Format date for display (Vietnamese locale, local timezone)
 * Use for showing dates to users in UI
 */
export const formatDateForDisplay = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  })
}