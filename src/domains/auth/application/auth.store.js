/**
 * @file auth.store.js
 * @description **Authentication Store (Pinia)**
 *
 * This store manages all authentication-related state and logic for the AutoService application.
 * It handles user login, logout, session persistence, and provides computed properties
 * (getters) for authentication status, user role, and workshop identification.
 *
 * Part of the **Auth** domain in the Domain-Driven Design (DDD) architecture - Application Layer.
 */
import { defineStore } from 'pinia';
import http from '../../../shared/infrastructure/http-common';

/**
 * Authentication Store definition using Pinia.
 *
 * @typedef {Object} AuthState
 * @property {Object|null} user - Currently logged-in user data
 * @property {boolean} loading - Indicates if an authentication request is in progress
 * @property {string|null} error - Error message if login fails
 */
export const useAuthStore = defineStore('auth', {
    /**
     * Initial state of the authentication store.
     * Restores user session from localStorage on page reload.
     */
    state: () => ({
        /** @type {Object|null} */
        user: JSON.parse(localStorage.getItem('user')) || null,
        /** @type {boolean} */
        loading: false,
        /** @type {string|null} */
        error: null
    }),
    /**
     * Getters are computed properties that derive values from the state.
     * They are cached and reactive.
     */
    getters: {
        /**
         * Checks if a user is currently authenticated.
         *
         * @returns {boolean} True if user is logged in
         */
        isAuthenticated: (state) => !!state.user,
        /**
         * Returns the current workshop ID associated with the logged-in user.
         *
         * @returns {string|null}
         */
        currentWorkshopId: (state) => state.user ? state.user.id : null,
        /**
         * Returns the role of the current user ('admin' or 'mechanic').
         *
         * @returns {string}
         */
        userRole: (state) => state.user?.role || 'admin',
        /**
         * Returns the mechanic ID (only available for mechanic users).
         *
         * @returns {string|null}
         */
        mechanicId: (state) => state.user?.mechanicId || null
    },
    /**
     * Actions contain business logic and can be asynchronous.
     * They can modify the state directly.
     */
    actions: {
        /**
         * Logs in a user with email and password.
         *
         * Supports two login flows:
         * 1. Demo mechanic login (hardcoded credentials)
         * 2. Real API login for workshop administrators
         *
         * On successful login, the user data is saved to localStorage for persistence.
         *
         * @param {string} email - User's email address
         * @param {string} password - User's password
         * @returns {Promise<boolean>} Returns true if login was successful
         */
        async login(email, password) {
            this.loading = true;
            this.error = null;

            // Demo login for mechanic role
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

            // Production login via API
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
        /**
         * Logs out the current user.
         * Clears user data from both memory and localStorage.
         */
        logout() {
            this.user = null;
            localStorage.removeItem('user');
        }
    }
});