/**
 * @file task.entity.js
 * @description Factory for task domain entity.
 */

/**
 * Creates a normalized task entity.
 *
 * @param {Object} [data={}] - Raw task data.
 * @returns {Object} Normalized task entity.
 */
export const createTask = (data = {}) => ({
    id: data.id,

    workOrderId: data.workOrderId,

    mechanicId: data.mechanicId || null,

    description: data.description || '',

    status: data.status || 'PENDING',

    priority: data.priority || 'MEDIUM',

    estimatedTime: data.estimatedTime || 0,

    laborPrice: data.laborPrice || 0.0,

    technicalDiagnosis:
        data.technicalDiagnosis || '',

    customerExplanation:
        data.customerExplanation || '',

    internalObservation:
        data.internalObservation || '',

    evidenceRegistered:
        data.evidenceRegistered || '',

    adminReviewStatus:
        data.adminReviewStatus || '',

    parts: data.parts || []
});