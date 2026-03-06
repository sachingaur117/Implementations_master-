'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Settings, Plus, Minus, CheckCircle, Circle, FileText, Hash, AlignLeft, Code2 } from 'lucide-react';
import { useImplementation, makeDefaultRequirement, NewRequirement } from '@/context/ImplementationContext';

const STAGES: { key: keyof NewRequirement; label: string; color: string }[] = [
    { key: 'confirmedWithClient', label: 'Confirmed with Client', color: 'text-blue-600 border-blue-300 bg-blue-50' },
    { key: 'plannedAndPickedForGrooming', label: 'Planned & Picked for Grooming', color: 'text-purple-600 border-purple-300 bg-purple-50' },
    { key: 'grooming', label: 'Grooming', color: 'text-amber-600 border-amber-300 bg-amber-50' },
    { key: 'delivered', label: 'Delivered', color: 'text-green-600 border-green-300 bg-green-50' },
];

function RequirementCard({ req, index, onUpdate }: {
    req: NewRequirement;
    index: number;
    onUpdate: (index: number, field: keyof NewRequirement, value: string | boolean) => void;
}) {
    const lastChecked = STAGES.reduce((acc, stage) => req[stage.key] ? stage.key : acc, '' as string);
    const lastIdx = STAGES.findIndex(s => s.key === lastChecked);

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                    {index + 1}
                </span>
                <span className="text-sm font-bold text-slate-600 truncate">
                    {req.title || `New Requirement ${index + 1}`}
                </span>
            </div>

            <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        <FileText className="w-3 h-3" /> Title
                    </label>
                    <input
                        type="text"
                        value={req.title}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        placeholder="Requirement title..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 ring-indigo-200 outline-none"
                    />
                </div>

                {/* Ticket Number */}
                <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        <Hash className="w-3 h-3" /> Ticket Number
                    </label>
                    <input
                        type="text"
                        value={req.ticketNumber}
                        onChange={(e) => onUpdate(index, 'ticketNumber', e.target.value)}
                        placeholder="e.g. CAP-1234"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 ring-indigo-200 outline-none font-mono"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        <AlignLeft className="w-3 h-3" /> Description
                    </label>
                    <textarea
                        value={req.description}
                        onChange={(e) => onUpdate(index, 'description', e.target.value)}
                        placeholder="Brief description of the requirement..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 ring-indigo-200 outline-none resize-none"
                    />
                </div>

                {/* Status tickmarks */}
                <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                        <Code2 className="w-3 h-3" /> Development Stage
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {STAGES.map((stage, si) => {
                            const checked = !!req[stage.key];
                            const isPast = si <= lastIdx;
                            return (
                                <button
                                    key={stage.key}
                                    type="button"
                                    onClick={() => onUpdate(index, stage.key, !checked)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all text-left ${checked
                                        ? stage.color + ' shadow-sm'
                                        : isPast
                                            ? 'border-slate-200 bg-slate-50 text-slate-400'
                                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {checked
                                        ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        : <Circle className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
                                    }
                                    <span className="leading-tight">{stage.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NewReqsPage() {
    const router = useRouter();
    const { buid } = useParams<{ buid: string }>();
    const { formData, newRequirements, handleInputChange, setFormData, setNewRequirements, updateRequirement } = useImplementation();

    // Sync requirements array with requirementCount
    useEffect(() => {
        const count = formData.requirementCount || 0;
        setNewRequirements((prev) => {
            if (prev.length === count) return prev;
            if (count > prev.length) {
                const extra = Array.from({ length: count - prev.length }, () => makeDefaultRequirement());
                return [...prev, ...extra];
            }
            return prev.slice(0, count);
        });
    }, [formData.requirementCount, setNewRequirements]);

    const handleCountChange = (val: number) => {
        const clamped = Math.max(1, Math.min(50, val));
        setFormData((prev) => ({ ...prev, requirementCount: clamped }));
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            hasDevelopmentRequirements: e.target.checked,
            requirementCount: e.target.checked ? (prev.requirementCount || 1) : 0,
        }));
        if (!e.target.checked) {
            setNewRequirements([]);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Sheet URL card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">New Requirement CAP Tickets</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Make CAP tickets for all new requirements. A link of sheets is attached below.</p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">New Requirements Sheet URL</label>
                    <input
                        type="text"
                        name="newReqSheetUrl"
                        value={formData.newReqSheetUrl}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Development Requirements section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Section header + toggle */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <Code2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Development Requirements</h3>
                            <p className="text-slate-500 text-sm mt-0.5">Are there any new requirements which require development?</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                        <input
                            type="checkbox"
                            checked={formData.hasDevelopmentRequirements}
                            onChange={handleToggle}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                </div>

                {formData.hasDevelopmentRequirements ? (
                    <div className="p-8 space-y-6">
                        {/* Count input — same style as External Vendors */}
                        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                            <div className="flex items-center gap-4">
                                <Code2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">How many new development requirements?</label>
                                    <p className="text-xs text-slate-500">Each requirement gets its own tracking card below.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleCountChange((formData.requirementCount || 1) - 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={formData.requirementCount || ''}
                                        onChange={(e) => handleCountChange(parseInt(e.target.value, 10) || 1)}
                                        className="w-14 text-center font-black text-lg border border-slate-200 rounded-lg p-1 focus:ring-2 ring-indigo-200 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleCountChange((formData.requirementCount || 0) + 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Note: not counted in progress */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
                            <span className="text-amber-500">ℹ️</span>
                            Development requirements are tracked separately and do not count towards the implementation progress bar.
                        </div>

                        {/* Requirement cards */}
                        {newRequirements.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {newRequirements.map((req, i) => (
                                    <RequirementCard key={i} req={req} index={i} onUpdate={updateRequirement} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400 font-medium">
                        <Code2 className="w-12 h-12 mx-auto mb-3 text-slate-300 opacity-50" />
                        No development requirements — toggle above if needed.
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button onClick={() => router.push(`/${buid}/profile-data`)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center">
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}
