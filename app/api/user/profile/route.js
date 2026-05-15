import { getCurrentUser } from '@/lib/auth/session';
import { serializeUser } from '@/lib/auth/serializeUser';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

async function updateProfileHandler(req) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return unauthorizedResponse('Not authenticated');

  await connectDB();

  const { 
    dateOfBirth, gender, height, weight, activityLevel, healthGoal, targetWeight, targetDate,
    name, username, email, mobile
  } = await req.json();

  if (gender && !['male', 'female', 'other', ''].includes(gender)) {
    return errorResponse('Invalid gender value', 400);
  }

  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return errorResponse('Invalid date format', 400);
    if (dob > new Date()) return errorResponse('Date of birth cannot be in the future', 400);

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 10);
    if (dob > minDate) return errorResponse('User must be at least 10 years old', 400);
  }

  const updateData = {};
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  if (gender !== undefined) updateData.gender = gender;
  if (height !== undefined) updateData.height = height;
  if (weight !== undefined) updateData.weight = weight;
  if (activityLevel !== undefined) updateData.activityLevel = activityLevel;
  if (healthGoal !== undefined) updateData.healthGoal = healthGoal;
  if (targetWeight !== undefined) updateData.targetWeight = targetWeight;
  if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
  
  if (name !== undefined) updateData.name = name;
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (mobile !== undefined) updateData.mobile = mobile;

  const updatedUser = await User.findByIdAndUpdate(
    currentUser.id,
    updateData,
    { new: true, select: '-password' }
  );

  if (!updatedUser) return errorResponse('User not found', 404);

  return successResponse({
    user: serializeUser(updatedUser),
    message: 'Profile updated successfully',
  });
}

export const PATCH = withErrorHandler(updateProfileHandler);
