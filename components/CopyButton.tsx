'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!text) return;
        const str = typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text);
        navigator.clipboard.writeText(str);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors shadow-sm"
        >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Copied!' : label}
        </button>
    );
}
