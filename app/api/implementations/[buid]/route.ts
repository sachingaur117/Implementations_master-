import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Implementation from '@/models/Implementation';

// Always normalise buid to lowercase so 'SAP' and 'sap' both resolve
function normaliseBuid(raw: string) {
    return raw.toLowerCase();
}

// GET /api/implementations/[buid] – Fetch full state
export async function GET(_req: NextRequest, { params }: { params: Promise<{ buid: string }> }) {
    try {
        await connectDB();
        const { buid } = await params;
        const doc = await Implementation.findOne({ buid: normaliseBuid(buid) }).lean();
        if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(doc);
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
    }
}

// PATCH /api/implementations/[buid] – Autosave partial update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ buid: string }> }) {
    try {
        await connectDB();
        const { buid } = await params;
        const updates = await req.json();

        const doc = await Implementation.findOneAndUpdate(
            { buid: normaliseBuid(buid) },
            { $set: updates },
            { returnDocument: 'after', runValidators: false }
        ).lean();

        if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(doc);
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
    }
}

// DELETE /api/implementations/[buid] – Remove an implementation
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ buid: string }> }) {
    try {
        await connectDB();
        const { buid } = await params;
        await Implementation.deleteOne({ buid: normaliseBuid(buid) });
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
    }
}
