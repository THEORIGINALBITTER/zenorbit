/**
 * Orbify Core - Math Helpers
 * Mathematical utilities for position calculations
 */

/**
 * Calculate position of menu item on orbit circle
 * @param {number} angle - Angle in degrees
 * @param {number} radius - Radius of orbit
 * @param {number} startAngle - Starting angle offset
 * @returns {{x: number, y: number}} Position coordinates
 */
export const calculateOrbitPosition = (angle, radius, startAngle = 0) => {
  // Convert to radians and adjust for starting angle
  const rad = ((angle + startAngle) - 90) * (Math.PI / 180);

  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
};

/**
 * Distribute items evenly around a circle
 * @param {number} itemCount - Number of items
 * @param {number} startAngle - Starting angle (default: 0)
 * @param {number} endAngle - Ending angle (default: -180)
 * @returns {number[]} Array of angles
 */
export const distributeEvenly = (itemCount, startAngle = 0, endAngle = -180) => {
  if (itemCount === 1) return [startAngle];

  const angleRange = Math.abs(endAngle - startAngle);
  const step = angleRange / (itemCount - 1);

  return Array.from({ length: itemCount }, (_, i) => startAngle + (step * i * -1));
};

/**
 * Calculate angle between two points
 * @param {{x: number, y: number}} point1
 * @param {{x: number, y: number}} point2
 * @returns {number} Angle in degrees
 */
export const angleBetweenPoints = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

/**
 * Calculate distance between two points
 * @param {{x: number, y: number}} point1
 * @param {{x: number, y: number}} point2
 * @returns {number} Distance
 */
export const distanceBetweenPoints = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 * @param {number} start
 * @param {number} end
 * @param {number} t - Progress (0 to 1)
 * @returns {number} Interpolated value
 */
export const lerp = (start, end, t) => {
  return start + (end - start) * t;
};

/**
 * Normalize angle to -180 to 180 range
 * @param {number} angle
 * @returns {number} Normalized angle
 */
export const normalizeAngle = (angle) => {
  let normalized = angle % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized < -180) normalized += 360;
  return normalized;
};

/**
 * Check if point is within circle
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}} center
 * @param {number} radius
 * @returns {boolean}
 */
export const isPointInCircle = (point, center, radius) => {
  return distanceBetweenPoints(point, center) <= radius;
};

/**
 * Get bounding box for orbit menu
 * @param {number} radius
 * @param {number} buttonSize
 * @returns {{width: number, height: number}}
 */
export const getOrbitBoundingBox = (radius, buttonSize) => {
  const diameter = radius * 2;
  const size = diameter + buttonSize;
  return { width: size, height: size };
};

/**
 * Calculate optimal radius based on item count
 * @param {number} itemCount
 * @param {number} itemSize
 * @returns {number} Recommended radius
 */
export const calculateOptimalRadius = (itemCount, itemSize) => {
  // Ensure items don't overlap by calculating circumference
  const minCircumference = itemCount * itemSize * 1.5; // 1.5x for spacing
  return Math.ceil(minCircumference / (2 * Math.PI));
};

export default {
  calculateOrbitPosition,
  distributeEvenly,
  angleBetweenPoints,
  distanceBetweenPoints,
  clamp,
  lerp,
  normalizeAngle,
  isPointInCircle,
  getOrbitBoundingBox,
  calculateOptimalRadius,
};
