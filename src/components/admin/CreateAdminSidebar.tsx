import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface CreateAdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AdminForm {
    companyName: string;
    mobileNumber: string;
    email: string;
    location: string;
    contactPersonName: string;
    logoFile: File | null;
    photoFile: File | null;
}

const CreateAdminSidebar: React.FC<CreateAdminSidebarProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState<AdminForm>({
        companyName: '',
        mobileNumber: '',
        email: '',
        location: '',
        contactPersonName: '',
        logoFile: null,
        photoFile: null,
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        // Basic validation: all text fields required
        const { logoFile, photoFile, ...textFields } = formData;
        const valid = Object.values(textFields).every(value => value.trim() !== '');
        setIsValid(valid);
    }, [formData]);

    // Disable body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'photo') => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, [type === 'logo' ? 'logoFile' : 'photoFile']: file }));
        }
    };

    const triggerUpload = (type: 'logo' | 'photo') => {
        if (type === 'logo') {
            if (logoInputRef.current) logoInputRef.current.value = ''; // Reset to allow same file re-upload
            logoInputRef.current?.click();
        } else {
            if (photoInputRef.current) photoInputRef.current.value = '';
            photoInputRef.current?.click();
        }
    };

    const handleSubmit = () => {
        if (isValid) {
            console.log('Creating Admin:', formData);
            onClose();
        }
    };

    if (!isOpen) return null;

    const sidebarContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[10000] transition-opacity !mt-0"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-[480px] bg-white/58 backdrop-blur-[10px] shadow-2xl z-[10001] flex flex-col rounded-l-[8px] border-l border-[#D5D7DA] transform transition-transform duration-300 ease-in-out !mt-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#D5D7DA] flex-none bg-white/20">
                    <h2 className="text-xl font-semibold text-gray-900">Create Admin</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 flex flex-col gap-8">

                        <input
                            type="file"
                            id="admin-logo-upload"
                            ref={logoInputRef}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'logo')}
                            className="hidden"
                            accept="image/*"
                        />
                        <input
                            type="file"
                            id="admin-photo-upload"
                            ref={photoInputRef}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'photo')}
                            className="hidden"
                            accept="image/*"
                        />

                        {/* 1. Organisation Info */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-6 font-semibold">1. Organisation Info</h3>
                            <div className="flex flex-col gap-6">

                                {/* Upload Logo */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-900">Upload Logo</label>
                                    <div
                                        onClick={() => triggerUpload('logo')}
                                        className="border border-[#D5D7DA] border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        {formData.logoFile ? (
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 rounded-lg bg-indigo-50/50 flex items-center justify-center mb-3">
                                                    <img src="/assets/upload-icon.svg" alt="Upload" className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-semibold text-gray-900 line-clamp-1">{formData.logoFile.name}</p>
                                                <p className="text-[10px] text-[#6941C6] mt-1 font-bold">Change files</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 mb-3 flex items-center justify-center">
                                                    <img src="/assets/upload-icon.svg" alt="Upload" className="w-10 h-10" />
                                                </div>
                                                <p className="text-sm text-center">
                                                    <span className="text-[#6941C6] font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-center text-[#667085] mt-1">
                                                    SVG, PNG, JPG or GIF (max. 800x400px)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-900">Name of the Organisation</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Enter Organisation"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-[#2E49B7] outline-none transition-all placeholder:text-gray-400 bg-white"
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-900">Mobile Number</label>
                                    <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-[#2E49B7] transition-all">
                                        <select className="px-3 py-3 bg-transparent text-gray-600 outline-none text-sm font-medium">
                                            <option>US</option>
                                            <option>IN</option>
                                        </select>
                                        <input
                                            type="text"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                            placeholder="80988808980"
                                            className="flex-1 px-4 py-3 outline-none placeholder:text-gray-400 text-gray-900 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-900">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="olivia@sample.com"
                                            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-[#2E49B7] outline-none transition-all placeholder:text-gray-400 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-900">Location</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Enter or Select location"
                                            className="w-full pl-4 pr-11 py-3 rounded-lg border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-[#2E49B7] outline-none transition-all placeholder:text-gray-400 bg-white"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Contact Person */}
                        <section className="pt-2">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 font-semibold">2. Contact Person</h3>
                            <div className="flex flex-col gap-6">

                                {/* Upload Photo */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-900">Upload Photo</label>
                                    <div
                                        onClick={() => triggerUpload('photo')}
                                        className="border border-[#D5D7DA] border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        {formData.photoFile ? (
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-10 h-10 rounded-lg bg-green-50/50 flex items-center justify-center mb-3">
                                                    <img src="/assets/upload-icon.svg" alt="Upload" className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-semibold text-gray-900 line-clamp-1">{formData.photoFile.name}</p>
                                                <p className="text-[10px] text-green-600 mt-1 font-bold">Change photo</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 mb-3 flex items-center justify-center">
                                                    <img src="/assets/upload-icon.svg" alt="Upload" className="w-10 h-10" />
                                                </div>
                                                <p className="text-sm text-center">
                                                    <span className="text-[#6941C6] font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-center text-[#667085] mt-1">
                                                    SVG, PNG, JPG or GIF (max. 800x400px)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="flex flex-col gap-2 pb-20">
                                    <label className="block text-sm font-medium text-gray-900">Full Name</label>
                                    <input
                                        type="text"
                                        name="contactPersonName"
                                        value={formData.contactPersonName}
                                        onChange={handleChange}
                                        placeholder="Enter Full Name"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-[#2E49B7] outline-none transition-all placeholder:text-gray-400 bg-white"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[#D5D7DA] flex items-center justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-none bg-white/40">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg border border-[#D0D5DD] text-[#344054] font-bold hover:bg-gray-50 transition-colors text-sm shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`px-6 py-2.5 rounded-lg text-white font-bold text-sm transition-all shadow-[0px_4px_10px_rgba(46,73,183,0.3)]
                ${isValid
                                ? 'bg-[#2E49B7] hover:bg-[#103778]'
                                : 'bg-[#5E85C6] cursor-not-allowed opacity-90'
                            }`}
                    >
                        Create Admin
                    </button>
                </div>

            </div>
        </>
    );

    return createPortal(sidebarContent, document.body);
};

export default CreateAdminSidebar;
