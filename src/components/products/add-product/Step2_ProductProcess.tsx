import React, { useState } from 'react';
import { assetPath } from '../../../utils/assetPath';

export interface ProcessStep {
    id: string;
    processName: string;
    fromDate: string;
    toDate: string;
}

export interface ProductProcessData {
    steps?: ProcessStep[];
}

interface Step2Props {
    data: ProductProcessData;
    onUpdate: (data: Partial<ProductProcessData>) => void;
    onNext: () => void;
    onBack: () => void;
}

const Step2_ProductProcess: React.FC<Step2Props> = ({ data, onUpdate, onNext, onBack }) => {
    const [currentStep, setCurrentStep] = useState<ProcessStep>({
        id: '',
        processName: '',
        fromDate: '',
        toDate: ''
    });
    const [editingStepId, setEditingStepId] = useState<string | null>(null);

    const steps = data.steps || [];

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const isDateValid = () => {
        if (!currentStep.fromDate || !currentStep.toDate) return true;
        return new Date(currentStep.toDate) >= new Date(currentStep.fromDate);
    };

    const handleAddStep = () => {
        if (!currentStep.processName || !isDateValid()) return;

        if (editingStepId) {
            const updatedSteps = steps.map((s: ProcessStep) => s.id === editingStepId ? { ...currentStep, id: editingStepId } : s);
            onUpdate({ steps: updatedSteps });
            setEditingStepId(null);
        } else {
            const newStep = { ...currentStep, id: Date.now().toString() };
            onUpdate({ steps: [...steps, newStep] });
        }

        // Reset form
        handleReset();
    };

    const handleEdit = (step: ProcessStep) => {
        setCurrentStep(step);
        setEditingStepId(step.id);
    };

    const handleReset = () => {
        setCurrentStep({
            id: '',
            processName: '',
            fromDate: '',
            toDate: ''
        });
        setEditingStepId(null);
    };

    return (
        <div className="w-full flex flex-col gap-10 py-5 h-full">

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Form Card - Narrower (~33%, 4/12) */}
                <div className="lg:col-span-4 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-fit">
                    <div className="mb-8">
                        <h3 className="text-[18px] font-bold text-[#101828] leading-tight">2. Product Step</h3>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Process Name */}
                        <div className="flex flex-col gap-2">
                            <label className="block text-[14px] font-semibold text-[#101828]">Name of the Process</label>
                            <input
                                type="text"
                                value={currentStep.processName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentStep({ ...currentStep, processName: e.target.value })}
                                placeholder="Enter Process Name"
                                className="w-full px-4 py-[10px] rounded-lg border border-[#D0D5DD] focus:ring-1 focus:ring-primary/40 focus:border-[#2E49B7] outline-none transition-all placeholder-[#98A2B3] text-[14px] bg-white shadow-sm"
                            />
                        </div>

                        {/* Dates Row */}
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-2 flex-1">
                                <label className="block text-[14px] font-semibold text-[#101828]">From</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                            e.target.type = 'date';
                                            e.target.showPicker();
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                            e.target.type = 'text';
                                        }}
                                        value={document.activeElement === null || (document.activeElement as HTMLInputElement).placeholder !== "From Date" ? (currentStep.fromDate ? formatDate(currentStep.fromDate) : '') : currentStep.fromDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentStep({ ...currentStep, fromDate: e.target.value })}
                                        placeholder="From Date"
                                        className="w-full px-4 py-[10px] rounded-lg border border-[#D0D5DD] focus:ring-1 focus:ring-primary/40 focus:border-[#2E49B7] outline-none transition-all placeholder-[#98A2B3] text-[14px] text-gray-900 bg-white shadow-sm"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <img src={assetPath('assets/calendar.svg')} alt="calendar" className="w-5 h-5 opacity-60" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 flex-1">
                                <label className="block text-[14px] font-semibold text-[#101828]">End</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                            e.target.type = 'date';
                                            e.target.showPicker();
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                            e.target.type = 'text';
                                        }}
                                        value={document.activeElement === null || (document.activeElement as HTMLInputElement).placeholder !== "End Date" ? (currentStep.toDate ? formatDate(currentStep.toDate) : '') : currentStep.toDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentStep({ ...currentStep, toDate: e.target.value })}
                                        placeholder="End Date"
                                        className="w-full px-4 py-[10px] rounded-lg border border-[#D0D5DD] focus:ring-1 focus:ring-primary/40 focus:border-[#2E49B7] outline-none transition-all placeholder-[#98A2B3] text-[14px] text-gray-900 bg-white shadow-sm"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <img src={assetPath('assets/calendar.svg')} alt="calendar" className="w-5 h-5 opacity-60" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 pt-6 border-t border-[#E9EAEB] flex justify-end gap-6 items-center">
                            <button
                                onClick={handleReset}
                                className="text-[14px] font-semibold text-[#344054] hover:text-[#101828] transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleAddStep}
                                className={`text-[14px] font-semibold transition-colors ${currentStep.processName && isDateValid() ? 'text-[#2E49B7]' : 'text-[#98A2B3]'}`}
                                disabled={!currentStep.processName || !isDateValid()}
                            >
                                {editingStepId ? 'Update' : 'Add'}
                            </button>
                        </div>
                        {!isDateValid() && (
                            <p className="text-red-500 text-[12px] mt-1 text-right italic font-medium">End date cannot be earlier than start date</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Overview Card - Wider (~67%, 8/12) */}
                <div className="lg:col-span-8 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-[650px] relative">
                    <div className="mb-6">
                        <h3 className="text-[18px] font-bold text-[#101828]">Steps Overview</h3>
                        <div className="w-full h-px bg-[#E9EAEB] mt-6"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {steps.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-[#101828]">
                                <span className="font-bold text-xl tracking-tight">No Data</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center justify-between py-4 border-b border-[#E9EAEB] group bg-white">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[14px] font-bold text-[#101828]">Step {index + 1}: {step.processName}</span>
                                            <span className="text-[13px] text-[#667085] font-medium">({formatDate(step.fromDate)} to {formatDate(step.toDate)})</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleEdit(step)}
                                                className="p-1 text-[#475467] hover:text-[#2E49B7] transition-colors"
                                            >
                                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newSteps = [...steps];
                                                    newSteps.splice(index, 1);
                                                    onUpdate({ steps: newSteps });
                                                }}
                                                className="p-1 text-[#475467] hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation Footer Inside Card */}
                    <div className="mt-6 pt-6 border-t border-[#E9EAEB] flex justify-end gap-4">
                        <button
                            onClick={onBack}
                            className="px-6 py-[10px] rounded-lg border border-[#D0D5DD] text-[#344054] font-semibold hover:bg-gray-50 transition-colors text-[14px] bg-white shadow-sm"
                        >
                            Back
                        </button>
                        <button
                            onClick={onNext}
                            className="px-6 py-[10px] rounded-lg bg-[#2E49B7] text-white font-semibold hover:bg-[#103778] transition-all text-[14px] shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    display: none;
                    -webkit-appearance: none;
                }
            `}</style>
        </div>
    );
};

export default Step2_ProductProcess;
