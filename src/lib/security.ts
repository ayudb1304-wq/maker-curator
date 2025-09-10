/**
 * Security utilities for URL validation and sanitization
 */

/**
 * Validates if a URL is safe for redirects
 * Prevents open redirect vulnerabilities by checking for valid protocols and domains
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Block localhost and internal IPs to prevent SSRF
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL to prevent XSS attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove any javascript: or data: protocols
  const cleanUrl = url.replace(/^(javascript|data|vbscript):/i, '');
  
  return cleanUrl.trim();
}

/**
 * Safely opens an external URL with security checks
 */
export function safeOpenUrl(url: string): void {
  const sanitizedUrl = sanitizeUrl(url);
  
  if (!isValidUrl(sanitizedUrl)) {
    console.warn('Attempted to open invalid URL:', url);
    return;
  }

  // Open with security attributes
  const newWindow = window.open(sanitizedUrl, '_blank', 'noopener,noreferrer');
  
  // Ensure the new window doesn't have access to the opener
  if (newWindow) {
    newWindow.opener = null;
  }
}

/**
 * Sanitizes user-generated text content to prevent XSS
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const sanitized = text
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .trim();
  
  // Enforce emoji presentation for ambiguous symbols (e.g., hearts) on iOS Safari
  const withVs16 = sanitized.replace(/([\u2764\u2665\u2600-\u27BF])(?!\uFE0F)/g, '$1\uFE0F');
  
  // Return plain text with emoji VS16 preserved; wrapping is handled at render time
  return withVs16;
}

/**
 * Validates input length to prevent DoS attacks
 */
export function isValidLength(text: string, maxLength: number = 1000): boolean {
  return text && text.length <= maxLength;
}