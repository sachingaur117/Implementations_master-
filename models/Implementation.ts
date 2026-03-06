import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHistoryEntry {
    ticketType: string;
    content: string;
    createdAt: Date;
}

export interface IVendorChecklist {
    shareDoc?: boolean;
    masterData?: boolean;
    vendorProfile?: boolean;
    vehicleType?: boolean;
    virtualCab?: boolean;
    shareApiDocs?: boolean;
    receiveVendorApis?: boolean;
    toDevBackend?: boolean;
    toServerCreds?: boolean;
    consulConfig?: boolean;
}

export interface IVendorEntry {
    name: string;
    checklist: IVendorChecklist;
}

export interface INewRequirement {
    title: string;
    ticketNumber: string;
    description: string;
    confirmedWithClient: boolean;
    plannedAndPickedForGrooming: boolean;
    grooming: boolean;
    delivered: boolean;
}

export interface IImplementation extends Document {
    buid: string;
    customerName: string;
    tamName: string;
    productName: string;
    implementationStartDate?: string;
    plannedEndDate?: string;
    implementationStatus: 'Ongoing' | 'Delayed' | 'Completed' | 'On Hold';
    status: 'In-Progress' | 'Completed';
    currentStep: number;
    infrastructure: {
        serverSheetUrl?: string;
        newRequirementsSheetUrl?: string;
        enablementSiteUrl?: string;
        enablementRefUrl?: string;
        requestorName?: string;
    };
    vendorSetup: {
        hasExternalVendors: boolean;
        vendorCount: number;
        vendors: IVendorEntry[];
    };
    newRequirements: {
        hasDevelopmentRequirements: boolean;
        requirementCount: number;
        requirements: INewRequirement[];
    };
    config: {
        cities?: string[];
        bookingTypes?: string[];
        cabTypes?: string[];
        otpType?: string;
        ava?: { enabled?: boolean; flavor?: string };
        managerApproval?: {
            enabled?: boolean;
            role?: string;
            customLogic?: { cities?: string; bookingTypes?: string; cabTypes?: string };
        };
        marshal?: {
            enabled?: boolean;
            firstLastFemaleRule?: boolean;
            customLogic?: { cities?: string; bookingTypes?: string; cabTypes?: string; gender?: string };
        };
    };
    history: IHistoryEntry[];
    completionPercent: number;
    createdAt: Date;
    updatedAt: Date;
}

const VendorChecklistSchema = new Schema<IVendorChecklist>({
    shareDoc: Boolean,
    masterData: Boolean,
    vendorProfile: Boolean,
    vehicleType: Boolean,
    virtualCab: Boolean,
    shareApiDocs: Boolean,
    receiveVendorApis: Boolean,
    toDevBackend: Boolean,
    toServerCreds: Boolean,
    consulConfig: Boolean,
}, { _id: false });

const VendorEntrySchema = new Schema<IVendorEntry>({
    name: { type: String, default: '' },
    checklist: { type: VendorChecklistSchema, default: () => ({}) },
}, { _id: false });

const NewRequirementSchema = new Schema<INewRequirement>({
    title: { type: String, default: '' },
    ticketNumber: { type: String, default: '' },
    description: { type: String, default: '' },
    confirmedWithClient: { type: Boolean, default: false },
    plannedAndPickedForGrooming: { type: Boolean, default: false },
    grooming: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
}, { _id: false });

const ImplementationSchema = new Schema<IImplementation>(
    {
        buid: { type: String, required: true, unique: true, index: true },
        customerName: { type: String, required: true },
        tamName: { type: String, required: true },
        productName: { type: String, default: 'Rentlz' },
        implementationStartDate: { type: String },
        plannedEndDate: { type: String },
        implementationStatus: { type: String, enum: ['Ongoing', 'Delayed', 'Completed', 'On Hold'], default: 'Ongoing' },
        status: { type: String, enum: ['In-Progress', 'Completed'], default: 'In-Progress' },
        currentStep: { type: Number, default: 1 },
        completionPercent: { type: Number, default: 0 },

        infrastructure: {
            serverSheetUrl: String,
            newRequirementsSheetUrl: String,
            enablementSiteUrl: String,
            enablementRefUrl: String,
            requestorName: String,
        },

        vendorSetup: {
            hasExternalVendors: { type: Boolean, default: false },
            vendorCount: { type: Number, default: 0 },
            vendors: { type: [VendorEntrySchema], default: [] },
        },

        newRequirements: {
            hasDevelopmentRequirements: { type: Boolean, default: false },
            requirementCount: { type: Number, default: 0 },
            requirements: { type: [NewRequirementSchema], default: [] },
        },

        config: {
            cities: [String],
            bookingTypes: [String],
            cabTypes: [String],
            otpType: String,
            ava: { enabled: Boolean, flavor: String },
            managerApproval: {
                enabled: Boolean,
                role: String,
                customLogic: { cities: String, bookingTypes: String, cabTypes: String },
            },
            marshal: {
                enabled: Boolean,
                firstLastFemaleRule: Boolean,
                customLogic: { cities: String, bookingTypes: String, cabTypes: String, gender: String },
            },
        },

        history: [
            {
                ticketType: String,
                content: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const Implementation: Model<IImplementation> =
    mongoose.models.Implementation ||
    mongoose.model<IImplementation>('Implementation', ImplementationSchema);

export default Implementation;
