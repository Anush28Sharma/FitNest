import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) return NextResponse.json([]);

    const baseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    try {
        const response = await fetch(`${baseUrl}/food/search?q=${q}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Food search proxy error:', error);
        return NextResponse.json({ error: 'Failed to reach ML service' }, { status: 500 });
    }
}
