import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IQRCode } from '../../services/QRService';
import Toast from '../common/Toast';

interface ShowQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrItem: IQRCode | null;
}

const ShowQRModal: React.FC<ShowQRModalProps> = ({ isOpen, onClose, qrItem }) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

    if (!isOpen || !qrItem) return null;

    const detailUrl = `${window.location.origin}/trazeit-admin/qr/${qrItem.batch?._id || qrItem._id}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(detailUrl)}`;

    const triggerToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(detailUrl);
            triggerToast('Link copied to clipboard successfully!', 'success');
        } catch (err) {
            console.error('Failed to copy link:', err);
            triggerToast('Failed to copy link to clipboard.', 'error');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(qrImageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `QR_${qrItem.batch?.batchNo || qrItem._id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            triggerToast('QR code downloaded successfully!', 'success');
        } catch (error) {
            console.error('Failed to download QR code image:', error);
            // Fallback: open in new tab
            window.open(qrImageUrl, '_blank');
            triggerToast('QR code opened in new tab for download.', 'success');
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[4px] transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden transition-all transform z-10 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
                    <h3 className="text-lg font-bold text-gray-900">QR Code Details</h3>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 hover:bg-gray-150 rounded-lg transition-colors text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col items-center text-center gap-6">
                    {/* QR Code Container */}
                    <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center">
                        <img 
                            src={qrImageUrl} 
                            alt="QR Code" 
                            className="w-48 h-48 object-contain"
                        />
                    </div>

                    {/* QR Info details */}
                    <div className="w-full space-y-3 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Activity / Batch Title</span>
                            <span className="text-sm font-semibold text-gray-900 block truncate" title={qrItem.title}>{qrItem.title}</span>
                        </div>
                        {qrItem.batch && (
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Batch Number</span>
                                <span className="text-sm font-bold text-primary block">{qrItem.batch.batchNo}</span>
                            </div>
                        )}
                        {qrItem.product && qrItem.product.length > 0 && (
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Linked Product</span>
                                <span className="text-sm font-medium text-gray-700 block truncate">{qrItem.product[0].name}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Encoded Link</span>
                            <span className="text-[11px] text-gray-500 font-mono break-all block mt-1 max-h-16 overflow-y-auto select-all p-1 bg-white border border-gray-200 rounded">
                                {detailUrl}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleCopyLink}
                        className="flex-1 px-4 py-2.5 bg-white border border-[#D5D7DA] text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 10v-5a1 1 0 011-1h2m-6 5a1 1 0 001-1v-3a1 1 0 00-1-1m3 4a1 1 0 001-1v-3a1 1 0 00-1-1" />
                        </svg>
                        Copy Link
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR
                    </button>
                </div>
            </div>

            {toastMessage && <Toast message={toastMessage} type={toastType} />}
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ShowQRModal;
