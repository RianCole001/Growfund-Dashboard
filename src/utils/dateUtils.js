export const safeParseDate = (dateValue) => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? new Date() : dateValue;

  let parsedDate;
  if (typeof dateValue === 'string') {
    parsedDate = new Date(dateValue);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(dateValue.replace(/[TZ]/g, ' ').trim());
    }
    if (isNaN(parsedDate.getTime())) {
      const ts = parseInt(dateValue);
      if (!isNaN(ts)) parsedDate = new Date(ts);
    }
  } else if (typeof dateValue === 'number') {
    parsedDate = new Date(dateValue);
  } else {
    parsedDate = new Date(dateValue);
  }

  return isNaN(parsedDate?.getTime()) ? new Date() : parsedDate;
};

export const formatDate = (dateValue, options = {}) => {
  try {
    const date = safeParseDate(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', ...options });
  } catch {
    return 'N/A';
  }
};

export const formatDateTime = (dateValue) => {
  try {
    const date = safeParseDate(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};
