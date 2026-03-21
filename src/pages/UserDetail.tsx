import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import userService, { IUser, IProperty } from '../services/UserService';
import Avatar from '../components/common/Avatar';
import SuccessPopup from '../components/common/SuccessPopup';
import LocationAutocomplete from '../components/common/LocationAutocomplete';

// Modal for Create/Update Property
interface PropertyModalProps {
    userId: string;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    editingProperty?: IProperty;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ userId, onClose, onSave, editingProperty }) => {
    const [name, setName] = useState(editingProperty?.name || '');
    const [size, setSize] = useState(editingProperty?.data?.Size || '');
    const [locationData, setLocationData] = useState({
        address1: editingProperty?.address1 || '',
        city: editingProperty?.city || '',
        state: editingProperty?.state || '',
        country: editingProperty?.country || '',
        postalCode: editingProperty?.postalCode || '',
        lat: editingProperty?.location?.coordinates?.[1] || 13.0827,
        lng: editingProperty?.location?.coordinates?.[0] || 80.2707
    });
    const [submitting, setSubmitting] = useState(false);
    const hasApiKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            address1: locationData.address1,
            address2: "",
            city: locationData.city,
            state: locationData.state,
            country: locationData.country,
            postalCode: locationData.postalCode,
            user: userId,
            images: editingProperty?.images || [],
            location: {
                type: "Point",
                coordinates: [locationData.lng, locationData.lat]
            },
            data: {
                Size: size
            }
        };

        try {
            setSubmitting(true);
            await onSave(payload);
        } catch (error) {
            console.error('Failed to save property:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-[#EAECF0] flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-[20px] font-semibold text-[#101828]">
                            {editingProperty ? 'Edit Property' : 'Assign Property'}
                        </h2>
                        <p className="text-[#475467] text-sm mt-1">
                            {editingProperty ? 'Update the property details.' : 'Add new property details for this user.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Property Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#101828] text-sm"
                                placeholder="e.g. Dream Gardens"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Size (e.g. 6 Acre)</label>
                            <input
                                type="text"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#101828] text-sm"
                                placeholder="e.g. 5 Acre"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-[#344054]">Location Details</label>
                        {hasApiKey ? (
                            <LocationAutocomplete 
                                onLocationSelect={(data) => setLocationData(data)}
                                placeholder="Search property address..."
                                initialValue={editingProperty?.address1}
                            />
                        ) : (
                            <div className="space-y-4">
                                <input
                                    required
                                    type="text"
                                    value={locationData.address1}
                                    onChange={(e) => setLocationData({ ...locationData, address1: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm"
                                    placeholder="Address 1"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        required
                                        type="text"
                                        value={locationData.city}
                                        onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm"
                                        placeholder="City"
                                    />
                                    <input
                                        required
                                        type="text"
                                        value={locationData.state}
                                        onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm"
                                        placeholder="State"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        required
                                        type="text"
                                        value={locationData.country}
                                        onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm"
                                        placeholder="Country"
                                    />
                                    <input
                                        required
                                        type="text"
                                        value={locationData.postalCode}
                                        onChange={(e) => setLocationData({ ...locationData, postalCode: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm"
                                        placeholder="Postal Code"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        value={locationData.lat}
                                        onChange={(e) => setLocationData({ ...locationData, lat: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm"
                                        placeholder="Latitude"
                                    />
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        value={locationData.lng}
                                        onChange={(e) => setLocationData({ ...locationData, lng: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D0D5DD] focus:border-primary outline-none text-[#101828] text-sm"
                                        placeholder="Longitude"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-[#EAECF0]">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-[#D0D5DD] text-[#344054] font-semibold hover:bg-gray-50 transition-all text-sm">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-8 py-2.5 bg-[#2E49B7] text-white rounded-xl font-semibold hover:bg-[#103778] disabled:opacity-50 transition-all shadow-[0px_4px_10px_rgba(46,73,183,0.25)] text-sm min-w-[140px]"
                        >
                            {submitting ? 'Saving...' : (editingProperty ? 'Update' : 'Confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<IUser | null>(null);
    const [properties, setProperties] = useState<IProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<IProperty | undefined>(undefined);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const loadData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [userData, propData] = await Promise.all([
                userService.getUserById(id),
                userService.getUserProperties(id)
            ]);
            setUser(userData);
            setProperties(propData);
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSaveProperty = async (payload: any) => {
        try {
            if (editingProperty) {
                await userService.updateProperty(editingProperty._id || editingProperty.id!, payload);
                setSuccessMsg('Property updated successfully');
            } else {
                await userService.assignProperty(payload);
                setSuccessMsg('Property assigned successfully');
            }
            setIsPropertyModalOpen(false);
            setEditingProperty(undefined);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
            loadData();
        } catch (error) {
            console.error('Failed to save property:', error);
            alert('Failed to save property. Please try again.');
        }
    };

    const openEditModal = (prop: IProperty) => {
        setEditingProperty(prop);
        setIsPropertyModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingProperty(undefined);
        setIsPropertyModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return (
        <div className="py-24 text-center">
            <h2 className="text-xl font-bold text-gray-900">User not found</h2>
            <Link to="/user-management" className="text-primary hover:underline mt-4 inline-block font-bold">Back to User Management</Link>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-10 pb-16">
            <div className="pt-8">
                <Link
                    to="/user-management"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-4 group"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to User Management
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Link to="/user-management" className="hover:text-primary transition-colors font-bold">User Management</Link>
                    <span className="text-gray-300 font-bold">/</span>
                    <span className="text-gray-900 font-bold">{user.firstName} {user.lastName}</span>
                </div>
            </div>

            {/* Block 1: User Details */}
            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm p-10">
                <div className="flex items-start gap-8">
                    <div className="w-32 h-32 flex-shrink-0">
                        <Avatar
                            src={user.profilePic}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            size="full"
                            className="rounded-2xl border-4 border-white shadow-md text-4xl"
                        />
                    </div>
                    <div className="flex-1 pt-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium tracking-tight">{user.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium tracking-tight">+{user.countryCode} {user.phone || 'No phone provided'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm ${
                                    user.status === 'active' ? 'bg-[#E6F9F4] text-[#2DB389]' : 'bg-[#FFF0ED] text-[#FF5C41]'
                                }`}>
                                    {user.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block 2: Assigned Properties */}
            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-10 py-8 border-b border-white/40 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Assigned Properties</h2>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
                    >
                        Assign Property
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {properties.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-sm font-medium text-gray-400 italic">No properties assigned to this user.</p>
                        </div>
                    ) : (
                        properties.map((prop) => (
                            <div key={prop._id} className="px-10 py-6 hover:bg-white/40 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-primary group-hover:bg-white transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-gray-900">{prop.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-[#B0BCCB] uppercase tracking-wider">
                                                    {prop.city}, {prop.country} {prop.postalCode && `(${prop.postalCode})`}
                                                </span>
                                                {prop.data?.Size && (
                                                    <>
                                                        <span className="text-gray-200">|</span>
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{prop.data.Size}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium italic">{prop.address1} {prop.address2}</p>
                                            <p className="text-[9px] text-gray-300 mt-1 uppercase tracking-widest font-bold">
                                                {prop.location?.coordinates?.[1].toFixed(4)}, {prop.location?.coordinates?.[0].toFixed(4)}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => openEditModal(prop)}
                                            className="p-2.5 text-gray-400 hover:text-primary hover:bg-white rounded-xl border border-transparent hover:border-gray-100 transition-all shadow-sm group-hover:shadow-md"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <SuccessPopup isOpen={isSuccess} message={successMsg} />

            {isPropertyModalOpen && (
                <PropertyModal
                    userId={id!}
                    onClose={() => {
                        setIsPropertyModalOpen(false);
                        setEditingProperty(undefined);
                    }}
                    onSave={handleSaveProperty}
                    editingProperty={editingProperty}
                />
            )}
        </div>
    );
};

export default UserDetail;
