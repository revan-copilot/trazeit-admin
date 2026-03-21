import React, { useState, useRef, useEffect } from 'react';
import { assetPath } from '../../utils/assetPath';

interface UploadQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { file?: File; questions?: { text: string }[] }) => Promise<void> | void;
}

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif'];
const ALLOWED_EXTENSIONS = 'SVG, PNG, JPG or GIF (max. 800×400px)';

const UploadQuestionModal: React.FC<UploadQuestionModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [questionText, setQuestionText] = useState('');
    const [addedQuestions, setAddedQuestions] = useState<{ id: string, text: string }[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ file?: string; general?: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Reset form on close
    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen]);

    const resetForm = () => {
        setSelectedFile(null);
        setQuestionText('');
        setAddedQuestions([]);
        setEditingId(null);
        setIsDragging(false);
        setErrors({});
    };

    const handleFileSelect = (file: File) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            setErrors(prev => ({ ...prev, file: `Invalid type. Upload a ${ALLOWED_EXTENSIONS.split(' ')[0]} file.` }));
            return;
        }
        setErrors(prev => ({ ...prev, file: undefined, general: undefined }));
        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
        if (e.target) e.target.value = '';
    };

    const handleCreateQuestion = () => {
        if (!questionText.trim()) return;

        if (editingId) {
            setAddedQuestions(prev => prev.map(q => q.id === editingId ? { ...q, text: questionText.trim() } : q));
            setEditingId(null);
        } else {
            setAddedQuestions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), text: questionText.trim() }]);
        }
        setQuestionText('');
        setErrors(prev => ({ ...prev, general: undefined }));
    };

    const handleEditQuestion = (id: string, text: string) => {
        setQuestionText(text);
        setEditingId(id);
    };

    const handleDeleteQuestion = (id: string) => {
        setAddedQuestions(prev => prev.filter(q => q.id !== id));
        if (editingId === id) {
            setEditingId(null);
            setQuestionText('');
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile && addedQuestions.length === 0) {
            setErrors({ general: 'Please upload a file or add at least one question.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                file: selectedFile || undefined,
                questions: addedQuestions.map(q => ({ text: q.text }))
            } as any);

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                resetForm();
                onClose();
            }, 2500); // Wait 2.5 seconds to show the gif
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                <div className="bg-white rounded-[16px] w-[380px] py-12 px-10 flex flex-col items-center shadow-xl">
                    <img src={assetPath('assets/success.gif')} alt="Success" className="w-[80px] h-[80px] mb-6" />
                    <h3 className="text-center text-[16px] font-medium text-[#101828]">
                        You have successfully created<br />the list of question
                    </h3>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 bottom-0 right-0 left-[80px] z-[100] flex flex-col bg-[#F3F4F6]/70 backdrop-blur-sm">

            {/* ── Top Header Bar ─────────────────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-[#F8F9FA]/80 border-b border-[#D5D7DA]">
                <h2 className="text-[16px] font-semibold text-[#101828]">Upload Question</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* ── Two-column body ─────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 bg-transparent gap-8 p-8">

                {/* LEFT — Overview card */}
                <div className="flex-[6] min-w-0 flex flex-col bg-white/80 backdrop-blur-[22px] rounded-xl shadow-sm border border-gray-100/50 overflow-y-auto h-full">

                    {/* Overview Header */}
                    <div className="px-8 pt-6 pb-4">
                        <h3 className="text-[15px] font-semibold text-[#101828]">Overview</h3>
                    </div>

                    <div className="px-8">
                        <div className="h-px bg-gray-200/60" />
                    </div>

                    {/* Overview Body */}
                    <div className="flex-1 relative flex flex-col p-8 overflow-y-auto">

                        {addedQuestions.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                {/* Skeleton background content */}
                                <div className="absolute inset-0 p-8 space-y-6 opacity-30 pointer-events-none"></div>

                                {/* No Data Text */}
                                <div className="z-10 text-[15px] text-[#475467] font-medium tracking-wide">
                                    No Data
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-4">
                                {addedQuestions.map((q) => (
                                    <div key={q.id} className="flex items-start justify-between py-3 border-b border-gray-100 group">
                                        <p className="text-[14px] text-[#101828] font-medium pr-4">{q.text}</p>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleEditQuestion(q.id, q.text)} className=" hover:text-[#6B7EB8]" title="Edit">
                                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDeleteQuestion(q.id)} className="hover:text-red-500" title="Delete">
                                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Overview Footer — Cancel + Confirm */}
                    <div className="px-8">
                        <div className="h-px bg-gray-200/60" />
                    </div>

                    <div className="px-8 py-5 flex items-center justify-end gap-3 bg-white">
                        <button
                            onClick={onClose}
                            className="px-6 py-[9px] text-[14px] font-semibold text-[#344054] bg-white border border-[#D5D7DA] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-6 py-[9px] text-[14px] font-semibold text-white rounded-lg transition-colors ${isSubmitting ? 'bg-gray-400' : 'bg-[#6B7EB8] hover:bg-[#5A6AA5]'}`}
                        >
                            {isSubmitting ? 'Confirming...' : 'Confirm'}
                        </button>
                    </div>
                </div>

                {/* RIGHT — Upload form card */}
                <div className="flex-[4] min-w-0 flex flex-col bg-white/80 backdrop-blur-[22px] rounded-xl h-fit shadow-sm border border-gray-100/50 z-10">
                    <div className="p-8 flex flex-col">

                        {/* Upload Questions section */}
                        <h3 className="text-[14px] font-semibold text-[#101828] mb-3">Upload Questions:</h3>

                        {/* Drop Zone */}
                        <div
                            className={`border border-dashed rounded-xl flex flex-col items-center justify-center py-7 px-4 cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white hover:border-primary/50'
                                } ${errors.file ? 'border-red-400' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={handleDrop}
                        >
                            <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg,.gif" className="hidden" onChange={handleInputChange} />

                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-medium text-[#101828] text-center break-all">{selectedFile.name}</p>
                                    <button onClick={e => { e.stopPropagation(); setSelectedFile(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mb-3 shadow-sm">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-[13px] text-center mb-1">
                                        <span className="text-[#553C9A] font-medium tracking-wide">Click to upload</span>
                                        <span className="text-[#667085]"> or drag and drop</span>
                                    </p>
                                    <p className="text-[12px] text-[#98A2B3]">{ALLOWED_EXTENSIONS}</p>
                                </>
                            )}
                        </div>
                        {errors.file && <p className="text-xs text-red-500 mt-1.5">{errors.file}</p>}

                        {/* OR Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-[#E4E7EC]" />
                            <span className="text-[12px] text-[#98A2B3] font-medium">OR</span>
                            <div className="flex-1 h-px bg-[#E4E7EC]" />
                        </div>

                        {/* Manual entry */}
                        <label className="block text-[14px] font-semibold text-[#101828] mb-2">Create Question Manual</label>
                        <textarea
                            rows={5}
                            placeholder="Enter Question"
                            value={questionText}
                            onChange={e => {
                                setQuestionText(e.target.value);
                                if (e.target.value.trim()) setErrors(prev => ({ ...prev, general: undefined }));
                            }}
                            className={`w-full rounded-xl border px-[14px] py-[10px] text-[14px] text-[#101828] placeholder-[#98A2B3] resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all bg-white shadow-sm ${errors.general ? 'border-red-400' : 'border-gray-200'
                                }`}
                        />
                        {errors.general && <p className="text-xs text-red-500 mt-1.5">{errors.general}</p>}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Right panel bottom buttons */}
                        <div className="flex justify-end gap-6 pt-6">
                            <button
                                onClick={onClose}
                                className="text-[14px] font-semibold text-[#344054] hover:text-[#101828]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateQuestion}
                                className={`text-[14px] font-semibold ${questionText.trim() ? 'text-[#6B7EB8] hover:text-[#5A6AA5]' : 'text-[#98A2B3]'}`}
                                disabled={!questionText.trim()}
                            >
                                {editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UploadQuestionModal;
