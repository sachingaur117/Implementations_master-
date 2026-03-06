'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

const STEP_MAP: Record<string, number> = {
    'identity': 1,
    'server-creation': 2,
    'new-reqs': 3,
    'profile-data': 4,
    'external-vendors': 5,
    'rentlz-enable': 6,
    'handover': 7,
    'general-config': 8,
};

function getStepFromPath(pathname: string): number {
    const segment = pathname.split('/').pop() || '';
    return STEP_MAP[segment] || 1;
}

export interface FormData {
    buid: string;
    customerName: string;
    tamName: string;
    productName: string;
    implementationStartDate: string;
    plannedEndDate: string;
    implementationStatus: 'Ongoing' | 'Delayed' | 'Completed' | 'On Hold';
    serverSheetUrl: string;
    newReqSheetUrl: string;
    profileDataCompleted: boolean;
    enableSiteUrl: string;
    enableRefUrl: string;
    enableRequestor: string;
    currentStep: number;
    hasExternalVendors: boolean;
    vendorCount: number;
    citiesToAdd: string;
    bookingTypes: string;
    cabTypes: string;
    managerApproval: boolean;
    approverType: string;
    managerApprovalCustom: boolean;
    managerCities: string;
    managerBookingTypes: string;
    managerCabTypes: string;
    marshalReq: string;
    marshalMode: string;
    darkHours: string;
    autoMarshalDarkHours: boolean;
    marshalCustom: boolean;
    marshalCities: string;
    marshalBookingTypes: string;
    marshalCabTypes: string;
    marshalGender: string;
    autoVendor: boolean;
    vendorFlavor: string;
    otpType: string;
    // New requirements
    hasDevelopmentRequirements: boolean;
    requirementCount: number;
}

export interface VendorChecklist {
    shareDoc: boolean;
    vendorProfile: boolean;
    vehicleType: boolean;
    virtualCab: boolean;
    masterData: boolean;
    shareApiDocs: boolean;
    receiveVendorApis: boolean;
    toDevBackend: boolean;
    toServerCreds: boolean;
    consulConfig: boolean;
}

export interface VendorEntry {
    name: string;
    checklist: VendorChecklist;
}

export interface NewRequirement {
    title: string;
    ticketNumber: string;
    description: string;
    confirmedWithClient: boolean;
    plannedAndPickedForGrooming: boolean;
    grooming: boolean;
    delivered: boolean;
}

const defaultChecklist: VendorChecklist = {
    shareDoc: false,
    vendorProfile: false,
    vehicleType: false,
    virtualCab: false,
    masterData: false,
    shareApiDocs: false,
    receiveVendorApis: false,
    toDevBackend: false,
    toServerCreds: false,
    consulConfig: false,
};

export const makeDefaultVendor = (name = ''): VendorEntry => ({
    name,
    checklist: { ...defaultChecklist },
});

export const makeDefaultRequirement = (): NewRequirement => ({
    title: '',
    ticketNumber: '',
    description: '',
    confirmedWithClient: false,
    plannedAndPickedForGrooming: false,
    grooming: false,
    delivered: false,
});

const defaultFormData: FormData = {
    buid: '',
    customerName: '',
    tamName: '',
    productName: 'Rentlz',
    implementationStartDate: '',
    plannedEndDate: '',
    implementationStatus: 'Ongoing',
    serverSheetUrl: '',
    newReqSheetUrl: '',
    profileDataCompleted: false,
    enableSiteUrl: '',
    enableRefUrl: '',
    enableRequestor: '',
    currentStep: 1,
    hasExternalVendors: false,
    vendorCount: 0,
    citiesToAdd: '',
    bookingTypes: '',
    cabTypes: '',
    managerApproval: false,
    approverType: 'Reporting Manager',
    managerApprovalCustom: false,
    managerCities: '',
    managerBookingTypes: '',
    managerCabTypes: '',
    marshalReq: 'No',
    marshalMode: 'Automatic',
    darkHours: '20:00 - 06:00',
    autoMarshalDarkHours: true,
    marshalCustom: false,
    marshalCities: '',
    marshalBookingTypes: '',
    marshalCabTypes: '',
    marshalGender: 'Female',
    autoVendor: false,
    vendorFlavor: 'PERCENTAGE',
    otpType: 'Two OTPs (Sign-in/out)',
    hasDevelopmentRequirements: false,
    requirementCount: 0,
};

