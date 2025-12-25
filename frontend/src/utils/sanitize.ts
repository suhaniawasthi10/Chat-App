/**
 * Utility functions for sanitizing user input to prevent XSS attacks.
 */

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * Use this for any user-generated content before rendering to HTML.
 */
export const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Sanitizes a URL to prevent javascript: and data: protocol attacks.
 * Returns empty string if URL is potentially dangerous.
 */
export const sanitizeUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
        return '';
    }
    return url;
};

/**
 * Truncates text to a maximum length with ellipsis.
 * Also escapes HTML for safe rendering.
 */
export const truncateAndEscape = (text: string, maxLength: number): string => {
    const escaped = escapeHtml(text);
    if (escaped.length <= maxLength) return escaped;
    return escaped.substring(0, maxLength) + '...';
};
