/**
 * Utility functions for generating unique order numbers
 */

/**
 * Generates a unique order number for Panickin' Skywalker
 * Format: PS-YYYY-XXXXXX (where XXXXXX is a 6-digit sequential number)
 * 
 * @param sequenceNumber - Sequential number (should come from database counter)
 * @returns Formatted order number
 */
export function generateOrderNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = sequenceNumber.toString().padStart(6, '0');
  return `PS-${year}-${paddedSequence}`;
}

/**
 * Generates a simple order number based on timestamp and random component
 * Use this as a fallback if you don't have a database sequence
 * 
 * @returns Formatted order number
 */
export function generateSimpleOrderNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `PS-${year}-${timestamp}${random}`;
}

/**
 * Validates order number format
 * 
 * @param orderNumber - Order number to validate
 * @returns True if valid format
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  const pattern = /^PS-\d{4}-\d{6,8}$/;
  return pattern.test(orderNumber);
}