import React from 'react';
import { createPortal } from 'react-dom';
import { assetPath } from '../../utils/assetPath';

interface SuccessPopupProps {
    isOpen: boolean;
    message: string;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ isOpen, message }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[16px] w-[420px] py-12 px-10 flex flex-col items-center shadow-2xl animate-fade-in translate-y-[-20px] animate-slide-up">
                <img src={assetPath('assets/success.gif')} alt="Success" className="w-[100px] h-[100px] mb-6" />
                <h3 className="text-center text-[18px] font-semibold text-[#101828] leading-relaxed whitespace-pre-line">
                    {message}
                </h3>
            </div>
        </div>,
        document.body
    );
};

export default SuccessPopup;
