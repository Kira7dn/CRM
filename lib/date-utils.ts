/**
 * Date utility functions for consistent timezone handling across the application
 */

/**
 * Format a Date object for datetime-local input (ensures consistent timezone handling)
 * This converts the date to a format that datetime-local input understands while preserving local time
 */
export function formatDateForInput(date: Date): string {
    const d = new Date(date)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Parse a datetime-local string as local time (server-side)
 * This handles the timezone properly when parsing datetime-local values from the client
 */
export function parseDateTimeLocal(dateString: string): Date {
    // Parse the datetime-local string as local time
    const date = new Date(dateString)
    // This is already correct - datetime-local gives local time, we want to keep it as local
    return date
}

/**
 * Check if a date is scheduled for the future
 */
export function isScheduledForFuture(date: Date | undefined): boolean {
    if (!date) return false
    return new Date(date) > new Date()
}

/**
 * Format date for display in user's local timezone
 */
export function formatDateForDisplay(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
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
