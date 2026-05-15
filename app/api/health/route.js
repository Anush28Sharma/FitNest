import { successResponse, validationError, unauthorizedResponse, serverErrorResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';
import { getCurrentUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

async function healthHandler(req) {
    // Get current user to fetch history if needed
    const user = await getCurrentUser();
    if (!user) {
        return unauthorizedResponse();
    }

    const body = await req.json();
    let { bmi, heart_rate, sleep_hours, systolic_bp, diastolic_bp, body_temperature } = body;

    // Logic to find the latest BMI:
    // 1. Check the new 'bmiHistory' array first (preferred).
    // 2. Fallback to the old 'healthHistory' array for legacy data.
    if (!bmi) {
        if (user.bmiHistory && user.bmiHistory.length > 0) {
             const lastEntry = user.bmiHistory[user.bmiHistory.length - 1]; // items are pushed, so last is latest
             bmi = lastEntry.bmi;
        } else if (user.healthHistory && user.healthHistory.length > 0) {
             // Fallback: check outdated healthHistory for BMI
             const lastEntry = [...user.healthHistory].reverse().find(h => h.bmi);
             if (lastEntry) bmi = lastEntry.bmi;
        }
    }

    // Validate input
    if (!bmi || !heart_rate || !systolic_bp || !diastolic_bp || !body_temperature) {
      if (!bmi) {
          return validationError('BMI data is missing. Please calculate your BMI first.');
      }
      return validationError('All fields (Heart Rate, BP, Temperature) are required');
    }

    // Calculate Age using Virtual
    const age = user.age || null;

    // Get Gender
    const gender = user.gender || null;

    // Call Python Service
    const baseUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    const pythonServiceUrl = `${baseUrl}/predict`;
    
    // ML Service expects: bmi, heart_rate, systolic_bp, diastolic_bp, body_temperature, age (opt), gender (opt)
    // Note: sleep_hours is NOT sent to ML service anymore as per model update.
    const mlPayload = { 
        bmi: parseFloat(bmi), 
        heart_rate: parseFloat(heart_rate), 
        systolic_bp: parseFloat(systolic_bp), 
        diastolic_bp: parseFloat(diastolic_bp), 
        body_temperature: parseFloat(body_temperature),
        age: age,
        gender: gender
    };

    const response = await fetch(pythonServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return serverErrorResponse(errorData.detail || 'Failed to fetch prediction from ML service');
    }

    const data = await response.json();

    // Save to Database
    await connectDB();
    
    // We strictly save ONLY health assessment data here.
    // BMI updates must go through /api/bmi.
    const newEntry = {
        date: new Date(),
        // SNAPSHOT: Save the BMI used for this prediction
        bmi: parseFloat(bmi),
        age: age || 0,        // Save imputed/calculated age
        gender: gender || 'Other', // Save imputed/profile gender
        heartRate: parseFloat(heart_rate),
        sleepHours: sleep_hours ? parseFloat(sleep_hours) : null,
        systolicBp: parseFloat(systolic_bp),
        diastolicBp: parseFloat(diastolic_bp),
        bodyTemperature: parseFloat(body_temperature),
        status: data.status,
        confidence: data.confidence,
    };

    await User.findByIdAndUpdate(user.id, {
        $push: { healthHistory: newEntry }
    });

    return successResponse(data);
}

export const POST = withErrorHandler(healthHandler);
