'use client';

import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Mail, Send } from 'lucide-react';
import { useImplementation } from '@/context/ImplementationContext';
import CopyButton from '@/components/CopyButton';

export default function HandoverPage() {
    const router = useRouter();
    const { buid } = useParams<{ buid: string }>();
    const { formData } = useImplementation();

    const handoverEmailContent = `Subject: Handover for Implementation - ${formData.customerName || '[Customer Name]'}

Hi Team,

Please find the implementation handover details for ${formData.customerName || '[Customer Name]'}.

- TAM/CAM: ${formData.tamName || '[TAM Name]'}
- Server Details: ${formData.serverSheetUrl || 'N/A'}
- Requirements: ${formData.newReqSheetUrl || 'N/A'}
- Site URL: ${formData.enableSiteUrl || 'N/A'}
- Reference Config: ${formData.enableRefUrl || 'N/A'}
- Requested By: ${formData.enableRequestor || 'N/A'}

Regards,
${formData.tamName || '[TAM Name]'}`;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center mb-8 text-indigo-700 border-b pb-4">
                    <div className="bg-indigo-50 p-2.5 rounded-xl mr-3">
                        <Mail className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">Implementation Handover Email</h2>
                </div>
                <p className="text-sm text-slate-500 mb-6 font-medium">Professional implementation handover draft for the operations team.</p>

                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                    <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Send className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Draft Email Content
                        </div>
                        <CopyButton text={handoverEmailContent} label="COPY EMAIL BODY" />
                    </div>
                    <div className="p-8 bg-[#0D1117]">
                        <pre className="text-sm font-mono text-slate-300 leading-relaxed tracking-tight select-all">
                            {handoverEmailContent}
                        </pre>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={() => router.push(`/${buid}/general-config`)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center">
                    Final Phase: Configs <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}
