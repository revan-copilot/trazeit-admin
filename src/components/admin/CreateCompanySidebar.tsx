import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Toast from '../common/Toast';
import companyService, { ICompany } from '../../services/CompanyService';

interface CreateCompanySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ICompany | null;
    onSuccess?: () => void;
}

interface CompanyForm {
    // Organization Info
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;

    // Contact Info
    firstName: string;
    lastName: string;
    ownerName: string;

    // Files
    logoFile: File | null;
}

const CreateCompanySidebar: React.FC<CreateCompanySidebarProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
    const [formData, setFormData] = useState<CompanyForm>({
        name: '',
        countryCode: '+91',
        phone: '',
        email: '',
        address1: '',
        address2: '',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        postalCode: '622201',
        firstName: '',
        lastName: '',
        ownerName: '',
        logoFile: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || initialData.companyName || '',
                countryCode: initialData.countryCode || '+91',
                phone: initialData.phone || '',
                email: initialData.email || '',
                address1: initialData.address1 || '',
                address2: initialData.address2 || '',
                city: initialData.city || 'Chennai',
                state: initialData.state || 'Tamil Nadu',
                country: initialData.country || 'India',
                postalCode: initialData.postalCode || '622201',
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                ownerName: initialData.data?.ownerName || initialData.contactPerson?.name || '',
                logoFile: null,
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                countryCode: '+91',
                phone: '',
                email: '',
                address1: '',
                address2: '',
                city: 'Chennai',
                state: 'Tamil Nadu',
                country: 'India',
                postalCode: '622201',
                firstName: '',
                lastName: '',
                ownerName: '',
                logoFile: null,
            });
        }
    }, [isOpen, initialData]);

    const logoInputRef = useRef<HTMLInputElement>(null);

    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const required = ['name', 'phone', 'email', 'address1', 'firstName', 'lastName', 'ownerName'];
        const valid = required.every(field => String((formData as any)[field]).trim() !== '');
        setIsValid(valid);
    }, [formData]);

    // Disable body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, logoFile: file }));
        }
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        try {
            setLoading(true);
            setError(null);

            const payload: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: "male",
                countryCode: formData.countryCode,
                phone: formData.phone,
                dob: "1994-06-10",
                email: formData.email,
                address1: formData.address1,
                address2: formData.address2 || formData.address1,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                postalCode: formData.postalCode,
                userType: ["admin"],
                profilePic: formData.logoFile ? formData.logoFile.name : "",
                name: formData.name,
                password: "", // Send empty password as requested
                location: {
                    type: "Point",
                    coordinates: [80.1706653, 12.9939595]
                },
                data: {
                    ownerName: formData.ownerName
                }
            };

            if (isEdit && initialData?._id) {
                await companyService.updateCompany(initialData._id, payload);
            } else {
                await companyService.createCompany(payload);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save company. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const sidebarContent = (
        <>
            <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[10000] !mt-0" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-[540px] bg-white shadow-2xl z-[10001] flex flex-col transform transition-transform duration-300 !mt-0">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                    <h2 className="text-[20px] font-semibold text-[#101828]">{isEdit ? 'Edit Company' : 'Create Company'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto bg-white p-8 space-y-10 custom-scrollbar pb-10">

                    {/* Section 1: Organisation Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[#101828]">1. Organisation Info</h3>

                        {/* Upload Logo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Upload Logo</label>
                            <div
                                onClick={() => logoInputRef.current?.click()}
                                className="border-2 border-dashed border-[#EAECF0] rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 transition-all bg-gray-50/30"
                            >
                                <input type="file" ref={logoInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-lg border border-gray-100">
                                    <svg className="w-5 h-5 text-[#475467]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 16L12 8M12 8L9 11M12 8L15 11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M20 16.7428C21.2215 15.734 22 14.212 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 7.01286 15.8973 7.03772C14.9471 4.6026 12.6715 3 10 3C6.13401 3 3 6.13401 3 10C3 10.2551 3.1205 10.435 3.30825 10.5M20 16.7428C20.6552 16.2023 21 15.3996 21 14.5C21 12.8431 19.6569 11.5 18 11.5V11.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="text-sm text-center">
                                    <span className="text-primary font-semibold">Click to upload</span>
                                    <span className="text-[#475467]"> or drag and drop</span>
                                </div>
                                <p className="text-xs text-[#475467]">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                            </div>
                        </div>

                        {/* Organisation Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Name of the Organisation</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Organisation" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#101828] text-sm" />
                        </div>

                        {/* Mobile & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Mobile Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="9259054124" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="elango+c2@gmail.com" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                        </div>

                        {/* Address Fields */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Address 1</label>
                            <input type="text" name="address1" value={formData.address1} onChange={handleChange} placeholder="Enter Address 1" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Address 2</label>
                            <input type="text" name="address2" value={formData.address2} onChange={handleChange} placeholder="Enter Address 2" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Country</label>
                                <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Postal Code</label>
                                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="622201" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contact Person */}
                    <div className="space-y-6 !mt-12">
                        <h3 className="text-lg font-semibold text-[#101828]">2. Contact Person</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Elangovancompany" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Manoharanddd" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Owner Name</label>
                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Kumaresan dddd" className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-[#EAECF0] flex items-center justify-end gap-3 bg-white">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-[#D0D5DD] text-[#344054] font-semibold hover:bg-gray-50 transition-all text-sm">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className={`px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-[0px_4px_10px_rgba(46,73,183,0.25)] flex items-center justify-center min-w-[120px]
                        ${isValid && !loading ? 'bg-[#2E49B7] hover:bg-[#103778]' : 'bg-[#5E85C6] cursor-not-allowed'}`}
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isEdit ? 'Update Company' : 'Create Company')}
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E4E7EC; border-radius: 10px; }
            `}</style>
        </>
    );

    return createPortal(
        <>
            {sidebarContent}
            {error && <Toast message={error} type="error" />}
        </>,
        document.body
    );
};

export default CreateCompanySidebar;
