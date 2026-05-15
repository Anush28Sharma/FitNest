import { successResponse, validationError, unauthorizedResponse, serverErrorResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';
import { getCurrentUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

// GET: Fetch user's medications
async function getMedications(req) {
    const user = await getCurrentUser();
    if (!user) {
        return unauthorizedResponse();
    }

    await connectDB();
    const dbUser = await User.findById(user.id).lean();
    if (!dbUser) {
        return unauthorizedResponse();
    }

    return new Response(JSON.stringify(dbUser.medications || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

// POST: Add a new medication
async function addMedication(req) {
    const user = await getCurrentUser();
    if (!user) {
        return unauthorizedResponse();
    }

    const body = await req.json();
    const { name, dosage, unit, frequency, time, instructions } = body;

    if (!name || !dosage) {
        return validationError('Medicine Name and Dosage are required.');
    }

    await connectDB();
    
    const newMedication = {
        name,
        dosage: parseFloat(dosage),
        unit: unit || 'mg',
        frequency: frequency || 'Daily',
        time,
        instructions
    };

    const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $push: { medications: newMedication } },
        { new: true }
    );

    if (!updatedUser) {
        return serverErrorResponse('User not found.');
    }

    // Return the newly added medication (the last one in the array)
    const addedMedication = updatedUser.medications[updatedUser.medications.length - 1];

    return new Response(JSON.stringify(addedMedication), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const GET = withErrorHandler(getMedications);
export const POST = withErrorHandler(addMedication);
