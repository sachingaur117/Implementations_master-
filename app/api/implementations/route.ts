import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Implementation from '@/models/Implementation';

// Utility: derive a URL-safe slug from a name
function toSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// GET /api/implementations – List all implementations
export async function GET() {
    try {
        await connectDB();
        const docs = await Implementation.find(
            { buid: { $exists: true, $ne: null } },
            { buid: 1, customerName: 1, tamName: 1, productName: 1, implementationStartDate: 1, plannedEndDate: 1, implementationStatus: 1, status: 1, currentStep: 1, completionPercent: 1, createdAt: 1 }
        ).sort({ updatedAt: -1 }).lean();
        return NextResponse.json(docs);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/implementations – Create a new implementation
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { customerName, tamName } = body;

        if (!customerName || !tamName) {
            return NextResponse.json({ error: 'customerName and tamName are required' }, { status: 400 });
        }

        const buid = toSlug(customerName);

        // Upsert: create if not exists, return existing if already created
        const doc = await Implementation.findOneAndUpdate(
            { buid },
            { $setOnInsert: { buid, customerName, tamName } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(doc, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
