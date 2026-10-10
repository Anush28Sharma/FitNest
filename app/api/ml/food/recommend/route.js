import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const goal = searchParams.get('goal') || 'maintenance';

    const baseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    try {
        const response = await fetch(`${baseUrl}/food/recommend?goal=${encodeURIComponent(goal)}`);
        if (!response.ok) {
            console.error('Food recommend proxy error: ML service returned', response.status);
            return NextResponse.json({ error: 'ML service error' }, { status: 502 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Food recommend proxy error:', error);
        return NextResponse.json({ error: 'Failed to reach ML service' }, { status: 500 });
    }
}
