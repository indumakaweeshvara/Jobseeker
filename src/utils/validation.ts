/**
 * Validation utilities for JobSeeker App
 * @module utils/validation
 */

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param password - Password string to validate
 * @returns boolean indicating if password meets requirements
 */
export const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};

/**
 * Validates phone number format (Sri Lankan)
 * @param phone - Phone number string to validate
 * @returns boolean indicating if phone is valid
 */
export const isValidPhone = (phone: string): boolean => {
    // Sri Lankan phone format: +94 or 0 followed by 9 digits
    const phoneRegex = /^(\+94|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Formats salary display
 * @param amount - Salary amount
 * @returns Formatted salary string
 */
export const formatSalary = (amount: number | string): string => {
    if (typeof amount === 'string') return amount;
    return `LKR ${amount.toLocaleString()}`;
};

/**
 * Formats date to readable string
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
