import React, { useRef } from 'react';
import { assetPath } from '../../../utils/assetPath';

export interface ProductInfoData {
    image?: string;
    productName: string;
    userType: string;
    imageFile?: File | null;
}

interface Step1Props {
    data: ProductInfoData;
    onUpdate: (data: Partial<ProductInfoData>) => void;
    onSubmit: () => void;
    isEdit?: boolean;
}

const Step1_ProductInfo: React.FC<Step1Props> = ({ data, onUpdate, onSubmit, isEdit }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate({ imageFile: file });
        }
    };

    const triggerUpload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-10 py-5">

            {/* Title - Left aligned to card */}
            <div className="max-w-3xl mx-auto w-full">
                <h3 className="text-[28px] font-semibold text-gray-900 leading-tight">1. Product info</h3>
            </div>

            <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-8">
                {/* Upload Section */}
                <div className="flex flex-col gap-3">
                    <label className="block text-base font-medium text-gray-900">Upload Product Image</label>
                    <input
                        type="file"
                        id="product-image-upload"
                        name="product-image"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <div
                        onClick={triggerUpload}
                        className="border border-[#D5D7DA] border-dashed rounded-xl p-10 flex flex-col items-center justify-center bg-white/50 cursor-pointer hover:bg-white/80 transition-colors min-h-[200px]"
                    >
                        {data.imageFile ? (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 border border-indigo-100">
                                    <img src={assetPath('assets/upload-icon.svg')} alt="Upload" className="w-10 h-10" />
                                </div>
                                <p className="text-sm font-semibold text-gray-900">{data.imageFile.name}</p>
                                <p className="text-xs text-[#6941C6] mt-1 font-semibold">Change files</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 mb-4 flex items-center justify-center">
                                    <img src={assetPath('assets/upload-icon.svg')} alt="Upload" className="w-12 h-12" />
                                </div>
                                <p className="text-sm text-center">
                                    <span className="text-[#6941C6] font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-center text-[#667085] mt-1 font-medium">
                                    SVG, PNG, JPG or GIF (max. 800x400px)
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Name Input */}
                <div className="flex flex-col gap-3">
                    <label className="block text-base font-medium text-gray-900">Name of the Product</label>
                    <input
                        type="text"
                        value={data.productName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ productName: e.target.value })}
                        placeholder="Enter Product"
                        className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-[#2E49B7] outline-none transition-all placeholder:text-gray-400 text-sm bg-white"
                    />
                </div>

                {/* Type Selection */}
                <div className="flex flex-col gap-3">
                    <label className="block text-base font-medium text-gray-900">User Type</label>
                    <div className="relative">
                        <select
                            value={data.userType}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ userType: e.target.value })}
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-[#2E49B7] outline-none transition-all text-sm appearance-none bg-white text-gray-600"
                        >
                            <option value="" disabled>Select User Type</option>
                            <option value="producer">producer</option>
                            <option value="processor">processor</option>
                            <option value="retailer">retailer</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Space Filler */}
            <div className="flex-1 min-h-[40px]"></div>

            {/* Divider and Footer */}
            <div className="w-full h-px bg-[#D5D7DA] mb-2" />
            <div className="flex justify-end pr-4 lg:pr-10">
                <button
                    onClick={onSubmit}
                    className="px-8 py-3 rounded-xl bg-[#2E49B7] text-white font-semibold hover:bg-[#103778] transition-all text-sm shadow-[0px_4px_10px_rgba(46,73,183,0.25)]"
                >
                    {isEdit ? 'Update' : 'Save'}
                </button>
            </div>
        </div>
    );
};

export default Step1_ProductInfo;
