/**
 * Health API Service
 * Handles all health-related data fetching and submission
 */

import { handleResponse } from './fetchUtils';

export const healthService = {
    // Log new health data
    logHealthData: async (data) => {
        const response = await fetch('/api/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Log BMI data
    logBMI: async (data) => {
        const response = await fetch('/api/bmi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
};
