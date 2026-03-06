import { NextRequest, NextResponse } from 'next/server';

// POST /api/generate – Server-side Dify proxy (API key never exposed to browser)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { buid, customerName, configJSON } = body;

        if (!buid) {
            return NextResponse.json({ error: 'buid is required' }, { status: 400 });
        }

        const apiKey = process.env.DIFY_API_KEY;
        const apiUrl = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/workflows/run';

        if (!apiKey) {
            return NextResponse.json({ error: 'Dify API key not configured on server' }, { status: 500 });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {
                    buid,
                    jira_to_data: JSON.stringify({
                        summary: `Implementation Package for ${customerName || buid}`,
                        description: 'Requirement package generated from portal.',
                    }),
                    config_requirements: configJSON,
                },
                response_mode: 'blocking',
                user: 'rentlz_portal',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || data?.code || 'Dify API request failed');
        }

        const content =
            data?.data?.outputs?.se_ticket_content ||
            data?.data?.outputs?.text ||
            data?.data?.outputs?.answer ||
            data?.answer ||
            'No content returned from AI.';

        return NextResponse.json({ content });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
    }
}
