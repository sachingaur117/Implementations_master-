'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { ImplementationProvider } from '@/context/ImplementationContext';

export default function BuidLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ buid: string }>;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const resolvedParams = React.use(params);
    const buid = resolvedParams.buid;

    return (
        <ImplementationProvider initialBuid={buid}>
            <div className="flex min-h-screen bg-slate-50">
                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 w-64 z-30 transform transition-transform duration-300 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar buid={buid} />
                </div>

                {/* Main */}
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                    {/* Top Bar */}
                    <div className="bg-white border-b border-slate-200 p-4 flex items-center sticky top-0 z-20">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-slate-100 text-slate-600">
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="ml-4 font-bold text-slate-700">Rentlz Implementation Portal</span>
                    </div>

                    {/* Page Content */}
                    <div className="p-8 max-w-5xl mx-auto text-left">
                        {children}
                    </div>
                </div>
            </div>
        </ImplementationProvider>
    );
}
