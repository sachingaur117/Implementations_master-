'use client';

import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Package } from 'lucide-react';
import { useImplementation } from '@/context/ImplementationContext';

const PRODUCTS = ['Rentlz', 'ETS', 'Shuttle'];
const IMPL_STATUSES = ['Ongoing', 'Delayed', 'Completed', 'On Hold'] as const;

export default function IdentityPage() {
    const router = useRouter();
    const { buid } = useParams<{ buid: string }>();
    const { formData, handleInputChange } = useImplementation();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Client Identity
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Customer Name</label>
                        <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange}
                            placeholder="e.g. Acme Corp" className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all" />
                    </div>

                    {/* TAM / KAM Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Implementation Manager (TAM / KAM)</label>
                        <input type="text" name="tamName" value={formData.tamName} onChange={handleInputChange}
                            placeholder="Account Manager Name..." className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all" />
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
                        <select name="productName" value={formData.productName} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all bg-white">
                            {PRODUCTS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Implementation Status */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Implementation Status</label>
                        <select name="implementationStatus" value={formData.implementationStatus} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all bg-white">
                            {IMPL_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Implementation Start Date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Implementation Start Date</label>
                        <input type="date" name="implementationStartDate" value={formData.implementationStartDate} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all bg-white" />
                    </div>

                    {/* Planned End Date (Target Go-Live) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Planned End Date (Target Go-Live)</label>
                        <input type="date" name="plannedEndDate" value={formData.plannedEndDate} onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-50 outline-none transition-all bg-white" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={() => router.push(`/${buid}/server-creation`)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center">
                        Next: Server Request <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
