/**
 * @file mechanic.entity.js
 * @description **Mechanic Entity**
 *
 * This file defines the Mechanic domain entity for the Staff Coordination bounded context.
 *
 * In Domain-Driven Design (DDD), the Mechanic entity represents a workshop staff member
 * with identity and specific business attributes (specialty, workload capacity, etc.).
 *
 * The `createMechanic` factory function normalizes raw data from forms, API responses,
 * or local state, ensuring consistency and providing sensible defaults across the application.
 */

/**
 * Creates a normalized Mechanic entity.
 *
 * This factory function ensures that every mechanic object in the application
 * has a consistent structure and safe default values.
 *
 * @param {Object} [data={}] - Raw mechanic data
 * @param {string|number} [data.id] - Unique identifier of the mechanic
 * @param {string} [data.fullName] - Mechanic's full name
 * @param {string} [data.specialty] - Area of expertise (e.g., "Engine", "Electrical", "Bodywork")
 * @param {number} [data.maxCapacity] - Maximum number of simultaneous tasks the mechanic can handle
 *
 * @returns {Object} A normalized Mechanic entity
 *
 * @example
 * // Creating a new mechanic
 * const newMechanic = createMechanic({
 *   fullName: "Carlos Ramírez",
 *   specialty: "Engine",
 *   maxCapacity: 4
 * });
 *
 * // Normalizing data from API
 * const mechanicFromApi = createMechanic(apiResponse.data);
 */
export const createMechanic = (data = {}) => ({
    id: data.id || null,
    fullName: data.fullName || '',
    specialty: data.specialty || '',
    maxCapacity: data.maxCapacity || 5
});