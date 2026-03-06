'use client';

import { FileText, AlertCircle } from 'lucide-react';
import CopyButton from './CopyButton';
import JiraLogo from './JiraLogo';

interface TicketPreviewProps {
    title: string;
    content: string;
    warning?: string;
    onJiraClick?: () => void;
}

export default function TicketPreview({ title, content, warning, onJiraClick }: TicketPreviewProps) {
    const safeContent = typeof content === 'object' && content !== null
        ? JSON.stringify(content, null, 2)
        : String(content);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center font-bold text-slate-700 text-sm">
                    <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                    {title}
                </div>
                <div className="flex items-center space-x-2">
                    {onJiraClick && (
                        <button
                            onClick={onJiraClick}
                            className="flex items-center text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                            <JiraLogo className="w-3.5 h-3.5 mr-1.5" />
                            Create Jira Ticket
                        </button>
                    )}
                    <CopyButton text={safeContent} label="Copy Content" />
                </div>
            </div>
            <div className="p-4 bg-slate-50/50 text-left">
                <pre className="text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                    {safeContent}
                </pre>
            </div>
            {warning && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-amber-700 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-2" />
                    {warning}
                </div>
            )}
        </div>
    );
}
