import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { weight, heart_rate, systolic_bp, diastolic_bp, body_temperature } = body;

    if (!weight || !heart_rate || !systolic_bp || !diastolic_bp || !body_temperature) {
        return NextResponse.json({ error: 'All fields (Weight, HR, BP, Temp) are required for simulation.' }, { status: 400 });
    }

    // Connect DB to fetch height for BMI calculation
    await connectDB();
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure height exists (Check top-level, then fall back to history)
    let heightCm = dbUser.height;
    
    if (!heightCm || heightCm <= 0) {
        // Fallback 1: Check BMI History
        if (dbUser.bmiHistory && dbUser.bmiHistory.length > 0) {
            heightCm = dbUser.bmiHistory[dbUser.bmiHistory.length - 1].height;
        } 
        // Fallback 2: Check Health History
        else if (dbUser.healthHistory && dbUser.healthHistory.length > 0) {
            const hWithBmi = [...dbUser.healthHistory].reverse().find(h => h.bmi);
            if (hWithBmi && dbUser.weight) {
                // Approximate height if we have weight and BMI
                heightCm = Math.sqrt(dbUser.weight / hWithBmi.bmi) * 100;
            }
        }
    }

    if (!heightCm || heightCm <= 0) {
        return NextResponse.json({ error: 'User height is required to calculate simulated BMI. Please calculate BMI or update profile first.' }, { status: 400 });
    }

    // Calculate simulated BMI
    const heightM = heightCm / 100;
    const simulatedBmi = weight / (heightM * heightM);

    // Provide default age/gender if missing
    const age = dbUser.age || 25;
    const gender = dbUser.gender || 'male';

    // Call Python Service explicitly for simulation (No save to DB)
    const baseUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    const pythonServiceUrl = `${baseUrl}/predict`;
    
    const mlPayload = { 
        bmi: simulatedBmi,
        heart_rate: parseFloat(heart_rate), 
        systolic_bp: parseFloat(systolic_bp), 
        diastolic_bp: parseFloat(diastolic_bp), 
        body_temperature: parseFloat(body_temperature),
        age: age,
        gender: gender
    };

    console.log('ML Simulation Payload:', mlPayload);

    const response = await fetch(pythonServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ML Service Error:', errorData);
        return NextResponse.json({ error: errorData.detail || 'Failed to fetch simulated prediction.' }, { status: 500 });
    }

    const data = await response.json();
    console.log('ML Simulation Result:', data);

    // Return the response directly
    return NextResponse.json({
        simulatedBmi: simulatedBmi.toFixed(1),
        ...data
    }, { status: 200 });

  } catch (error) {
    console.error('Simulation Route Error:', error);
    return NextResponse.json({ error: 'Failed to process simulation', details: error.message }, { status: 500 });
  }
}
