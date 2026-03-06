'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import { useImplementation } from '@/context/ImplementationContext';
import TicketPreview from '@/components/TicketPreview';
import PermissionModal from '@/components/PermissionModal';

export default function ServerCreationPage() {
    const router = useRouter();
    const { buid } = useParams<{ buid: string }>();
    const { formData, handleInputChange } = useImplementation();
    const [showPermModal, setShowPermModal] = useState(false);

    const toServerContent = `Need to create a new Server for Implementation Team\n\nSheet Link: ${formData.serverSheetUrl}\n\nRegards,\n${formData.tamName || '[TAM Name]'}`;

    return (
        <div className="space-y-6 animate-fade-in">
            <PermissionModal isOpen={showPermModal} onClose={() => setShowPermModal(false)} />
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800 text-sm">
                <h3 className="font-bold mb-2 flex items-center"><Info className="w-4 h-4 mr-2" /> Instructions</h3>
                <p>1. Copy the Google Sheet from the link below.<br />2. Fill in the server details.<br />3. Paste your new sheet link here to generate the TO Ticket content.</p>
                <a href="https://docs.google.com/spreadsheets/d/1E_xeHe1ps0rNn1GtK_Tx3Lanq2zOQ0NEViHZ4dDIPPc/edit?gid=369294238#gid=369294238"
                    target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold mt-2 inline-block">
                    Open Template Sheet
                </a>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Server Request Sheet URL</label>
                <input type="text" name="serverSheetUrl" value={formData.serverSheetUrl} onChange={handleInputChange}
                    placeholder="Paste your filled sheet URL here..."
                    className="w-full p-3 border rounded-lg mb-6 focus:ring-2 ring-indigo-50 outline-none transition-all" />

                {formData.serverSheetUrl && (
                    <div className="animate-slide-in">
                        <TicketPreview
                            title={`Server Creation Request – ${formData.customerName || 'New Client'}`}
                            content={toServerContent}
                            onJiraClick={() => setShowPermModal(true)}
                        />
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button onClick={() => router.push(`/${buid}/new-reqs`)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center">
                        Next Step <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
