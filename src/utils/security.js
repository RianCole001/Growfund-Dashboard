// Security utilities for input sanitization and validation

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
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
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    
  addToHeaders: (headers = {}) => {
    const token = csrfToken.get();
    if (token) {
      headers['X-CSRFToken'] = token;
    }
    return headers;
  }
};document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  },
 key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
  }
};

/**
 * CSRF token management
 */
export const csrfToken = {
  get: () => {
    return , JSON.stringify(item));
  },
  
  getItem: (me => time > windowStart);
    this.requests.set(key, validRequests);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
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
      value: value,
      expiry: Date.now() + (expirationHours * 60 * 60 * 1000)
    };
    localStorage.setItem(keyts = requests.filter(ti $1,000,000' };
  }
  
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
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key);
    
    // Remove old requests outside the window
    const validReques
    return { isValid: false, message: 'Amount cannot exceedgreater than 0' };
  }
  
  if (num > 1000000) {
    return { isValid: false, message: 'Amount must be  enter a valid number' };
  }
  
  if (num <= 0) {ort const validateAmount = (amount) => {
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Pleaseount - Amount to validate
 * @returns {object} - Validation result
 */
expber' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate numeric input for financial amounts
 * @param {string|number} am 'Password must contain at least one num return { isValid: false, message: