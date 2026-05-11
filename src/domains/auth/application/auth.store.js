import { defineStore } from 'pinia';
import http from '../../../shared/infrastructure/http-common';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        loading: false,
        error: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
        currentWorkshopId: (state) => state.user ? state.user.id : null,
        userRole: (state) => state.user?.role || 'admin',
        mechanicId: (state) => state.user?.mechanicId || null
    },
    actions: {
        async login(email, password) {
            this.loading = true;
            this.error = null;

            if (email === 'mechanic@autoservice.com' && password === '123456') {
                const mechanicUser = {
                    id: 'MECH-1',
                    name: 'Roberto Sánchez',
                    email: 'mechanic@autoservice.com',
                    role: 'mechanic',
                    mechanicId: 'M-1',
                    workshopId: 'WS-1'
                };

                this.user = mechanicUser;
                localStorage.setItem('user', JSON.stringify(mechanicUser));
                this.loading = false;
                return true;
            }

            try {
                const response = await http.get('/workshops', {
                    params: {
                        email,
                        password
                    }
                });

                if (response.data.length > 0) {
                    const workshopUser = response.data[0];
                    this.user = workshopUser;
                    localStorage.setItem('user', JSON.stringify(workshopUser));
                    return true;
                } else {
                    this.error = "Credenciales incorrectas";
                    return false;
                }
            } catch (err) {
                this.error = "Error de conexión";
                return false;
            } finally {
                this.loading = false;
            }
        },
        logout() {
            this.user = null;
            localStorage.removeItem('user');
        }
    }
});