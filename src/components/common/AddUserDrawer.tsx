import React, { useState, useRef } from 'react';

interface AddUserDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'admin' | 'user';
    onAdd: (data: any) => void;
    initialData?: any | null;
}

const AddUserDrawer: React.FC<AddUserDrawerProps> = ({ isOpen, onClose, type, onAdd, initialData }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('IN');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEdit = !!initialData;
    const title = isEdit
        ? (type === 'admin' ? 'Edit Admin' : 'Edit User')
        : (type === 'admin' ? 'Add Admin' : 'Add User');

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            setEmail(initialData.email || '');
            setPhone(initialData.phone || '');
            setLocation(initialData.location || '');
            setAvatarPreview(initialData.avatar || null);
        } else if (isOpen && !initialData) {
            resetForm();
        }
    }, [isOpen, initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        // Reset input value to allow selecting the same file again
        if (e.target) e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!phone.trim()) newErrors.phone = 'Mobile number is required';
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!location.trim()) newErrors.location = 'Location is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await onAdd({ name, email, phone, location, avatar: avatarPreview, role: type });
            resetForm();
            onClose();
        } catch (err) {
            console.error('Failed to submit user:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setLocation('');
        setAvatarPreview(null);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose}></div>

            {/* Drawer */}
            <div className="relative w-full max-w-[640px] bg-[#F5F8FF] h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-[#F5F8FF]">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Admin Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{type === 'admin' ? 'Admin Name' : 'User Name'}</label>
                        <input
                            type="text"
                            placeholder="Enter Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="bg-transparent px-3 py-2.5 outline-none text-sm text-gray-600 border-r border-gray-200"
                            >
                                <option value="IN">IN</option>
                                <option value="US">US</option>
                            </select>
                            <input
                                type="text"
                                placeholder="00000 00000"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (errors.phone) setErrors({ ...errors, phone: '' });
                                }}
                                className="flex-1 px-3 py-2.5 outline-none text-sm"
                            />
                        </div>
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: '' });
                                }}
                                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter or Select location"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    if (errors.location) setErrors({ ...errors, location: '' });
                                }}
                                className={`w-full pl-3 pr-9 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm ${errors.location ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
                    </div>

                    {/* Upload Photo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Photo</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {avatarPreview ? (
                            <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white group mt-4 mx-auto">
                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAvatarPreview(null);
                                    }}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <div className="bg-red-500 p-2 rounded-full text-white shadow-lg">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-primary/50 transition-all mt-4"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <div className="mb-2">
                                    <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        <span className="text-[#6941C6] font-semibold">Click to upload</span>
                                        <span> or drag and drop</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-[#F5F8FF] flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : title}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddUserDrawer;
