'use client';

import { useEffect } from 'react';

// ─── Configured via NEXT_PUBLIC_CHATBOT_URL in .env.local ─────────────────
// URL pattern: https://udify.app/chat/<TOKEN>
// Token is extracted from the URL for the embed script
// ──────────────────────────────────────────────────────────────────────────

const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://udify.app/chat/9glzPyXUAA7WEKQO';

// Extract the token from the URL (last path segment)
function extractToken(url: string): string {
    return url.split('/').pop() || '9glzPyXUAA7WEKQO';
}

export default function DifyChatbot() {
    useEffect(() => {
        const DIFY_TOKEN = extractToken(CHATBOT_URL);

        // Must be set before the script executes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).difyChatbotConfig = { token: DIFY_TOKEN };

        // Inject styles
        const style = document.createElement('style');
        style.innerHTML = `
            #dify-chatbot-bubble-button { background-color: #4f46e5 !important; }
            #dify-chatbot-bubble-window { width: 24rem !important; height: 40rem !important; }
        `;
        document.head.appendChild(style);

        // Inject script WITHOUT defer — executes as soon as it downloads,
        // ensuring it sees window.difyChatbotConfig already set.
        const script = document.createElement('script');
        script.src = `https://udify.app/embed.min.js?t=${Date.now()}`; // bust cache
        script.id = DIFY_TOKEN;
        script.async = false; // execute in-order, not deferred
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
            if (document.head.contains(style)) document.head.removeChild(style);
        };
    }, []);

    return null;
}
