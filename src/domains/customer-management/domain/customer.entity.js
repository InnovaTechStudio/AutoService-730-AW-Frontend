/**
 * @file customer.entity.js
 * @description **Customer Entity**
 *
 * This file defines the Customer domain entity.
 * In Domain-Driven Design (DDD), an Entity represents a core business object
 * with identity and encapsulates the business rules and data structure for customers.
 *
 * The Customer entity acts as a factory function that normalizes and validates
 * customer data coming from forms, API responses, or local state.
 */

/**
 * Creates a normalized Customer entity.
 *
 * This factory function ensures consistency in customer data structure throughout the application.
 * It provides default values for missing properties, preventing undefined errors and maintaining
 * data integrity across layers (Presentation → Application → Infrastructure).
 *
 * @param {Object} [data={}] - Raw customer data (from form, API, or database)
 * @param {string|number|null} [data.id] - Unique identifier for the customer
 * @param {string} [data.workshopId] - ID of the workshop this customer belongs to
 * @param {string} [data.fullName] - Customer's full name
 * @param {string} [data.dni] - National ID / Document number (e.g., DNI in Peru)
 * @param {string} [data.email] - Customer's email address
 * @param {string} [data.phone] - Customer's phone number
 *
 * @returns {Object} A normalized Customer entity with guaranteed properties
 *
 * @example
 * // Creating a new customer
 * const newCustomer = Customer({
 *   fullName: "Juan Pérez",
 *   dni: "72345678",
 *   email: "juan.perez@email.com",
 *   phone: "987654321"
 * });
 *
 * // Normalizing API response
 * const customerFromApi = Customer(apiResponse.data);
 */
export const Customer = (data = {}) => ({
    /**
     * Unique identifier of the customer.
     * Can be null for new customers before they are saved to the backend.
     * @type {string|number|null}
     */
    id: data.id || null,
    /**
     * ID of the workshop this customer is associated with.
     * Important for multi-workshop environments.
     * @type {string}
     */
    workshopId: data.workshopId || '',
    /**
     * Customer's complete name.
     * @type {string}
     */
    fullName: data.fullName || '',
    /**
     * National identification document number (DNI, Passport, etc.).
     * @type {string}
     */
    dni: data.dni || '',
    /**
     * Customer's email address for communications and notifications.
     * @type {string}
     */
    email: data.email || '',
    /**
     * Customer's contact phone number.
     * @type {string}
     */
    phone: data.phone || ''
});