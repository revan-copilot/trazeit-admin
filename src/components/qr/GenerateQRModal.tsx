import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import qrService, { IBatch } from '../../services/QRService';
import SuccessPopup from '../common/SuccessPopup';
import Toast from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/UserService';

interface GenerateQRModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormState {
    batch: string;
    label: string;
    title: string;
    description: string;
    quantity: string;
}

const emptyForm: FormState = {
    batch: '',
    label: '',
    title: '',
    description: '',
    quantity: ''
};

const GenerateQRModal: React.FC<GenerateQRModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState<FormState>(emptyForm);
    const [batches, setBatches] = useState<IBatch[]>([]);

    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setError(null);
            setFormData(emptyForm);
            loadOptions();
        } else {
            document.body.style.overflow = 'unset';
            setError(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const loadOptions = async () => {
        try {
            const batchList = await qrService.getBatches();
            setBatches(batchList);

            if (user?.userId) {
                const userData = await userService.getUserById(user.userId);
                if (userData?.company) {
                    const cid = typeof userData.company === 'object'
                        ? (userData.company as any)._id || (userData.company as any).id
                        : userData.company;
                    setCompanyId(cid || null);
                }
            }
        } catch (err) {
            console.error('Failed to load options:', err);
        }
    };

    if (!isOpen) return null;

    const updateField = (field: keyof FormState, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const selectedBatch = batches.find(b => b._id === formData.batch);
        if (!selectedBatch) {
            setError('Please select a batch.');
            setTimeout(() => setError(null), 4000);
            return;
        }

        const productId = typeof selectedBatch.product === 'object' && selectedBatch.product !== null
            ? selectedBatch.product?._id
            : selectedBatch.product;

        if (!productId) {
            setError('Selected batch is missing product info.');
            setTimeout(() => setError(null), 4000);
            return;
        }

        if (!companyId) {
            setError('Could not retrieve company information for the current user.');
            setTimeout(() => setError(null), 4000);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            await qrService.createQR({
                batch: formData.batch,
                product: productId,
                company: companyId,
                label: formData.label,
                title: formData.title,
                description: formData.description,
                quantity: Number(formData.quantity) || 0,
                data: { secret: '' }
            });

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2500);
        } catch (err: any) {
            console.error('Failed to generate QR:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            setTimeout(() => setError(null), 4000);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-[#2E49B7] outline-none transition-all placeholder:text-gray-400 text-sm bg-white";
    const labelClass = "block text-base font-medium text-gray-900";

    const modalContent = (
        <>
            <div className="fixed inset-0 left-[72px] z-[9999] bg-white/58 backdrop-blur-[22.8px] flex flex-col transition-all duration-300 !mt-0 origin-right items-center">
                <div className="w-full flex items-center justify-between px-10 py-5 border-b border-[#D5D7DA] flex-none bg-white/20">
                    <h2 className="text-xl font-semibold text-gray-900">Generate QR</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="w-full flex-1 overflow-y-auto px-10 pb-10">
                    <div className="flex flex-col gap-10 py-5">
                        <div className="max-w-3xl mx-auto w-full">
                            <h3 className="text-[28px] font-semibold text-gray-900 leading-tight">QR Details</h3>
                        </div>

                        <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-8">
                            <div className="flex flex-col gap-3">
                                <label className={labelClass}>Batch</label>
                                <div className="relative">
                                    <select
                                        value={formData.batch}
                                        onChange={(e) => updateField('batch', e.target.value)}
                                        className={`${inputClass} appearance-none text-gray-600`}
                                    >
                                        <option value="" disabled>Select Batch</option>
                                        {batches.map((b) => (
                                            <option key={b._id} value={b._id}>
                                                {b.batchNo}{b.product?.name ? ` - ${b.product.name}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className={labelClass}>Label</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => updateField('label', e.target.value)}
                                    placeholder="Enter label"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className={labelClass}>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="Enter title"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className={labelClass}>Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Enter description"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className={labelClass}>Quantity</label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => updateField('quantity', e.target.value)}
                                    placeholder="Enter quantity"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-h-[40px]"></div>

                        <div className="w-full h-px bg-[#D5D7DA] mb-2" />
                        <div className="flex justify-end pr-4 lg:pr-10">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-8 py-3 rounded-xl bg-[#2E49B7] text-white font-semibold hover:bg-[#103778] transition-all text-sm shadow-[0px_4px_10px_rgba(46,73,183,0.25)] disabled:opacity-50"
                            >
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SuccessPopup
                isOpen={isSuccess}
                message={'You have successfully\ngenerated the QR code'}
            />

            {error && <Toast message={error} type="error" />}
        </>
    );

    return createPortal(modalContent, document.body);
};

export default GenerateQRModal;
