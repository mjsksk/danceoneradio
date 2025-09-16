// Enhanced email validation with disposable email detection
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'tempmail.net', 'maildrop.cc', 'throwaway.email',
  'sharklasers.com', 'guerrillamailblock.com'
];

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): EmailValidationResult => {
  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check email length
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  // Extract domain
  const domain = email.split('@')[1].toLowerCase();

  // Check for disposable email domains
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { isValid: false, error: 'Temporary email addresses are not allowed' };
  }

  // Check for suspicious patterns
  if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, error: 'Invalid email domain' };
  }

  return { isValid: true };
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};