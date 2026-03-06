'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Settings2, Truck, Settings, UserCheck, ShieldCheck, CheckCircle, Loader } from 'lucide-react';
import { useImplementation } from '@/context/ImplementationContext';
import TicketPreview from '@/components/TicketPreview';
import PermissionModal from '@/components/PermissionModal';

export default function GeneralConfigPage() {
    const { buid } = useParams<{ buid: string }>();
    const { formData, handleInputChange } = useImplementation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [seResult, setSeResult] = useState<string | null>(null);
    const [showPermModal, setShowPermModal] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateSE = async () => {
        if (!formData.buid && !buid) { setError('Please ensure a BUID is set.'); return; }
        setIsSubmitting(true);
        setSeResult(null);
        setError('');

        const configJSON = JSON.stringify({
            buid: formData.buid || buid,
            global: { cities: formData.citiesToAdd, booking_types: formData.bookingTypes, cab_types: formData.cabTypes, otp: formData.otpType },
            vendor_allocation: { auto_allocation_needed: formData.autoVendor, strategy: formData.autoVendor ? formData.vendorFlavor : 'MANUAL' },
            manager_approval: {
                enabled: formData.managerApproval,
                role: formData.approverType,
                custom_logic: formData.managerApprovalCustom
                    ? { cities: formData.managerCities, booking_types: formData.managerBookingTypes, cab_types: formData.managerCabTypes }
                    : 'Apply to All',
            },
            marshal_logic: {
                required: formData.marshalReq === 'Yes',
                first_last_female_feature: formData.autoMarshalDarkHours,
                custom_logic: formData.marshalCustom
                    ? { cities: formData.marshalCities, booking_types: formData.marshalBookingTypes, cab_types: formData.marshalCabTypes, gender: formData.marshalGender }
                    : 'Standard Night Protocol',
            },
        });

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buid: formData.buid || buid, customerName: formData.customerName, configJSON }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Generation failed');
            setSeResult(data.content);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Generation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <PermissionModal isOpen={showPermModal} onClose={() => setShowPermModal(false)} />

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                <div className="flex items-center text-indigo-700 border-b pb-4">
                    <Settings2 className="w-6 h-6 mr-3" />
                    <h2 className="text-xl font-bold text-indigo-700">General Configuration</h2>
                </div>

                {/* Global Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cities</label>
                        <textarea name="citiesToAdd" value={formData.citiesToAdd} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg h-20 text-sm focus:ring-2 ring-indigo-50 outline-none transition-all"
                            placeholder="Bangalore, Delhi..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Booking Types</label>
                        <input type="text" name="bookingTypes" value={formData.bookingTypes} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg text-sm focus:ring-2 ring-indigo-50 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cab Types</label>
                        <input type="text" name="cabTypes" value={formData.cabTypes} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg text-sm focus:ring-2 ring-indigo-50 outline-none transition-all" />
                    </div>
                </div>

                {/* Auto Vendor + OTP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-700 flex items-center"><Truck className="w-4 h-4 mr-2" /> Auto Vendor</span>
                            <input type="checkbox" name="autoVendor" checked={formData.autoVendor} onChange={handleInputChange} className="h-5 w-5" />
                        </div>
                        {formData.autoVendor && (
                            <select name="vendorFlavor" value={formData.vendorFlavor} onChange={handleInputChange}
                                className="w-full p-2 border rounded text-sm mt-2 bg-white outline-none">
                                <option value="PERCENTAGE">Percentage Based</option>
                                <option value="PRIORITY">Priority Based</option>
                            </select>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 flex items-center mb-2"><Settings className="w-4 h-4 mr-2" /> OTP Config</span>
                        <select name="otpType" value={formData.otpType} onChange={handleInputChange}
                            className="w-full p-2 border rounded text-sm bg-white outline-none">
                            <option>One OTP per trip</option>
                            <option>Two OTPs (Sign-in/out)</option>
                        </select>
                    </div>
                </div>

                {/* Manager Approval */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-700 flex items-center"><UserCheck className="w-4 h-4 mr-2" /> Manager Approval</span>
                        <input type="checkbox" name="managerApproval" checked={formData.managerApproval} onChange={handleInputChange} className="h-5 w-5" />
                    </div>
                    {formData.managerApproval && (
                        <div className="space-y-3 animate-fade-in">
                            <select name="approverType" value={formData.approverType} onChange={handleInputChange}
                                className="w-full p-2 border rounded text-sm bg-white outline-none">
                                <option>Reporting Manager</option>
                                <option>Transport Manager</option>
                            </select>
                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500">Custom Logic?</span>
                                    <input type="checkbox" name="managerApprovalCustom" checked={formData.managerApprovalCustom} onChange={handleInputChange} className="h-4 w-4" />
                                </div>
                                {formData.managerApprovalCustom && (
                                    <div className="grid grid-cols-1 gap-2">
                                        <input type="text" name="managerCities" value={formData.managerCities} onChange={handleInputChange} placeholder="Cities..." className="w-full p-2 border rounded text-xs focus:ring-1 ring-indigo-100 outline-none" />
                                        <input type="text" name="managerBookingTypes" value={formData.managerBookingTypes} onChange={handleInputChange} placeholder="Booking Types..." className="w-full p-2 border rounded text-xs focus:ring-1 ring-indigo-100 outline-none" />
                                        <input type="text" name="managerCabTypes" value={formData.managerCabTypes} onChange={handleInputChange} placeholder="Cab Types..." className="w-full p-2 border rounded text-xs focus:ring-1 ring-indigo-100 outline-none" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Marshal Logic */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-700 flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Marshal Logic</span>
                        <select name="marshalReq" value={formData.marshalReq} onChange={handleInputChange}
                            className="p-1 rounded border text-sm font-bold outline-none">
                            <option>No</option>
                            <option>Yes</option>
                        </select>
                    </div>
                    {formData.marshalReq === 'Yes' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Mode</label>
                                    <select name="marshalMode" value={formData.marshalMode} onChange={handleInputChange}
                                        className="w-full p-2 border rounded text-sm bg-white outline-none">
                                        <option>Automatic</option>
                                        <option>Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Dark Hours</label>
                                    <input type="text" name="darkHours" value={formData.darkHours} onChange={handleInputChange}
                                        className="w-full p-2 border rounded text-sm focus:ring-1 ring-indigo-100 outline-none" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-white p-3 rounded border border-indigo-100">
                                <span className="text-xs font-bold text-indigo-900">First/Last Female Feature?</span>
                                <input type="checkbox" name="autoMarshalDarkHours" checked={formData.autoMarshalDarkHours} onChange={handleInputChange} className="h-4 w-4" />
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500">Custom Logic?</span>
                                    <input type="checkbox" name="marshalCustom" checked={formData.marshalCustom} onChange={handleInputChange} className="h-4 w-4" />
                                </div>
                                {formData.marshalCustom && (
                                    <div className="grid grid-cols-1 gap-2">
                                        <input type="text" name="marshalCities" value={formData.marshalCities} onChange={handleInputChange} placeholder="Cities..." className="w-full p-2 border rounded text-xs focus:ring-1 ring-indigo-100 outline-none" />
                                        <input type="text" name="marshalBookingTypes" value={formData.marshalBookingTypes} onChange={handleInputChange} placeholder="Booking Types..." className="w-full p-2 border rounded text-xs focus:ring-1 ring-indigo-100 outline-none" />
                                        <input type="text" name="marshalCabTypes" value={formData.marshalCabTypes} onChange={handleInputChange} placeholder="Cab Types..." className="w-full p-2 border rounded text-xs focus:ring-1 ring-indigo-100 outline-none" />
                                        <select name="marshalGender" value={formData.marshalGender} onChange={handleInputChange}
                                            className="w-full p-2 border rounded text-xs bg-white outline-none">
                                            <option>Female</option>
                                            <option>Male</option>
                                            <option>All</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <button onClick={handleGenerateSE} disabled={isSubmitting}
                    className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex justify-center items-center disabled:opacity-50">
                    {isSubmitting ? <><Loader className="w-5 h-5 mr-2 animate-spin" /> Generating AI Config...</> : 'GENERATE SE CONFIG PREVIEW'}
                </button>

                {seResult && (
                    <div className="animate-fade-in mt-6 border-t pt-6 border-slate-200">
                        <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" /> Preview Ready to Copy
                        </h3>
                        <TicketPreview
                            title={`System Engineering Configuration – ${formData.buid || buid}`}
                            content={seResult}
                            onJiraClick={() => setShowPermModal(true)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
