'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Server, Users, Settings, Database, GitMerge, Lock, Mail, Settings2,
    CheckCircle, Circle, MinusCircle, LogOut, Search, Loader2
} from 'lucide-react';
import { useImplementation } from '@/context/ImplementationContext';

interface SearchResult {
    buid: string;
    customerName: string;
    tamName: string;
    status: string;
    currentStep: number;
}

const NAV_ITEMS = [
    { id: 'identity', label: '1. Client Identity', icon: Users },
    { id: 'server-creation', label: '2. Server Request', icon: Server },
    { id: 'new-reqs', label: '3. New Requirements', icon: Settings },
    { id: 'profile-data', label: '4. Profile & Data', icon: Database },
    { id: 'external-vendors', label: '5. External Vendors', icon: GitMerge },
    { id: 'rentlz-enable', label: '6. Rentlz Enablement', icon: Lock },
    { id: 'handover', label: '7. Handover Summary', icon: Mail },
];

const CONFIG_ITEMS = [
    { id: 'general-config', label: '8. General Configs', icon: Settings2 },
];

export default function Sidebar({ buid }: { buid: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const { formData, vendors, isSaving } = useImplementation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    const completedVendorTasks = vendors.reduce((sum, v) => sum + Object.values(v.checklist).filter(Boolean).length, 0);
    const totalVendorTasks = vendors.length * 10;

    const getStatus = (stepId: string): 'Completed' | 'Pending' | 'N/A' => {
        switch (stepId) {
            case 'identity': return (formData.customerName && formData.tamName) ? 'Completed' : 'Pending';
            case 'server-creation': return formData.serverSheetUrl ? 'Completed' : 'Pending';
            case 'new-reqs': return formData.newReqSheetUrl ? 'Completed' : 'Pending';
            case 'profile-data': return formData.profileDataCompleted ? 'Completed' : 'Pending';
            case 'external-vendors':
                if (!formData.hasExternalVendors) return 'N/A';
                return totalVendorTasks > 0 && completedVendorTasks === totalVendorTasks ? 'Completed' : 'Pending';
            case 'rentlz-enable': return (formData.enableSiteUrl && formData.enableRefUrl && formData.enableRequestor) ? 'Completed' : 'Pending';
            case 'handover': return (formData.customerName && formData.serverSheetUrl) ? 'Completed' : 'Pending';
            case 'general-config': return 'Pending';
            default: return 'Pending';
        }
    };

    const isActive = (stepId: string) => pathname.endsWith(stepId);

    const handleSearch = useCallback(async (q: string) => {
        setQuery(q);
        if (!q.trim()) { setResults([]); return; }
        setSearching(true);
        try {
            const res = await fetch(`/api/implementations/search?q=${encodeURIComponent(q)}`);
            if (res.ok) setResults(await res.json());
        } finally {
            setSearching(false);
        }
    }, []);

    const NavItem = ({ id, label, icon: Icon, status }: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; status: 'Completed' | 'Pending' | 'N/A' }) => (
        <button
            onClick={() => router.push(`/${buid}/${id}`)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all mb-1 group ${isActive(id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'}`}
        >
            <div className="flex items-center min-w-0">
                <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive(id) ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                <span className="truncate text-left">{label}</span>
            </div>
            <div className="flex-shrink-0 ml-3">
                {status === 'Completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {status === 'Pending' && <Circle className="w-4 h-4 text-slate-600" />}
                {status === 'N/A' && <MinusCircle className="w-4 h-4 text-slate-700 opacity-50" />}
            </div>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Brand */}
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center">
                    <Server className="w-6 h-6 mr-2 text-indigo-400" /> Rentlz
                </h2>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Implementation Hub</p>
                {isSaving && (
                    <div className="flex items-center mt-2 text-xs text-indigo-400">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...
                    </div>
                )}
            </div>

            {/* Search (Recent Projects) */}
            <div className="px-4 py-3 border-b border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by client name..."
                        className="w-full bg-slate-800 text-slate-300 text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                    />
                </div>
                {query && (
                    <div className="mt-2 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        {searching && (
                            <div className="flex items-center justify-center py-3 text-xs text-slate-400">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Searching...
                            </div>
                        )}
                        {!searching && results.length === 0 && (
                            <p className="text-xs text-slate-500 text-center py-3">No results found</p>
                        )}
                        {results.map((r) => (
                            <button
                                key={r.buid}
                                onClick={() => { setQuery(''); setResults([]); router.push(`/${r.buid}/identity`); }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-700 transition-colors"
                            >
                                <p className="text-xs font-bold text-indigo-400">{r.buid}</p>
                                <p className="text-[10px] text-slate-400">{r.customerName}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <div className="text-[10px] font-black text-slate-600 uppercase mb-3 ml-3 tracking-[2px]">Onboarding</div>
                {NAV_ITEMS.map((item) => (
                    <NavItem key={item.id} {...item} status={getStatus(item.id)} />
                ))}
                <div className="text-[10px] font-black text-slate-600 uppercase mb-3 ml-3 mt-6 tracking-[2px]">Configuration</div>
                {CONFIG_ITEMS.map((item) => (
                    <NavItem key={item.id} {...item} status={getStatus(item.id)} />
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="text-[10px] text-slate-600 font-mono mb-2 truncate">Client: {formData.customerName || buid}</div>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center text-slate-400 text-xs hover:text-white font-bold"
                >
                    <LogOut className="w-3 h-3 mr-2" /> Switch Environment
                </button>
            </div>
        </div>
    );
}
