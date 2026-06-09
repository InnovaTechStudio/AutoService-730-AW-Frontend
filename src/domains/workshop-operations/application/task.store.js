/**
 * @file task.store.js
 * @description Task state management store.
 */

import { defineStore } from 'pinia';
import http from '../../../shared/infrastructure/http-common';
import { createTask } from '../domain/task.entity';

// ── CONSTANTS FOR DOMAIN LOGIC ───────────────────────────
/** Standardized system task states for backend syncing */
const TASK_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
};

/** Standardized administrative review workflow statuses */
const REVIEW_STATUS = {
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

/** Standardized visibility levels for customer interaction */
const CUSTOMER_VISIBILITY = {
    HIDDEN: 'HIDDEN',
    VISIBLE: 'VISIBLE'
};

export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [],
        loading: false
    }),

    actions: {
        /**
         * Fetches all tasks.
         *
         * @returns {Promise<void>}
         */
        async fetchAllTasks() {
            this.loading = true;

            try {
                const response = await http.get('/tasks');

                this.tasks = response.data.map((task) =>
                    createTask(task)
                );
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetches tasks assigned to a mechanic.
         *
         * @param {string|number} mechanicId - Mechanic identifier.
         * @returns {Promise<void>}
         */
        async fetchTasksByMechanic(mechanicId) {
            this.loading = true;

            try {
                const response = await http.get('/tasks', {
                    params: { mechanicId }
                });

                this.tasks = response.data.map((task) =>
                    createTask(task)
                );
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetches tasks associated with a work order.
         *
         * @param {string|number} workOrderId - Work order identifier.
         * @returns {Promise<void>}
         */
        async fetchTasksByOrder(workOrderId) {
            this.loading = true;

            try {
                const response = await http.get('/tasks', {
                    params: { workOrderId }
                });

                this.tasks = response.data.map((task) =>
                    createTask(task)
                );
            } finally {
                this.loading = false;
            }
        },

        /**
         * Creates a new task.
         *
         * @param {Object} taskData - Task payload.
         * @returns {Promise<Object>}
         */
        async addTask(taskData) {
            const response = await http.post(
                '/tasks',
                createTask(taskData)
            );

            this.tasks.push(createTask(response.data));

            return response.data;
        },

        /**
         * Updates an existing task.
         *
         * @param {string|number} id - Task identifier.
         * @param {Object} taskData - Updated task payload.
         * @returns {Promise<Object>}
         */
        async updateTask(id, taskData) {
            const response = await http.put(
                `/tasks/${id}`,
                createTask(taskData)
            );

            this._updateLocalTask(id, response.data);

            return response.data;
        },

        /**
         * Deletes a task.
         *
         * @param {string|number} id - Task identifier.
         * @returns {Promise<void>}
         */
        async deleteTask(id) {
            await http.delete(`/tasks/${id}`);

            this.tasks = this.tasks.filter(
                (task) => String(task.id) !== String(id)
            );
        },

        /**
         * Starts a task.
         * Sets state code to operational in-progress value.
         *
         * @param {string|number} id - Task identifier.
         * @returns {Promise<void>}
         */
        async startTask(id) {
            const response = await http.patch(`/tasks/${id}`, {
                status: TASK_STATUS.IN_PROGRESS
            });

            this._updateLocalTask(id, response.data);
        },

        /**
         * Completes a task from mechanic workflow.
         * Escalates to admin approval queue with standard system values.
         *
         * @param {string|number} id - Task identifier.
         * @param {Object} reportData - Completion report payload.
         * @returns {Promise<void>}
         */
        async completeTaskFromMechanic(id, reportData) {
            const payload = {
                status: TASK_STATUS.COMPLETED,
                technicalDiagnosis: reportData.technicalDiagnosis,
                customerExplanation: reportData.customerExplanation,
                internalObservation: reportData.internalObservation,
                evidenceRegistered: reportData.evidenceRegistered,
                parts: reportData.parts || [],
                adminReviewStatus: REVIEW_STATUS.SUBMITTED,
                customerReportStatus: CUSTOMER_VISIBILITY.HIDDEN,
                completedAt: new Date().toISOString()
            };

            const response = await http.patch(
                `/tasks/${id}`,
                payload
            );

            this._updateLocalTask(id, response.data);
        },

        /**
         * Saves mechanic task progress.
         *
         * @param {string|number} id - Task identifier.
         * @param {Object} reportData - Partial report payload.
         * @returns {Promise<void>}
         */
        async saveMechanicAdvance(id, reportData) {
            const payload = {
                technicalDiagnosis: reportData.technicalDiagnosis,
                customerExplanation: reportData.customerExplanation,
                internalObservation: reportData.internalObservation,
                evidenceRegistered: reportData.evidenceRegistered,
                parts: reportData.parts || []
            };

            const response = await http.patch(
                `/tasks/${id}`,
                payload
            );

            this._updateLocalTask(id, response.data);
        },

        /**
         * Approves a completed task.
         * Sets visibility to active client view mode.
         *
         * @param {string|number} id - Task identifier.
         * @returns {Promise<void>}
         */
        async approveTask(id) {
            const payload = {
                adminReviewStatus: REVIEW_STATUS.APPROVED,
                customerReportStatus: CUSTOMER_VISIBILITY.VISIBLE
            };

            const response = await http.patch(
                `/tasks/${id}`,
                payload
            );

            this._updateLocalTask(id, response.data);
        },

        /**
         * Rejects a completed task.
         * Sends task back to production workflow under review status.
         *
         * @param {string|number} id - Task identifier.
         * @returns {Promise<void>}
         */
        async rejectTask(id) {
            const payload = {
                status: TASK_STATUS.IN_PROGRESS,
                adminReviewStatus: REVIEW_STATUS.REJECTED
            };

            const response = await http.patch(
                `/tasks/${id}`,
                payload
            );

            this._updateLocalTask(id, response.data);
        },

        /**
         * Updates task locally inside store state.
         *
         * @private
         * @param {string|number} id - Task identifier.
         * @param {Object} data - Updated task data.
         */
        _updateLocalTask(id, data) {
            const index = this.tasks.findIndex(
                (task) => String(task.id) === String(id)
            );

            if (index === -1) {
                return;
            }

            this.tasks.splice(index, 1, createTask(data));
        }
    }
});