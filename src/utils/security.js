// Security utilities for input sanitization and validation

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8)
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  if (!/(?=.*[a-z])/.test(password))
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/(?=.*[A-Z])/.test(password))
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/(?=.*\d)/.test(password))
    return { isValid: false, message: 'Password must contain at least one number' };
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate numeric input for financial amounts
 */
export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return { isValid: false, message: 'Please enter a valid number' };
  if (num <= 0) return { isValid: false, message: 'Amount must be greater than 0' };
  if (num > 1000000) return { isValid: false, message: 'Amount cannot exceed $1,000,000' };
  return { isValid: true, value: num };
};

/**
 * Rate limiting for API calls
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  canMakeRequest(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(key)) this.requests.set(key, []);

    const validRequests = this.requests.get(key).filter(t => t > windowStart);
    this.requests.set(key, validRequests);

    if (validRequests.length >= maxRequests) return false;

    validRequests.push(now);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure token storage with expiration
 */
export const secureStorage = {
  setItem: (key, value, expirationHours = 24) => {
    const item = {
      value,
      expiry: Date.now() + expirationHours * 60 * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getItem: (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  },
};

/**
 * CSRF token management
 */
export const csrfToken = {
  get: () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null,

  addToHeaders: (headers = {}) => {
    const token = csrfToken.get();
    if (token) headers['X-CSRFToken'] = token;
    return headers;
  },
};
