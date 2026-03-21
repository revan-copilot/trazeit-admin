import React from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
    message: string;
    type: 'error' | 'success';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
    return createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[12000] animate-toast-in">
            <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-[480px] border ${type === 'error' ? 'bg-[#FFF0ED] border-red-200 text-[#FF5C41]' : 'bg-[#E6F9F4] border-emerald-200 text-[#2DB389]'
                }`}>
                {type === 'error' ? (
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                )}
                <p className="text-[14px] font-medium leading-tight">{message}</p>
            </div>
        </div>,
        document.body
    );
};

export default Toast;
