import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Step1_ProductInfo, { ProductInfoData } from './Step1_ProductInfo';
import productService, { IProduct } from '../../../services/ProductService';
import SuccessPopup from '../../common/SuccessPopup';
import Toast from '../../common/Toast';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: IProduct | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, initialData }) => {
    const [formData, setFormData] = useState<ProductInfoData>({
        productName: initialData?.name || '',
        userType: (initialData as any)?.userType || initialData?.type || '',
        imageFile: null
    });

    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Disable body scroll when open and initialize form data
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setError(null);
            if (initialData) {
                setFormData({
                    productName: initialData.name,
                    userType: (initialData as any).userType || initialData.type || '',
                    imageFile: null
                });
            } else {
                setFormData({ productName: '', userType: '', imageFile: null });
            }
        } else {
            document.body.style.overflow = 'unset';
            setError(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const updateFormData = (data: Partial<ProductInfoData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const payload = {
                name: formData.productName,
                description: "Tea estate harvesting",
                isPublic: true,
                userType: formData.userType,
                images: []
            };

            const productId = initialData?.id || (initialData as any)?._id;

            if (productId) {
                await productService.updateProduct(productId, payload as any);
            } else {
                await productService.createProduct(payload as any);
            }

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2500);
        } catch (err: any) {
            console.error("Failed to create product:", err);
            setError(err.message || 'Something went wrong. Please try again.');
            // Clear toast after a while
            setTimeout(() => setError(null), 4000);
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <>
            <div className="fixed inset-0 left-[72px] z-[9999] bg-white/58 backdrop-blur-[22.8px] flex flex-col transition-all duration-300 !mt-0 origin-right items-center">
                {/* Header - Subtle transparency */}
                <div className="w-full flex items-center justify-between px-10 py-5 border-b border-[#D5D7DA] flex-none bg-white/20">
                    <h2 className="text-xl font-semibold text-gray-900">{initialData ? 'Edit Product' : 'Add Product'}</h2>
                    <div className="flex items-center gap-4">
                        {initialData && (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-6 py-2 bg-[#6B7EB8] text-white rounded-lg hover:bg-[#5A6AA5] transition-colors font-medium text-sm disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Update'}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="w-full flex-1 overflow-y-auto px-10 pb-10">
                    <div className="max-w-7xl mx-auto h-full">
                        <Step1_ProductInfo
                            data={formData}
                            onUpdate={updateFormData}
                            onSubmit={handleSubmit}
                            isEdit={!!initialData}
                        />
                    </div>
                </div>
            </div>

            <SuccessPopup
                isOpen={isSuccess}
                message={`You have successfully ${initialData ? 'updated' : 'added'}\nthe product`}
            />

            {error && <Toast message={error} type="error" />}
        </>
    );

    return createPortal(modalContent, document.body);
};

export default AddProductModal;
