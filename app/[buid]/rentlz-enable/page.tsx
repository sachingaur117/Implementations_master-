'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useImplementation } from '@/context/ImplementationContext';
import TicketPreview from '@/components/TicketPreview';
import PermissionModal from '@/components/PermissionModal';

export default function RentlzEnablePage() {
    const router = useRouter();
    const { buid } = useParams<{ buid: string }>();
    const { formData, handleInputChange } = useImplementation();
    const [showPermModal, setShowPermModal] = useState(false);

    const toEnablementContent = `Hi, enable Rentlz for site ${formData.enableSiteUrl}, copy the configs from ${formData.enableRefUrl}\n\nRegards,\n${formData.enableRequestor || '[Requestor]'}`;

    return (
        <div className="space-y-6 animate-fade-in">
            <PermissionModal isOpen={showPermModal} onClose={() => setShowPermModal(false)} />

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Rentlz Enablement</h2>
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Site URL</label>
                        <input type="text" name="enableSiteUrl" value={formData.enableSiteUrl} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Reference URL (Source Config)</label>
                        <input type="text" name="enableRefUrl" value={formData.enableRefUrl} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Requestor Name</label>
                        <input type="text" name="enableRequestor" value={formData.enableRequestor} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all" />
                    </div>
                </div>

                {(formData.enableSiteUrl && formData.enableRefUrl) && (
                    <div className="animate-slide-in">
                        <TicketPreview
                            title={`Rentlz Enablement Request – ${formData.enableSiteUrl}`}
                            content={toEnablementContent}
                            onJiraClick={() => setShowPermModal(true)}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button onClick={() => router.push(`/${buid}/handover`)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center">
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}
