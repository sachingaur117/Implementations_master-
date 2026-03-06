'use client';

import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useImplementation } from '@/context/ImplementationContext';

const PROFILE_LINKS = [
    { label: 'Employee Profile Creation (Single/Bulk)', url: 'https://docs.google.com/document/d/1E6PIJg-pOg4UEt8JS_72B9rWBf9RNG0hQcbTrrB-vYI/edit?usp=sharing' },
    { label: 'Vendor Profile Creation', url: 'https://help-moveinsync.freshdesk.com/support/solutions/articles/1070000080098' },
    { label: 'Cab / Vehicle Profile Creation', url: 'https://help-moveinsync.freshdesk.com/support/solutions/articles/1070000080102' },
    { label: 'Driver Profile Creation', url: 'https://help-moveinsync.freshdesk.com/support/solutions/articles/1070000086298' },
];

export default function ProfileDataPage() {
    const router = useRouter();
    const { buid } = useParams<{ buid: string }>();
    const { formData, handleInputChange } = useImplementation();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Profile and Data Creation</h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Proper onboarding is essential for smooth operations. Use the links below to bulk upload or manually create required profiles.
                </p>
                <div className="space-y-4">
                    {PROFILE_LINKS.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                            <a href={item.url} target="_blank" rel="noreferrer"
                                className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                VIEW DOC <ExternalLink className="w-3 h-3 ml-1.5" />
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Mark profiles as created</span>
                    <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="profileDataCompleted" id="profileDataCompleted"
                            checked={formData.profileDataCompleted} onChange={handleInputChange}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label htmlFor="profileDataCompleted" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={() => router.push(`/${buid}/external-vendors`)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center">
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}
