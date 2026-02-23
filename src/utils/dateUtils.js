/**
 * Safe date parsing utility to handle different date formats
 * Handles both backend demo data (created_at) and legacy data (date)
 */

export const safeParseDate = (dateValue) => {
  if (!dateValue) {
    return new Date(); // Return current date if no date provided
  }

  // If it's already a Date object, return it
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue;
  }

  // Try to parse the date string
  let parsedDate;
  
  // Handle ISO string format (backend created_at)
  if (typeof dateValue === 'string') {
    // First try direct parsing (works for most ISO strings)
    parsedDate = new Date(dateValue);
    
    // If that fails, try cleaning the string
    if (isNaN(parsedDate.getTime())) {
      // Remove any timezone info that might cause issues
      const cleanDateString = dateValue.replace(/[TZ]/g, ' ').trim();
      parsedDate = new Date(cleanDateString);
    }
    
    // If still invalid, try parsing as timestamp
    if (isNaN(parsedDate.getTime())) {
      const timestamp = parseInt(dateValue);
      if (!isNaN(timestamp)) {
        parsedDate = new Date(timestamp);
      }
    }
  } else if (typeof dateValue === 'number') {
    // Handle numeric timestamp
    parsedDate = new Date(dateValue);
  } else {
    // Fallback for other types
    parsedDate = new Date(dateValue);
  }

  // Return current date if parsing failed
  return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

export const formatDate = (dateValue, options = {}) => {
  try {
    const date = safeParseDate(dateValue);
    
    // Double-check that we have a valid date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date after parsing:', dateValue);
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  } catch (error) {
    console.warn('Date formatting error:', error, 'for value:', dateValue);
    return 'N/A';
  }
};

export const formatDateTime = (dateValue) => {
  try {
    const date = safeParseDate(dateValue);
    
    // Double-check that we have a valid date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date after parsing:', dateValue);
      return 'N/A';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('DateTime formatting error:', error, 'for value:', dateValue);
    return 'N/A';
  }
};