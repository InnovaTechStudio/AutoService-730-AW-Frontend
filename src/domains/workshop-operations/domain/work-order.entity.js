/**
 * @file work-order.entity.js
 * @description Factory function for the Work Order Entity.
 * This file defines the core business model for a "Work Order" and ensures that
 * every order created has a unique tracking identity and a valid start date.
 * @module WorkOrderEntity
 */

/**
 * Factory function that creates a standardized Work Order object.
 *
 * @function createWorkOrder
 * @param {Object} [data={}] - The raw information used to build the work order.
 * @description This function serves as the "Birth Certificate" for a work order.
 * If certain data is missing (like a tracking code or a start date), the function
 * intelligently generates them automatically.
 *
 * @returns {Object} A structured Work Order entity.
 * @property {number|null} id - The unique database identifier.
 * @property {string} trackingCode - A unique, human-readable code (e.g., "AS-G4H2K")
 * used by customers to track their vehicle's progress.
 * @property {number|null} vehicleId - Link to the specific vehicle being repaired.
 * @property {number|null} customerId - Link to the owner of the vehicle.
 * @property {string} description - Summary of the general problem or requested service.
 * @property {string} status - Current workflow stage. Defaults to 'En Proceso' (In Progress).
 * @property {string} startDate - The date the work began (YYYY-MM-DD format). Defaults to today.
 * @property {string} estimatedDate - The promised completion date.
 * @property {number} price - Total estimated or final cost for the entire work order.
 */
export const createWorkOrder = (data = {}) => ({
    id: data.id || null,
    trackingCode: data.trackingCode || `AS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    vehicleId: data.vehicleId || null,
    customerId: data.customerId || null,
    description: data.description || '',
    status: data.status || 'En Proceso',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    estimatedDate: data.estimatedDate || '',
    price: data.price || 0 
});