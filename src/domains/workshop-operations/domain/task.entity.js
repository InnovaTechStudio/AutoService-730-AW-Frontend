/**
 * @file task.entity.js
 * @description Factory function for the Task Entity.
 * This file defines the formal structure of a "Task" within the application.
 * It ensures data consistency across the entire system.
 * @module TaskEntity
 */

/**
 * Factory function that creates a standardized Task object.
 *
 * @function createTask
 * @param {Object} [data={}] - The raw data used to populate the task.
 * Defaults to an empty object if no data is provided.
 * @description This function acts as a "safety net." If the database or a form
 * is missing a field (like a price or a photo), this function assigns a
 * default value so the application doesn't crash.
 *
 * @returns {Object} A structured Task entity.
 * @property {number|null} id - The unique identifier for the task. Defaults to null for new tasks.
 * @property {number|null} workOrderId - The ID of the Work Order this task belongs to.
 * @property {string} description - A detailed explanation of what needs to be done.
 * @property {string} status - The current state of the task. Defaults to 'Pendiente' (Pending).
 * @property {number|null} mechanicId - The unique ID of the mechanic assigned to this task.
 * @property {number} price - The monetary cost associated with this specific task. Defaults to 0.
 * @property {string} photo - A Base64 string or URL representing an image of the work/part.
 */
export const createTask = (data = {}) => ({
    id: data.id || null,
    workOrderId: data.workOrderId || null,
    description: data.description || '',
    status: data.status || 'Pendiente',
    mechanicId: data.mechanicId || null,
    price: data.price || 0,
    photo: data.photo || ''
});