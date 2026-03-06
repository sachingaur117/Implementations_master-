'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronRight, GitMerge, BookOpen, Settings, Terminal, CheckSquare, Users, Plus, Minus } from 'lucide-react';
import { useImplementation, makeDefaultVendor } from '@/context/ImplementationContext';
import ChecklistItem from '@/components/ChecklistItem';

export default function ExternalVendorsPage() {
    const router = useRouter();
    const { buid } = useParams<{ buid: string }>();
    const { formData, vendors, setFormData, setVendors, handleVendorCheck, handleVendorNameChange } = useImplementation();
    const [activeTab, setActiveTab] = useState(0);

    // Keep vendors array in sync with vendorCount
    useEffect(() => {
        const count = formData.vendorCount || 0;
        setVendors((prev) => {
            if (prev.length === count) return prev;
            if (count > prev.length) {
                const extra = Array.from({ length: count - prev.length }, () => makeDefaultVendor());
                return [...prev, ...extra];
            }
            return prev.slice(0, count);
        });
        // Clamp active tab
        if (activeTab >= count && count > 0) setActiveTab(count - 1);
    }, [formData.vendorCount, setVendors, activeTab]);

    const totalTasks = vendors.length * 10;
    const completedTasks = vendors.reduce(
        (sum, v) => sum + Object.values(v.checklist).filter(Boolean).length,
        0
    );
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, hasExternalVendors: e.target.checked }));
        if (!e.target.checked) {
            setFormData((prev) => ({ ...prev, vendorCount: 0 }));
        }
    };

    const handleCountChange = (val: number) => {
        const clamped = Math.max(1, Math.min(20, val));
        setFormData((prev) => ({ ...prev, vendorCount: clamped }));
    };

    const activeVendor = vendors[activeTab];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                {/* Header + Toggle */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <GitMerge className="w-6 h-6 mr-3 text-indigo-600" /> External Vendor Integration
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Configure APIs and sync with third-party transport providers.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600">Has External Vendors?</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.hasExternalVendors}
                                onChange={handleToggle}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                    </div>
                </div>

                {!formData.hasExternalVendors ? (
                    <div className="text-center py-12 text-slate-400 font-medium">
                        <GitMerge className="w-12 h-12 mx-auto mb-3 text-slate-300 opacity-50" />
                        No external vendors required for this setup.
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {/* Vendor Count */}
                        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                            <div className="flex items-center gap-4">
                                <Users className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">How many external vendors?</label>
                                    <p className="text-xs text-slate-500">Each vendor gets their own onboarding checklist.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCountChange((formData.vendorCount || 1) - 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={formData.vendorCount || ''}
                                        onChange={(e) => handleCountChange(parseInt(e.target.value, 10) || 1)}
                                        className="w-14 text-center font-black text-lg border border-slate-200 rounded-lg p-1 focus:ring-2 ring-indigo-200 outline-none"
                                    />
                                    <button
                                        onClick={() => handleCountChange((formData.vendorCount || 0) + 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {vendors.length > 0 && (
                            <>
                                {/* Overall Progress */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                        <span>Overall Onboarding Progress (all vendors)</span>
                                        <span>{completedTasks} of {totalTasks} Completed</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                {/* Vendor Tabs */}
                                <div className="flex flex-wrap gap-2">
                                    {vendors.map((vendor, i) => {
                                        const vendorCompleted = Object.values(vendor.checklist).filter(Boolean).length;
                                        const isActive = activeTab === i;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setActiveTab(i)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isActive
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                                    }`}
                                            >
                                                {vendor.name || `Vendor ${i + 1}`}
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {vendorCompleted}/10
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Vendor Panel */}
                                {activeVendor && (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden animate-fade-in">
                                        {/* Vendor Name */}
                                        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Vendor Name</label>
                                            <input
                                                type="text"
                                                value={activeVendor.name}
                                                onChange={(e) => handleVendorNameChange(activeTab, e.target.value)}
                                                placeholder={`e.g. Vendor ${activeTab + 1} Name`}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 ring-indigo-200 outline-none"
                                            />
                                        </div>

                                        <div className="p-5 space-y-5">
                                            {/* Phase 1 */}
                                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                                                    <BookOpen className="w-4 h-4 mr-2 text-slate-500" /> Phase 1: Communication & Master Data
                                                </h3>
                                                <div className="space-y-2">
                                                    <ChecklistItem id="shareDoc" label="Share Integration Process Document with Vendor" checked={activeVendor.checklist.shareDoc}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)}
                                                        link={{ text: 'View Official Integration Doc', url: 'https://helpcenter.moveinsync.com/support/solutions/articles/1070000136017-external-vendor-integration-process' }} />
                                                    <ChecklistItem id="masterData" label="Share Master Data (Booking Types, Cities, Cab Types)" subtext="Required so vendor can configure mappings on their end." checked={activeVendor.checklist.masterData}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                </div>
                                            </div>

                                            {/* Phase 2 */}
                                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                                                    <Settings className="w-4 h-4 mr-2 text-slate-500" /> Phase 2: MIS System Configuration
                                                </h3>
                                                <div className="space-y-2">
                                                    <ChecklistItem id="vendorProfile" label="Create Vendor Profile" subtext="In 'Manage Vendor' Page (Needs ID, Name, POC, Email, Phone)" checked={activeVendor.checklist.vendorProfile}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                    <ChecklistItem id="vehicleType" label="Create Vehicle Type & Contract" subtext="Only required if billing is needed (Requires Rate Card)" checked={activeVendor.checklist.vehicleType}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                    <ChecklistItem id="virtualCab" label="Create Virtual Cab Profile" subtext="Vendor, Vehicle Type, Registration No., Garage Name, Geocode" checked={activeVendor.checklist.virtualCab}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                </div>
                                            </div>

                                            {/* Phase 3 */}
                                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                                                    <Terminal className="w-4 h-4 mr-2 text-slate-500" /> Phase 3: API Setup & Endpoints
                                                </h3>
                                                <div className="space-y-2">
                                                    <ChecklistItem id="shareApiDocs" label="Share MIS API Documentation with Vendor" checked={activeVendor.checklist.shareApiDocs}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)}
                                                        link={{ text: 'View Booking Management APIs', url: 'https://helpcenter.moveinsync.com/support/solutions/articles/1070000134486-rentlz-booking-management-api' }} />
                                                    <ChecklistItem id="receiveVendorApis" label="Receive Vendor APIs" subtext="Vendor must provide their Create, Update, and Cancel endpoints" checked={activeVendor.checklist.receiveVendorApis}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                </div>
                                            </div>

                                            {/* Phase 4 */}
                                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                                                    <CheckSquare className="w-4 h-4 mr-2 text-slate-500" /> Phase 4: Final Configuration Tickets
                                                </h3>
                                                <div className="space-y-2">
                                                    <ChecklistItem id="toDevBackend" label="Raise TO for Rentlz Developer" subtext="Assign to dev for backend API configuration (Example: TO-19141)" checked={activeVendor.checklist.toDevBackend}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                    <ChecklistItem id="toServerCreds" label="Raise TO for Server Team" subtext="Assign to Deepanshu/team to generate Username & Password (Example: TO-21280)" checked={activeVendor.checklist.toServerCreds}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                    <ChecklistItem id="consulConfig" label="Add Vendor to MIS Consul" subtext="Add Vendor GUID/ID to 'externalServiceVendor' (Ask POD Rentlz)" checked={activeVendor.checklist.consulConfig}
                                                        onChange={(id, checked) => handleVendorCheck(activeTab, id, checked)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button onClick={() => router.push(`/${buid}/rentlz-enable`)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center">
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}
