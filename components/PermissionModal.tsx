'use client';

import { ShieldAlert } from 'lucide-react';

export default function PermissionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        <span className="font-bold text-red-600 block mb-1">Admin access required.</span>
                        You don&apos;t have permissions to create issues in this project. Please contact your system administrator or use the &quot;Copy Content&quot; button to copy the ticket.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
