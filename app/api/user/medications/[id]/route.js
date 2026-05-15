import { successResponse, validationError, unauthorizedResponse, serverErrorResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';
import { getCurrentUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

// PUT: Update a medication (e.g., mark as taken)
async function updateMedication(req, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return unauthorizedResponse();
    }

    const resolvedParams = await params;
    const medId = resolvedParams.id;
    if (!medId) {
        return validationError('Medication ID is required.');
    }

    const body = await req.json();
    
    await connectDB();

    // Prepare update object. 
    // Usually, we want to update lastTaken.
    const updateQuery = {};
    if (body.markTaken) {
        updateQuery['medications.$.lastTaken'] = new Date();
    } else {
        // Can add more fields to update here if needed in future
        if (body.name) updateQuery['medications.$.name'] = body.name;
        if (body.dosage) updateQuery['medications.$.dosage'] = body.dosage;
        if (body.unit) updateQuery['medications.$.unit'] = body.unit;
        if (body.frequency) updateQuery['medications.$.frequency'] = body.frequency;
        if (body.time) updateQuery['medications.$.time'] = body.time;
        if (body.instructions) updateQuery['medications.$.instructions'] = body.instructions;
    }

    if (Object.keys(updateQuery).length === 0) {
        return validationError('No valid update fields provided.');
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: user.id, 'medications._id': medId },
        { $set: updateQuery },
        { new: true }
    );

    if (!updatedUser) {
        return validationError('Medication not found or user unauthorized.');
    }

    return successResponse({ message: 'Medication updated successfully' });
}

// DELETE: Remove a medication
async function deleteMedication(req, { params }) {
    const user = await getCurrentUser();
    if (!user) {
        return unauthorizedResponse();
    }

    const resolvedParams = await params;
    const medId = resolvedParams.id;
    if (!medId) {
        return validationError('Medication ID is required.');
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $pull: { medications: { _id: medId } } },
        { new: true }
    );

    if (!updatedUser) {
        return validationError('Medication not found or user unauthorized.');
    }

    return successResponse({ message: 'Medication deleted successfully' });
}

export const PUT = withErrorHandler(updateMedication);
export const DELETE = withErrorHandler(deleteMedication);
