import { defineStore } from 'pinia';
import http from '../../../shared/infrastructure/http-common';
import { createTask } from '../domain/task.entity';

export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [],
        loading: false
    }),

    actions: {
        async fetchAllTasks() {
            this.loading = true;
            try {
                const response = await http.get('/tasks');
                this.tasks = response.data.map(task => createTask(task));
            } finally {
                this.loading = false;
            }
        },

        async fetchTasksByMechanic(mechanicId) {
            this.loading = true;
            try {
                const response = await http.get('/tasks', {
                    params: { mechanicId }
                });

                this.tasks = response.data.map(task => createTask(task));
            } finally {
                this.loading = false;
            }
        },

        async fetchTasksByOrder(workOrderId) {
            this.loading = true;
            try {
                const response = await http.get('/tasks', {
                    params: { workOrderId }
                });

                this.tasks = response.data.map(task => createTask(task));
            } finally {
                this.loading = false;
            }
        },

        async addTask(taskData) {
            const response = await http.post('/tasks', createTask(taskData));
            this.tasks.push(createTask(response.data));
            return response.data;
        },

        async updateTaskStatus(id, status) {
            const response = await http.patch(`/tasks/${id}`, { status });

            const index = this.tasks.findIndex(task => String(task.id) === String(id));

            if (index !== -1) {
                this.tasks.splice(index, 1, createTask(response.data));
            }

            return response.data;
        },

        async updateMechanicTechnicalReport(id, reportData) {
            const response = await http.patch(`/tasks/${id}`, {
                technicalDiagnosis: reportData.technicalDiagnosis,
                customerExplanation: reportData.customerExplanation,
                internalObservation: reportData.internalObservation,
                evidenceRegistered: reportData.evidenceRegistered,

                requiredMaterials: reportData.requiredMaterials || [],
                usedMaterials: reportData.usedMaterials || [],
                materialsTotal: Number(reportData.materialsTotal || 0),
                materialRequestStatus: reportData.usedMaterials?.length ? 'Materiales solicitados' : 'Sin materiales',

                adminReviewStatus: 'Enviado al Administrador',
                customerReportStatus: 'No visible'
            });

            const index = this.tasks.findIndex(task => String(task.id) === String(id));

            if (index !== -1) {
                this.tasks.splice(index, 1, createTask(response.data));
            }

            return response.data;
        },

        async completeTaskFromMechanic(id, reportData) {
            const response = await http.patch(`/tasks/${id}`, {
                status: 'Completada',

                technicalDiagnosis: reportData.technicalDiagnosis,
                customerExplanation: reportData.customerExplanation,
                internalObservation: reportData.internalObservation,
                evidenceRegistered: reportData.evidenceRegistered,

                requiredMaterials: reportData.requiredMaterials || [],
                usedMaterials: reportData.usedMaterials || [],
                materialsTotal: Number(reportData.materialsTotal || 0),
                materialRequestStatus: reportData.usedMaterials?.length ? 'Materiales utilizados' : 'Sin materiales',

                adminReviewStatus: 'Enviado al Administrador',
                customerReportStatus: 'Visible para Cliente',
                completedAt: new Date().toISOString()
            });

            const index = this.tasks.findIndex(task => String(task.id) === String(id));

            if (index !== -1) {
                this.tasks.splice(index, 1, createTask(response.data));
            }

            return response.data;
        }

    },
    async updateMaterialRequestStatus(id, materialRequestStatus) {
        const response = await http.patch(`/tasks/${id}`, {
            materialRequestStatus
        });

        const index = this.tasks.findIndex(task => String(task.id) === String(id));

        if (index !== -1) {
            this.tasks.splice(index, 1, createTask(response.data));
        }

        return response.data;
    }
});