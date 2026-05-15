/**
 * Auth API Service
 */

import { handleResponse } from './fetchUtils';

export const authService = {
    login: async (credentials) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    register: async (userData) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    logout: async () => {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });
        // specialized handling for logout as it might return 204 or just 200
        if (!response.ok) throw new Error('Logout failed');
        return true;
    },

    getCurrentUser: async () => {
        const response = await fetch('/api/auth/me');
        if (!response.ok) return null; // Return null if not authenticated
        const data = await response.json();
        return data.user;
    }
};
