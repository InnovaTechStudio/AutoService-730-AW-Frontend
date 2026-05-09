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
                this.tasks = response.data.map(t => createTask(t));
            } finally {
                this.loading = false;
            }
        },
        async fetchTasksByOrder(workOrderId) {
            this.loading = true;
            try {
                const response = await http.get(`/tasks?workOrderId=${workOrderId}`);
                this.tasks = response.data.map(t => createTask(t));
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
        async updateTaskStatus(id, newStatus) {
            const response = await http.patch(`/tasks/${id}`, { status: newStatus });
            const index = this.tasks.findIndex(t => String(t.id) === String(id));
            if (index !== -1) {
                this.tasks.splice(index, 1, createTask(response.data));
            }
        }
    }
});