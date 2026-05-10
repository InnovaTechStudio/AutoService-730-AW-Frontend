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
                this.tasks = response.data.map((task) => createTask(task));
            } finally {
                this.loading = false;
            }
        },

        async fetchTasksByOrder(workOrderId) {
            this.loading = true;

            try {
                const response = await http.get(`/tasks?workOrderId=${workOrderId}`);
                this.tasks = response.data.map((task) => createTask(task));
            } finally {
                this.loading = false;
            }
        },

        async addTask(taskData) {
            const newTask = createTask(taskData);
            const response = await http.post('/tasks', newTask);
            this.tasks.push(createTask(response.data));
            return response.data;
        },

        async updateTask(id, taskData) {
            const response = await http.put(`/tasks/${id}`, createTask(taskData));
            const index = this.tasks.findIndex((task) => String(task.id) === String(id));

            if (index !== -1) {
                this.tasks.splice(index, 1, createTask(response.data));
            }

            return response.data;
        },

        async updateTaskStatus(id, newStatus) {
            const response = await http.patch(`/tasks/${id}`, { status: newStatus });
            const index = this.tasks.findIndex((task) => String(task.id) === String(id));

            if (index !== -1) {
                this.tasks.splice(index, 1, createTask(response.data));
            }

            return response.data;
        },

        async deleteTask(id) {
            await http.delete(`/tasks/${id}`);
            this.tasks = this.tasks.filter((task) => String(task.id) !== String(id));
        }
    }
});