/**
 * User API Service
 */

import { handleResponse } from './fetchUtils';

export const userService = {
    updateProfile: async (profileData) => {
        const response = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        return handleResponse(response);
    }
};
