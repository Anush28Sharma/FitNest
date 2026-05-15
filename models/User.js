// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        dateOfBirth: {
            type: Date,
            required: false,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', ''],
            default: '',
            required: false,
        },
        height: {
            type: Number,
            required: false,
        },
        weight: {
            type: Number,
            required: false,
        },
        activityLevel: {
            type: String,
            enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active', ''],
            default: '',
        },
        healthGoal: {
            type: String,
            enum: ['weight_loss', 'muscle_gain', 'maintenance', ''],
            default: '',
        },
        targetWeight: Number,
        targetDate: Date,
        dailyLogs: {
            type: [
                {
                    date: {
                        type: Date,
                        default: Date.now,
                    },
                    waterIntake: Number, // in ml
                    sleepHours: Number,
                    mood: String,
                    stressLevel: Number, // 1-10
                    vitals: {
                        heartRate: Number,
                        systolicBP: Number,
                        diastolicBP: Number,
                        oxygenSat: Number,
                        temp: Number,
                    },
                    meals: [
                        {
                            dishName: String,
                            calories: Number,
                            protein: Number,
                            carbs: Number,
                            fats: Number,
                            type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                        }
                    ],
                    exercises: [
                        {
                            activity: String,
                            duration: Number, // in minutes
                            caloriesBurned: Number,
                        }
                    ],
                    totalCaloriesConsumed: { type: Number, default: 0 },
                    totalCaloriesBurned: { type: Number, default: 0 },
                }
            ],
            default: []
        },
        bmiHistory: {
            type: [
                {
                    bmi: Number,
                    category: String,
                    weight: Number,
                    height: Number,
                    date: {
                        type: Date,
                        default: Date.now,
                    },
                }
            ],
            default: []
        },
        healthHistory: {
            type: [
                {
                    date: {
                        type: Date,
                        default: Date.now,
                    },
                    
                    // Snapshot Data
                    bmi: { type: Number, required: true },
                    age: { type: Number, required: true },      // Snapshot Age
                    gender: { type: String, required: true },   // Snapshot Gender

                    // Health AI Data
                    heartRate: { 
                        type: Number, 
                        required: true,
                        min: [30, 'Heart rate must be at least 30'],
                        max: [250, 'Heart rate must be under 250']
                    },
                    sleepHours: { 
                        type: Number, 
                        min: [0, 'Sleep hours cannot be negative'],
                        max: [24, 'Sleep hours cannot exceed 24']
                    },
                    systolicBp: { 
                        type: Number, 
                        required: true,
                        min: [50, 'Systolic BP must be at least 50'],
                        max: [300, 'Systolic BP must be under 300']
                    },
                    diastolicBp: { 
                        type: Number, 
                        required: true,
                        min: [30, 'Diastolic BP must be at least 30'],
                        max: [200, 'Diastolic BP must be under 200']
                    },
                    bodyTemperature: { 
                        type: Number, 
                        required: true,
                        min: [30, 'Body temperature must be at least 30°C'],
                        max: [45, 'Body temperature must be under 45°C']
                    },
                    status: String,
                    confidence: Number,
                },
            ],
            default: [],
        },
        medications: {
            type: [
                {
                    name: { type: String, required: true },
                    dosage: { type: Number, required: true },
                    unit: { type: String, enum: ['mg', 'ml', 'tablets', 'units'], default: 'mg' },
                    frequency: { type: String, enum: ['Daily', 'Weekly', 'As Needed'], default: 'Daily' },
                    time: { type: String },
                    instructions: { type: String },
                    lastTaken: { type: Date },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            default: []
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true } 
    },
);

// Virtual for Age
UserSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const dob = new Date(this.dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs); 
    return Math.abs(ageDate.getUTCFullYear() - 1970);
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
