import React from 'react';
import { useAuth, IAuthUser } from '../../context/AuthContext';
import Avatar from '../../components/common/Avatar';

const ProfileSettings: React.FC = () => {
    const { user, updateUser } = useAuth();

    // Local form state — mirrors auth user for editing
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: 91,
        profilePic: '',
    });

    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Populate form from auth user
    React.useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: String(user.phone || ''),
                countryCode: user.countryCode || 91,
                profilePic: user.profilePic || '',
            });
            setAvatarPreview(user.profilePic || null);
        }
    }, [user]);

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            // Update auth context (persists to localStorage)
            const updates: Partial<IAuthUser> = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: Number(formData.phone),
                countryCode: formData.countryCode,
                profilePic: avatarPreview || formData.profilePic,
            };
            updateUser(updates);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setAvatarPreview(result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setAvatarPreview(result);
        };
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: String(user.phone || ''),
                countryCode: user.countryCode || 91,
                profilePic: user.profilePic || '',
            });
            setAvatarPreview(user.profilePic || null);
            setErrors({});
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const displayName = `${formData.firstName} ${formData.lastName}`.trim() || 'User';

    return (
        <div className="min-h-full pb-10">
            {/* Header / Cover Area */}
            <div className="h-32 w-full bg-white"></div>

            <div className="px-8 -mt-12">
                {/* Profile Header Block */}
                <div className="flex items-end justify-between mb-8">
                    <div className="flex items-end space-x-6">
                        <div className="relative">
                            <div className="border-[6px] border-white rounded-full shadow-sm">
                                <Avatar
                                    src={avatarPreview || formData.profilePic}
                                    firstName={formData.firstName}
                                    lastName={formData.lastName}
                                    size="xl"
                                />
                            </div>
                        </div>
                        <div className="pb-4">
                            <h1 className="text-3xl font-semibold text-gray-900">{displayName}</h1>
                            <p className="text-gray-500">{formData.email}</p>
                            {user.userType && user.userType.length > 0 && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary text-xs font-medium rounded capitalize">
                                    {user.userType[0].replace('_', ' ')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-3 mb-4 text-gray-900">
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            <span>Share</span>
                        </button>
                        <button className="px-4 py-2 bg-[#07275D] text-white rounded-lg text-sm font-medium hover:bg-[#07275D]/90 transition-colors">
                            View profile
                        </button>
                    </div>
                </div>

                <div className="flex space-x-8">
                    {/* Left Side: Info Text */}
                    <div className="w-1/3">
                        <h2 className="text-sm font-semibold text-gray-900">Personal info</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your photo and personal details.</p>
                    </div>

                    {/* Right Side: Form Card */}
                    <div
                        className="flex-1 rounded-[12px] border-2 border-white overflow-hidden"
                        style={{
                            background: 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(22.8px)',
                            WebkitBackdropFilter: 'blur(22.8px)'
                        }}
                    >
                        <div className="p-6 space-y-6">
                            {/* Names */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('firstName', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 ${errors.firstName ? 'border-red-500' : 'border-[#D5D7DA]'}`}
                                    />
                                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('lastName', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 ${errors.lastName ? 'border-red-500' : 'border-[#D5D7DA]'}`}
                                    />
                                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 ${errors.email ? 'border-red-500' : 'border-[#D5D7DA]'}`}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                                <div className="flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all border-[#D5D7DA]">
                                    <select
                                        className="bg-gray-50 px-3 py-2 outline-none text-sm text-gray-700 border-r border-[#D5D7DA]"
                                        value={formData.countryCode}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('countryCode', Number(e.target.value))}
                                    >
                                        <option value={91}>+91</option>
                                        <option value={1}>+1</option>
                                        <option value={44}>+44</option>
                                        <option value={61}>+61</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)}
                                        className="flex-1 px-3 py-2 outline-none text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Avatar Upload */}
                            <div className="flex items-center space-x-6 py-4">
                                <Avatar
                                    src={avatarPreview || formData.profilePic}
                                    firstName={formData.firstName}
                                    lastName={formData.lastName}
                                    size="lg"
                                />
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div
                                        className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e: React.DragEvent) => e.preventDefault()}
                                        onDrop={handleDrop}
                                    >
                                        <div className="mb-3">
                                            <img
                                                src="/assets/upload-icon.svg"
                                                alt="Upload"
                                                className="w-10 h-10 object-contain"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm">
                                                <span className="text-primary font-semibold">Click to upload</span>
                                                <span className="text-gray-500"> or drag and drop</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Buttons */}
                        <div className="px-6 py-4 flex justify-end space-x-3 border-t border-[#D5D7DA]">
                            <button
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={handleReset}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#07275D] text-white rounded-lg text-sm font-medium hover:bg-[#07275D]/90 transition-colors disabled:opacity-50 flex items-center"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
