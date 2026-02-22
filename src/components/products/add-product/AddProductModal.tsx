import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Step1_ProductInfo, { ProductInfoData } from './Step1_ProductInfo';
import Step2_ProductProcess, { ProductProcessData } from './Step2_ProductProcess';
import Step3_MapQuestion from './Step3_MapQuestion';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProductFormData {
    step1: ProductInfoData;
    step2: ProductProcessData;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ProductFormData>({
        step1: {
            productName: '',
            productType: '',
            imageFile: null
        },
        step2: {
            steps: []
        }
    });

    const [isSuccess, setIsSuccess] = useState(false);

    // Disable body scroll when open
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

    if (!isOpen) return null;

    const updateStep1 = (data: Partial<ProductInfoData>) => {
        setFormData(prev => ({ ...prev, step1: { ...prev.step1, ...data } }));
    };

    const updateStep2 = (data: Partial<ProductProcessData>) => {
        setFormData(prev => ({ ...prev, step2: { ...prev.step2, ...data } }));
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };


    // Stepper Configuration
    const steps = [
        { number: 1, title: 'Product Info' },
        { number: 2, title: 'Product Step' },
        { number: 3, title: 'Product Step & Questionery' },
    ];

    const handleSubmit = async () => {
        // Here we would call the service to save the product
        console.log('Final Form Data:', formData);
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
            setCurrentStep(1); // Reset for next time
            setFormData({
                step1: { productName: '', productType: '', imageFile: null },
                step2: { steps: [] }
            });
        }, 2500);
    };

    if (isSuccess) {
        return createPortal(
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                <div className="bg-white rounded-[16px] w-[380px] py-12 px-10 flex flex-col items-center shadow-xl">
                    <img src="/assets/success.gif" alt="Success" className="w-[80px] h-[80px] mb-6" />
                    <h3 className="text-center text-[16px] font-medium text-[#101828] leading-relaxed">
                        You have successfully added<br />the product
                    </h3>
                </div>
            </div>,
            document.body
        );
    }

    const modalContent = (
        <div className="fixed inset-0 left-[72px] z-[9999] bg-white/58 backdrop-blur-[22.8px] flex flex-col transition-all duration-300 !mt-0 origin-right items-center">

            {/* Header - Subtle transparency */}
            <div className="w-full flex items-center justify-between px-10 py-5 border-b border-[#D5D7DA] flex-none bg-white/20">
                <h2 className="text-xl font-semibold text-gray-900">Add Product</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Stepper Area */}
            <div className="w-full pt-8 pb-12 flex-none">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-end">
                        {steps.map((step, index) => {
                            const isActive = step.number === currentStep;
                            const isCompleted = step.number < currentStep;
                            return (
                                <React.Fragment key={step.number}>
                                    {/* Connector line BEFORE step (except first) */}
                                    {index > 0 && (
                                        <div className={`flex-1 h-[2px] mb-[10px] transition-all duration-300
                                            ${currentStep > index ? 'bg-primary' : 'bg-[#E9EAEB]'}`} />
                                    )}

                                    {/* Step Column: Label + Circle */}
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 mb-4
                                            ${isActive || isCompleted ? 'text-primary' : 'text-[#667085]'}`}>
                                            {step.title}
                                        </span>
                                        <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                                            ${isActive
                                                ? 'bg-white border-[4.5px] border-primary'
                                                : isCompleted
                                                    ? 'bg-primary'
                                                    : 'bg-white border-[1.5px] border-[#D5D7DA]'}`}>
                                            {isCompleted && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="w-full flex-1 overflow-y-auto px-10 pb-10">
                <div className="max-w-7xl mx-auto h-full">
                    {currentStep === 1 && (
                        <Step1_ProductInfo
                            data={formData.step1}
                            onUpdate={updateStep1}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2_ProductProcess
                            data={formData.step2}
                            onUpdate={updateStep2}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3_MapQuestion
                            data={formData.step2}
                            onBack={handleBack}
                            onConfirm={handleSubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AddProductModal;
