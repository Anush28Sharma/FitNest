import { successResponse, validationError, unauthorizedResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth/session';

function convertHeightToMeters(value, unit) {
  switch (unit) {
    case 'cm':
      return value / 100;
    case 'm':
      return value;
    case 'ft':
      return value * 0.3048;
    default:
      return null;
  }
}

function convertWeightToKg(value, unit) {
  switch (unit) {
    case 'kg':
      return value;
    case 'lb':
      return value * 0.453592;
    default:
      return null;
  }
}

async function bmiHandler(request) {
  const userSession = await getCurrentUser();
  if (!userSession) {
    return unauthorizedResponse();
  }

  const { height, heightUnit, weight, weightUnit } = await request.json();

  // Validate required fields
  if (!height || !weight || !heightUnit || !weightUnit) {
    return validationError('All fields are required');
  }

  // Convert units
  const heightInMeters = convertHeightToMeters(height, heightUnit);
  const weightInKg = convertWeightToKg(weight, weightUnit);

  if (!heightInMeters || !weightInKg) {
    return validationError('Invalid units provided');
  }

  // Calculate BMI
  const bmi = weightInKg / (heightInMeters * heightInMeters);

  // Determine category
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  const bmiValue = parseFloat(bmi.toFixed(2));

  // Save to database
  await connectDB();
  const updatedUser = await User.findByIdAndUpdate(userSession.id, {
    weight: weightInKg,
    height: heightInMeters * 100, // Sync height back to cm
    $push: {
      bmiHistory: {
        bmi: bmiValue,
        category,
        weight: weight,
        height: height,
        date: new Date(),
      },
    },
  }, { new: true });


  return successResponse({
    bmi: bmiValue,
    category,
  });
}

export const POST = withErrorHandler(bmiHandler);
