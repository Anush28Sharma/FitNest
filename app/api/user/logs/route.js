import { NextResponse } from 'next/server';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/db';

export async function POST(req) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    let { date, waterIntake, sleepHours, mood, stressLevel, vitals, meals, exercises, heartRate, systolicBp, diastolicBp, bodyTemperature } = data;

    // Harmonize vitals: if flattened, move to vitals object
    if (!vitals) {
      vitals = {
        heartRate: Number(heartRate) || Number(data.heartRate),
        systolicBP: Number(systolicBp) || Number(data.systolicBp),
        diastolicBP: Number(diastolicBp) || Number(data.diastolicBp),
        temp: Number(bodyTemperature) || Number(data.bodyTemperature)
      };
    }

    // Find the user (Mongoose instance)
    const user = await User.findById(currentUser.id);
    if (!user) {
      console.error('User not found in DB:', currentUser.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Filter out empty rows to prevent validation errors or "0" entries
    const cleanMeals = (meals || []).filter(m => m.dishName && m.dishName.trim() !== "").map(m => ({
        ...m,
        calories: Number(m.calories) || 0,
        protein: Number(m.protein) || 0,
        carbs: Number(m.carbs) || 0,
        fats: Number(m.fats) || 0
    }));

    const cleanExercises = (exercises || []).filter(e => e.activity && e.activity.trim() !== "").map(e => ({
        ...e,
        duration: Number(e.duration) || 0,
        caloriesBurned: Number(e.caloriesBurned) || 0
    }));

    // Calculate totals
    const totalCaloriesConsumed = cleanMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalCaloriesBurned = cleanExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    // Check if a log for this date already exists
    const existingLogIndex = user.dailyLogs.findIndex(log => {
      const d = new Date(log.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === logDate.getTime();
    });

    const newLogEntry = {
      date: logDate,
      waterIntake: Number(waterIntake) || 0,
      sleepHours: Number(sleepHours) || 0,
      mood: mood || 'neutral',
      stressLevel: Number(stressLevel) || 5,
      vitals,
      meals: cleanMeals,
      exercises: cleanExercises,
      totalCaloriesConsumed,
      totalCaloriesBurned
    };

    if (existingLogIndex > -1) {
      user.dailyLogs[existingLogIndex] = newLogEntry;
    } else {
      user.dailyLogs.push(newLogEntry);
    }

    // Sync with healthHistory for AI Analysis compatibility
    // ONLY if vitals are provided and within realistic ranges
    if (vitals && vitals.heartRate >= 30 && vitals.systolicBP >= 50) {
        user.healthHistory.push({
            date: logDate,
            heartRate: vitals.heartRate,
            sleepHours: Number(sleepHours) || 0,
            systolicBp: vitals.systolicBP,
            diastolicBp: vitals.diastolicBP,
            bodyTemperature: vitals.temp || 36.6,
            bmi: user.bmiHistory?.[user.bmiHistory.length - 1]?.bmi || user.weight / ((user.height/100)**2) || 25,
            age: user.age || 25,
            gender: (user.gender && user.gender !== '') ? user.gender : 'male',
            status: 'Analyzed: Result Pending'
        });
    }

    // HEAL HISTORICAL DATA: Mongoose validates the entire array on save.
    // We must ensure legacy records have mandatory snapshot fields.
    if (user.healthHistory && user.healthHistory.length > 0) {
      user.healthHistory = user.healthHistory.map(record => {
        // Normalize legacy key names (systolicBP -> systolicBp, diastolicBP -> diastolicBp, temp/temperature -> bodyTemperature)
        if (record.systolicBP && !record.systolicBp) record.systolicBp = record.systolicBP;
        if (record.diastolicBP && !record.diastolicBp) record.diastolicBp = record.diastolicBP;
        if ((record.temp || record.temperature) && !record.bodyTemperature) record.bodyTemperature = record.temp || record.temperature;

        // Pull vitals if nested under a `vitals` object
        if (!record.heartRate && record.vitals && record.vitals.heartRate) record.heartRate = record.vitals.heartRate;
        if (!record.systolicBp && record.vitals && record.vitals.systolicBP) record.systolicBp = record.vitals.systolicBP;
        if (!record.diastolicBp && record.vitals && record.vitals.diastolicBP) record.diastolicBp = record.vitals.diastolicBP;
        if (!record.bodyTemperature && record.vitals && record.vitals.temp) record.bodyTemperature = record.vitals.temp;

        // Ensure required snapshot fields exist
        if (!record.gender || record.gender === '') record.gender = user.gender || 'male';
        if (!record.age) record.age = user.age || 25;
        if (!record.bmi) record.bmi = user.bmiHistory?.[0]?.bmi || (user.weight && user.height ? (user.weight / ((user.height/100)**2)) : 25);

        // Coerce numeric fields and provide sensible defaults to satisfy schema validation
        record.heartRate = Number(record.heartRate) || 70;
        record.systolicBp = Number(record.systolicBp) || 120;
        record.diastolicBp = Number(record.diastolicBp) || 80;
        record.bodyTemperature = Number(record.bodyTemperature) || 36.6;

        return record;
      });
    }

    try {
        await user.save();
    } catch (saveError) {
        console.error('Mongoose Save Error Profile:', {
            message: saveError.message,
            errors: saveError.errors,
            userId: user._id
        });
        throw saveError;
    }

    return NextResponse.json({ message: 'Log saved successfully', log: newLogEntry }, { status: 200 });
  } catch (error) {
    console.error('Batch Log Submission Failure:', error);
    return NextResponse.json({ 
        error: 'Failed to save health logs',
        details: error.message 
    }, { status: 500 });
  }
}
