import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

// Generate a PDF report for the current user between startDate and endDate
export async function POST(req) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { startDate, endDate } = body || {};

    await connectDB();
    const user = await User.findById(currentUser.id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Parse dates; default to last 30 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    // Filter healthHistory and dailyLogs by date range
    const healthHistory = (user.healthHistory || []).filter(h => {
      const d = new Date(h.date || h._id?.getTimestamp?.() || Date.now());
      return d >= start && d <= end;
    });

    const dailyLogs = (user.dailyLogs || []).filter(l => {
      const d = new Date(l.date || Date.now());
      return d >= start && d <= end;
    });

    // Use pdf-lib to avoid native font/AFM file issues on the server
    const pdfLib = await import('pdf-lib');
    const { PDFDocument, StandardFonts, rgb } = pdfLib;

    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageSize = { width: 595.28, height: 841.89 }; // A4 in points
    let page = pdfDoc.addPage([pageSize.width, pageSize.height]);
    let y = pageSize.height - 50;

    const marginLeft = 50;
    const lineHeight = 14;

    // Header
    page.drawText('FitNest Health Report', { x: marginLeft, y: y, size: 18, font: helveticaFont, color: rgb(0.07,0.07,0.07) });
    y -= lineHeight * 1.5;
    page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: marginLeft, y: y, size: 9, font: helveticaFont, color: rgb(0.42,0.45,0.48) });
    y -= lineHeight * 1.5;

    // User summary
    page.drawText('User Summary', { x: marginLeft, y: y, size: 12, font: helveticaFont, color: rgb(0.07,0.07,0.07) });
    y -= lineHeight;
    page.drawText(`Name: ${user.name || user.username || '—'}`, { x: marginLeft, y: y, size: 10, font: helveticaFont });
    y -= lineHeight;
    page.drawText(`Email: ${user.email || '—'}`, { x: marginLeft, y: y, size: 10, font: helveticaFont });
    y -= lineHeight;
    page.drawText(`Age: ${user.age || '—'}    Gender: ${user.gender || '—'}`, { x: marginLeft, y: y, size: 10, font: helveticaFont });
    y -= lineHeight;
    page.drawText(`Period: ${start.toLocaleDateString()} — ${end.toLocaleDateString()}`, { x: marginLeft, y: y, size: 10, font: helveticaFont });
    y -= lineHeight * 1.2;

    // Health entries header
    page.drawText('Health Entries', { x: marginLeft, y: y, size: 12, font: helveticaFont });
    y -= lineHeight;

    if (healthHistory.length === 0) {
      page.drawText('No health analysis records found for the selected date range.', { x: marginLeft, y: y, size: 10, font: helveticaFont, color: rgb(0.42,0.45,0.48) });
      y -= lineHeight;
    } else {
      // Table columns
      const cols = [marginLeft, marginLeft + 90, marginLeft + 140, marginLeft + 200, marginLeft + 290, marginLeft + 350];
      // Header row
      page.drawText('Date', { x: cols[0], y: y, size: 9, font: helveticaFont });
      page.drawText('BMI', { x: cols[1], y: y, size: 9, font: helveticaFont });
      page.drawText('HR', { x: cols[2], y: y, size: 9, font: helveticaFont });
      page.drawText('BP', { x: cols[3], y: y, size: 9, font: helveticaFont });
      page.drawText('Temp', { x: cols[4], y: y, size: 9, font: helveticaFont });
      page.drawText('Status', { x: cols[5], y: y, size: 9, font: helveticaFont });
      y -= lineHeight * 0.8;

      for (const entry of healthHistory) {
        if (y < 80) {
          page = pdfDoc.addPage([pageSize.width, pageSize.height]);
          y = pageSize.height - 50;
        }
        const dateStr = new Date(entry.date || Date.now()).toLocaleDateString();
        const bmi = entry.bmi ?? '—';
        const hr = entry.heartRate ?? (entry.heart_rate ?? '—');
        const bp = `${entry.systolicBp || entry.systolic_bp || '—'}/${entry.diastolicBp || entry.diastolic_bp || '—'}`;
        const temp = entry.bodyTemperature ?? entry.temp ?? '—';
        const status = entry.status || '—';

        page.drawText(dateStr, { x: cols[0], y: y, size: 9, font: helveticaFont });
        page.drawText(String(bmi), { x: cols[1], y: y, size: 9, font: helveticaFont });
        page.drawText(String(hr), { x: cols[2], y: y, size: 9, font: helveticaFont });
        page.drawText(bp, { x: cols[3], y: y, size: 9, font: helveticaFont });
        page.drawText(String(temp), { x: cols[4], y: y, size: 9, font: helveticaFont });
        page.drawText(status, { x: cols[5], y: y, size: 9, font: helveticaFont });
        y -= lineHeight * 0.9;
      }
    }

    // Daily logs summary on a new page
    const logsPage = pdfDoc.addPage([pageSize.width, pageSize.height]);
    let ly = pageSize.height - 50;
    logsPage.drawText('Daily Logs Summary', { x: marginLeft, y: ly, size: 12, font: helveticaFont });
    ly -= lineHeight;

    if (dailyLogs.length === 0) {
      logsPage.drawText('No daily logs in the selected date range.', { x: marginLeft, y: ly, size: 10, font: helveticaFont, color: rgb(0.42,0.45,0.48) });
      ly -= lineHeight;
    } else {
      for (const l of dailyLogs) {
        if (ly < 80) {
          // add new page
          ly = pageSize.height - 50;
        }
        logsPage.drawText(`${new Date(l.date).toLocaleDateString()} — Water: ${l.waterIntake || 0}ml • Sleep: ${l.sleepHours || '--'} hrs • Calories In: ${l.totalCaloriesConsumed || 0} • Calories Out: ${l.totalCaloriesBurned || 0}`,
          { x: marginLeft, y: ly, size: 10, font: helveticaFont });
        ly -= lineHeight * 0.9;
      }
    }

    // Footer on last page
    logsPage.drawText('FitNest — Professional Health Summary', { x: marginLeft, y: 30, size: 9, font: helveticaFont, color: rgb(0.42,0.45,0.48) });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fitnest-report-${start.toISOString().slice(0,10)}_to_${end.toISOString().slice(0,10)}.pdf"`,
      }
    });
  } catch (err) {
    console.error('Report generation failed', err);
    return NextResponse.json({ error: 'Failed to generate report', details: err.message }, { status: 500 });
  }
}
