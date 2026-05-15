import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    secretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    secretStarts: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 2) : null,
    secretEnds: process.env.JWT_SECRET ? process.env.JWT_SECRET.slice(-2) : null,
  });
}
