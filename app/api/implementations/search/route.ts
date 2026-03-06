import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Implementation from '@/models/Implementation';

// GET /api/implementations/search?q=<query>
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const q = req.nextUrl.searchParams.get('q') || '';
        if (!q.trim()) return NextResponse.json([]);

        const regex = new RegExp(q, 'i');
        const results = await Implementation.find({
            $or: [{ buid: regex }, { customerName: regex }],
        })
            .select('buid customerName tamName status currentStep updatedAt')
            .limit(10)
            .lean();

        return NextResponse.json(results);
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
    }
}