interface ImplementationContextType {
    formData: FormData;
    vendors: VendorEntry[];
    newRequirements: NewRequirement[];
    isLoaded: boolean;
    isSaving: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleVendorCheck: (vendorIndex: number, id: string, checked: boolean) => void;
    handleVendorNameChange: (vendorIndex: number, name: string) => void;
    updateRequirement: (index: number, field: keyof NewRequirement, value: string | boolean) => void;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    setVendors: React.Dispatch<React.SetStateAction<VendorEntry[]>>;
    setNewRequirements: React.Dispatch<React.SetStateAction<NewRequirement[]>>;
}

const ImplementationContext = createContext<ImplementationContextType | null>(null);

export function ImplementationProvider({ children, initialBuid }: { children: React.ReactNode; initialBuid: string }) {
    const pathname = usePathname();
    const [formData, setFormData] = useState<FormData>({ ...defaultFormData, buid: initialBuid });
    const [vendors, setVendors] = useState<VendorEntry[]>([]);
    const [newRequirements, setNewRequirements] = useState<NewRequirement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstLoad = useRef(true);

    // Load existing data on mount
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch(`/api/implementations/${initialBuid}`);
                if (res.ok) {
                    const doc = await res.json();
                    const vendorCount = doc.vendorSetup?.vendorCount || 0;
                    const loadedVendors = doc.vendorSetup?.vendors || [];
                    const requirementCount = doc.newRequirements?.requirementCount || 0;
                    const loadedRequirements = doc.newRequirements?.requirements || [];

                    setFormData({
                        buid: doc.buid || initialBuid,
                        customerName: doc.customerName || '',
                        tamName: doc.tamName || '',
                        productName: doc.productName || 'Rentlz',
                        implementationStartDate: doc.implementationStartDate || '',
                        plannedEndDate: doc.plannedEndDate || '',
                        implementationStatus: doc.implementationStatus || 'Ongoing',
                        currentStep: doc.currentStep || 1,
                        serverSheetUrl: doc.infrastructure?.serverSheetUrl || '',
                        newReqSheetUrl: doc.infrastructure?.newRequirementsSheetUrl || '',
                        profileDataCompleted: false,
                        enableSiteUrl: doc.infrastructure?.enablementSiteUrl || '',
                        enableRefUrl: doc.infrastructure?.enablementRefUrl || '',
                        enableRequestor: doc.infrastructure?.requestorName || '',
                        hasExternalVendors: doc.vendorSetup?.hasExternalVendors || false,
                        vendorCount,
                        citiesToAdd: doc.config?.cities?.join(', ') || '',
                        bookingTypes: doc.config?.bookingTypes?.join(', ') || '',
                        cabTypes: doc.config?.cabTypes?.join(', ') || '',
                        managerApproval: doc.config?.managerApproval?.enabled || false,
                        approverType: doc.config?.managerApproval?.role || 'Reporting Manager',
                        managerApprovalCustom: !!doc.config?.managerApproval?.customLogic?.cities,
                        managerCities: doc.config?.managerApproval?.customLogic?.cities || '',
                        managerBookingTypes: doc.config?.managerApproval?.customLogic?.bookingTypes || '',
                        managerCabTypes: doc.config?.managerApproval?.customLogic?.cabTypes || '',
                        marshalReq: doc.config?.marshal?.enabled ? 'Yes' : 'No',
                        marshalMode: 'Automatic',
                        darkHours: '20:00 - 06:00',
                        autoMarshalDarkHours: doc.config?.marshal?.firstLastFemaleRule ?? true,
                        marshalCustom: !!doc.config?.marshal?.customLogic?.cities,
                        marshalCities: doc.config?.marshal?.customLogic?.cities || '',
                        marshalBookingTypes: doc.config?.marshal?.customLogic?.bookingTypes || '',
                        marshalCabTypes: doc.config?.marshal?.customLogic?.cabTypes || '',
                        marshalGender: doc.config?.marshal?.customLogic?.gender || 'Female',
                        autoVendor: doc.config?.ava?.enabled || false,
                        vendorFlavor: doc.config?.ava?.flavor || 'PERCENTAGE',
                        otpType: doc.config?.otpType || 'Two OTPs (Sign-in/out)',
                        hasDevelopmentRequirements: doc.newRequirements?.hasDevelopmentRequirements || false,
                        requirementCount,
                    });

                    // Build vendors array to match vendorCount
                    const rebuilt: VendorEntry[] = Array.from({ length: vendorCount }, (_, i) => {
                        const saved = loadedVendors[i];
                        if (saved) {
                            return {
                                name: saved.name || '',
                                checklist: { ...defaultChecklist, ...saved.checklist },
                            };
                        }
                        return makeDefaultVendor();
                    });
                    setVendors(rebuilt);

                    // Build requirements array
                    const rebuiltReqs: NewRequirement[] = Array.from({ length: requirementCount }, (_, i) => {
                        const saved = loadedRequirements[i];
                        return saved ? { ...makeDefaultRequirement(), ...saved } : makeDefaultRequirement();
                    });
                    setNewRequirements(rebuiltReqs);
                }
            } catch (e) {
                console.error('Failed to load implementation data:', e);
            } finally {
                setIsLoaded(true);
            }
        }
        loadData();
    }, [initialBuid]);

    // Advance currentStep as user navigates forward through wizard pages
    useEffect(() => {
        if (!isLoaded) return;
        const pageStep = getStepFromPath(pathname);
        setFormData((prev) => {
            const newStep = Math.max(prev.currentStep, pageStep);
            if (newStep !== prev.currentStep && prev.buid) {
                fetch(`/api/implementations/${prev.buid}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentStep: newStep }),
                }).catch(console.error);
            }
            return { ...prev, currentStep: newStep };
        });
    }, [pathname, isLoaded]);

    const buildPatchPayload = useCallback((fd: FormData, vs: VendorEntry[], nrs: NewRequirement[]) => {
        const totalVendorTasks = vs.length * 10;
        const completedVendorTasks = vs.reduce(
            (sum, v) => sum + Object.values(v.checklist).filter(Boolean).length, 0
        );
        // Dev requirements: each req has 4 stages; count each as a boolean unit
        const REQ_STAGES: (keyof NewRequirement)[] = [
            'confirmedWithClient', 'plannedAndPickedForGrooming', 'grooming', 'delivered'
        ];
        const totalReqStages = fd.hasDevelopmentRequirements ? nrs.length * REQ_STAGES.length : 0;
        const completedReqStages = fd.hasDevelopmentRequirements
            ? nrs.reduce((sum, r) => sum + REQ_STAGES.filter(s => r[s] === true).length, 0)
            : 0;

        const steps = [
            !!(fd.customerName && fd.tamName),
            !!fd.serverSheetUrl,
            !!fd.newReqSheetUrl,
            fd.profileDataCompleted,
            !fd.hasExternalVendors || (totalVendorTasks > 0 && completedVendorTasks === totalVendorTasks),
            !!(fd.enableSiteUrl && fd.enableRefUrl && fd.enableRequestor),
            !!(fd.customerName && fd.serverSheetUrl),
            false, // General Config
        ];

        // Blend: 8 wizard steps + individual req stages all as equal-weight booleans
        const totalUnits = steps.length + totalReqStages;
        const completedUnits = steps.filter(Boolean).length + completedReqStages;
        const completionPercent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;


        return {
            currentStep: fd.currentStep,
            completionPercent,
            customerName: fd.customerName,
            tamName: fd.tamName,
            productName: fd.productName,
            implementationStartDate: fd.implementationStartDate,
            plannedEndDate: fd.plannedEndDate,
            implementationStatus: fd.implementationStatus,
            'infrastructure.serverSheetUrl': fd.serverSheetUrl,
            'infrastructure.newRequirementsSheetUrl': fd.newReqSheetUrl,
            'infrastructure.enablementSiteUrl': fd.enableSiteUrl,
            'infrastructure.enablementRefUrl': fd.enableRefUrl,
            'infrastructure.requestorName': fd.enableRequestor,
            vendorSetup: {
                hasExternalVendors: fd.hasExternalVendors,
                vendorCount: fd.vendorCount,
                vendors: vs,
            },
            newRequirements: {
                hasDevelopmentRequirements: fd.hasDevelopmentRequirements,
                requirementCount: fd.requirementCount,
                requirements: nrs,
            },
            'config.cities': fd.citiesToAdd ? fd.citiesToAdd.split(',').map((s) => s.trim()) : [],
            'config.bookingTypes': fd.bookingTypes ? fd.bookingTypes.split(',').map((s) => s.trim()) : [],
            'config.cabTypes': fd.cabTypes ? fd.cabTypes.split(',').map((s) => s.trim()) : [],
            'config.otpType': fd.otpType,
            'config.ava.enabled': fd.autoVendor,
            'config.ava.flavor': fd.vendorFlavor,
            'config.managerApproval.enabled': fd.managerApproval,
            'config.managerApproval.role': fd.approverType,
            'config.managerApproval.customLogic.cities': fd.managerCities,
            'config.managerApproval.customLogic.bookingTypes': fd.managerBookingTypes,
            'config.managerApproval.customLogic.cabTypes': fd.managerCabTypes,
            'config.marshal.enabled': fd.marshalReq === 'Yes',
            'config.marshal.firstLastFemaleRule': fd.autoMarshalDarkHours,
            'config.marshal.customLogic.cities': fd.marshalCities,
            'config.marshal.customLogic.bookingTypes': fd.marshalBookingTypes,
            'config.marshal.customLogic.cabTypes': fd.marshalCabTypes,
            'config.marshal.customLogic.gender': fd.marshalGender,
        };
    }, []);

    const scheduleSave = useCallback((fd: FormData, vs: VendorEntry[], nrs: NewRequirement[]) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            if (!fd.buid) return;
            setIsSaving(true);
            try {
                await fetch(`/api/implementations/${fd.buid}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buildPatchPayload(fd, vs, nrs)),
                });
            } catch (e) {
                console.error('Autosave failed:', e);
            } finally {
                setIsSaving(false);
            }
        }, 500);
    }, [buildPatchPayload]);

    useEffect(() => {
        if (!isLoaded) return;
        if (isFirstLoad.current) { isFirstLoad.current = false; return; }
        scheduleSave(formData, vendors, newRequirements);
    }, [formData, vendors, newRequirements, isLoaded, scheduleSave]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }, []);

    const handleVendorCheck = useCallback((vendorIndex: number, id: string, checked: boolean) => {
        setVendors((prev) => {
            const next = [...prev];
            next[vendorIndex] = {
                ...next[vendorIndex],
                checklist: { ...next[vendorIndex].checklist, [id]: checked },
            };
            return next;
        });
    }, []);

    const handleVendorNameChange = useCallback((vendorIndex: number, name: string) => {
        setVendors((prev) => {
            const next = [...prev];
            next[vendorIndex] = { ...next[vendorIndex], name };
            return next;
        });
    }, []);

    const updateRequirement = useCallback((index: number, field: keyof NewRequirement, value: string | boolean) => {
        setNewRequirements((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }, []);

    return (
        <ImplementationContext.Provider value={{
            formData, vendors, newRequirements, isLoaded, isSaving,
            handleInputChange, handleVendorCheck, handleVendorNameChange,
            updateRequirement, setFormData, setVendors, setNewRequirements
        }}>
            {children}
        </ImplementationContext.Provider>
    );
}

export function useImplementation() {
    const ctx = useContext(ImplementationContext);
    if (!ctx) throw new Error('useImplementation must be used within ImplementationProvider');
    return ctx;
}
