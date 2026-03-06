'use client';

import { ExternalLink } from 'lucide-react';

interface ChecklistItemProps {
    id: string;
    label: string;
    subtext?: string;
    checked: boolean;
    onChange: (id: string, checked: boolean) => void;
    link?: { text: string; url: string };
}

export default function ChecklistItem({ id, label, subtext, checked, onChange, link }: ChecklistItemProps) {
    return (
        <div className={`flex items-start p-3 rounded-lg border transition-all ${checked ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
            <div className="flex items-center h-5">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(id, e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
            </div>
            <div className="ml-3 text-sm text-left">
                <label htmlFor={id} className={`font-bold cursor-pointer ${checked ? 'text-green-800 line-through opacity-70' : 'text-slate-700'}`}>
                    {label}
                </label>
                {subtext && (
                    <p className={`text-xs mt-0.5 ${checked ? 'text-green-600 opacity-70' : 'text-slate-500'}`}>{subtext}</p>
                )}
                {link && !checked && (
                    <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center mt-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                        {link.text} <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                )}
            </div>
        </div>
    );
}
