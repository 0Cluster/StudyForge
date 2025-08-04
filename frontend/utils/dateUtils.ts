/**
 * Parses a date value which might be in different formats:
 * - ISO string format (e.g., '2023-07-23T00:00:00')
 * - Array format from Java LocalDateTime [year, month, day, hour, minute, second, nano]
 * - Date object
 * 
 * @param dateValue The date value to parse
 * @returns A properly formatted JavaScript Date object or null if invalid
 */
export function parseDate(dateValue: any): Date | null {
  if (!dateValue) {
    return null;
  }
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's an array (from Java LocalDateTime serialization)
  if (Array.isArray(dateValue)) {
    // Format: [year, month, day, hour, minute, second, nanosecond?]
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    // Note: JavaScript months are 0-based, but Java's are 1-based
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  // If it's a string (ISO format)
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

/**
 * Formats a date for display
 * 
 * @param dateValue The date value to format (can be string, array, or Date)
 * @param format The format to use ('short', 'medium', 'long', or 'full')
 * @returns A formatted date string or empty string if invalid
 */
export function formatDate(
  dateValue: any, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const date = parseDate(dateValue);
  
  if (!date) {
    return '';
  }
  
  try {
    return date.toLocaleDateString(undefined, { dateStyle: format });
  } catch (e) {
    // Fallback in case dateStyle isn't supported
    return date.toLocaleDateString();
  }
}
