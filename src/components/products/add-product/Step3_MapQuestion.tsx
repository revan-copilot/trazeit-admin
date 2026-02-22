import React, { useState } from 'react';
import { ProductProcessData } from './Step2_ProductProcess';

interface Step3Props {
    data: ProductProcessData;
    onBack: () => void;
    onConfirm: () => void;
}

// Mock question data for demonstrating the assignment checklist
const MOCK_QUESTIONS = [
    { id: 'q1', text: 'What raw materials are used in this product?' },
    { id: 'q2', text: 'Where did each raw material come from?' },
    { id: 'q3', text: 'Are any restricted or regulated materials used?' },
    { id: 'q4', text: 'Do suppliers provide certifications for raw materials?' },
    { id: 'q5', text: 'Are suppliers compliant with local and international regulations?' },
    { id: 'q6', text: 'What certifications does the supplier hold (ISO, FSC, Fair Trade, etc.)?' },
    { id: 'q7', text: 'Are there any compliance risks associated with this supplier?' },
    { id: 'q8', text: 'Is the manufacturing facility compliant with safety standards?' },
    { id: 'q9', text: 'How is waste managed during production?' },
    { id: 'q10', text: 'What is the carbon footprint of the transportation method?' },
    { id: 'q11', text: 'Are ethical labor practices followed at all stages?' },
];

const Step3_MapQuestion: React.FC<Step3Props> = ({ data, onBack, onConfirm }) => {
    const steps = data.steps || [];

    // State to track which step is currently selected for mapping questions. 
    // null = List View, string = Split Detail View.
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

    // Track assigned questions per step: { stepId: [questionId1, questionId2] }
    const [mappedQuestions, setMappedQuestions] = useState<Record<string, string[]>>({});

    // Temporary state to hold selections while in the active Split View before "Map Question" is clicked
    const [tempSelections, setTempSelections] = useState<string[]>([]);

    // Total required: one for each step. Mapped: count of steps that have assigned questions.
    const totalRequiredQuestions = steps.length;
    const totalMappedQuestions = Object.keys(mappedQuestions).length;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const handleOpenMapping = (stepId: string) => {
        setTempSelections(mappedQuestions[stepId] || []);
        setSelectedStepId(stepId);
    };

    const handleToggleQuestion = (questionId: string) => {
        setTempSelections(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleSaveMapping = () => {
        if (selectedStepId) {
            setMappedQuestions(prev => ({
                ...prev,
                [selectedStepId]: tempSelections
            }));
            setSelectedStepId(null);
        }
    };

    const handleResetMapping = () => {
        setTempSelections([]);
    };

    // --- List View Layout ---
    if (!selectedStepId) {
        return (
            <div className="w-full h-full flex flex-col pt-5 pb-8 min-h-[650px]">
                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col flex-1 relative">
                    {/* Header */}
                    <div className="mb-6 flex items-baseline gap-2">
                        <h3 className="text-[18px] font-bold text-[#101828]">Map Question</h3>
                        <span className="text-[13px] text-[#039855] italic font-medium">
                            (Question needs to Assign ({totalMappedQuestions}/{totalRequiredQuestions}))
                        </span>
                    </div>

                    <div className="w-full h-px bg-[#E9EAEB] mb-4"></div>

                    {/* Step List */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                        {steps.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#101828]">
                                <span className="font-bold text-[16px]">No steps defined. Go back and add steps.</span>
                            </div>
                        ) : (
                            steps.map((step, index) => {
                                const qCount = (mappedQuestions[step.id] || []).length;
                                return (
                                    <div key={step.id} className="flex items-center justify-between py-[18px] border-b border-[#E9EAEB] bg-white group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[14px] font-bold text-[#101828]">Step {index + 1}: {step.processName}</span>
                                            <span className="text-[13px] text-[#667085] font-medium">({formatDate(step.fromDate)} to {formatDate(step.toDate)})</span>
                                            {qCount > 0 && (
                                                <span className="text-[13px] text-[#2E49B7] font-semibold ml-2">{qCount} Q</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleOpenMapping(step.id)}
                                            className="flex items-center gap-2 text-[#2E49B7] hover:text-[#103778] transition-colors"
                                        >
                                            <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            <span className="text-[14px] font-bold">Map Question</span>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 flex justify-end gap-4 border-t border-[#E9EAEB]">
                        <button
                            onClick={onBack}
                            className="px-6 py-[10px] rounded-lg border border-[#D0D5DD] text-[#344054] font-semibold hover:bg-gray-50 transition-colors text-[14px] bg-white shadow-sm"
                        >
                            Back
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-[10px] rounded-lg bg-[#2E49B7] text-white font-semibold hover:bg-[#103778] transition-all text-[14px] shadow-sm"
                        >
                            Confirm Product
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Split View Layout (Active Mapping) ---
    const activeStep = steps.find(s => s.id === selectedStepId);
    if (!activeStep) return null; // Failsafe
    const activeIndex = steps.findIndex(s => s.id === selectedStepId);

    return (
        <div className="w-full h-full flex flex-col pt-5 pb-8 min-h-[650px]">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Context List */}
                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-full relative">
                    <div className="mb-6 flex items-baseline gap-2">
                        <h3 className="text-[18px] font-bold text-[#101828]">Map Question</h3>
                        <span className="text-[13px] text-[#667085] italic font-medium">
                            (Question needs to Assign ({totalMappedQuestions}/{totalRequiredQuestions}))
                        </span>
                    </div>

                    <div className="w-full h-px bg-[#E9EAEB] mb-4"></div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                        {steps.map((step, index) => {
                            const isActive = step.id === selectedStepId;
                            const qCount = (mappedQuestions[step.id] || []).length;

                            return (
                                <div key={step.id} className={`flex items-center justify-between py-[18px] border-b border-[#E9EAEB] transition-colors bg-white`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[14px] font-bold ${isActive ? 'text-[#101828]' : 'text-[#98A2B3]'}`}>
                                            Step {index + 1}: {step.processName}
                                        </span>
                                        <span className="text-[13px] text-[#98A2B3] font-medium">({formatDate(step.fromDate)} to {formatDate(step.toDate)})</span>
                                        {qCount > 0 && !isActive && (
                                            <span className="text-[13px] text-[#667085] ml-2">{qCount} Q</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleOpenMapping(step.id)}
                                        className="flex items-center gap-2 text-[#2E49B7] hover:underline transition-all"
                                    >
                                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        <span className="text-[14px] font-bold">Map Question</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 flex justify-end gap-4 border-t border-[#E9EAEB]">
                        <button
                            onClick={onBack}
                            className="px-6 py-[10px] rounded-lg border border-[#D0D5DD] text-[#344054] font-semibold hover:bg-gray-50 transition-colors text-[14px] bg-white shadow-sm"
                        >
                            Back
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-[10px] rounded-lg bg-[#5A6AA5] text-white font-semibold transition-all text-[14px] shadow-sm cursor-not-allowed opacity-80"
                        >
                            Confirm Product
                        </button>
                    </div>
                </div>

                {/* Right Column: Mapping Interface */}
                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-full relative">
                    <div className="mb-6 flex items-center gap-2 flex-wrap">
                        <span className="text-[18px] font-bold text-[#101828]">Map Question:</span>
                        <span className="text-[14px] font-bold text-[#101828]">Step {activeIndex + 1}: {activeStep.processName}</span>
                        <span className="text-[13px] text-[#667085] font-medium">({formatDate(activeStep.fromDate)} to {formatDate(activeStep.toDate)})</span>
                    </div>

                    <div className="w-full h-px bg-[#E9EAEB] mb-6"></div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search by name, keywords & more"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200/50 focus:ring-1 focus:ring-primary/40 focus:border-[#2E49B7] outline-none transition-all placeholder:text-[#98A2B3] text-[14px] bg-white shadow-sm"
                        />
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-[#98A2B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Question List with Checkboxes */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-5">
                        {MOCK_QUESTIONS.map((q) => {
                            const isChecked = tempSelections.includes(q.id);
                            return (
                                <div
                                    key={q.id}
                                    className="flex items-start gap-4 cursor-pointer group"
                                    onClick={() => handleToggleQuestion(q.id)}
                                >
                                    <div className={`mt-0.5 w-[20px] h-[20px] rounded flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-[#2E49B7] border border-[#2E49B7]' : 'border border-[#D0D5DD] bg-white group-hover:border-[#2E49B7]/50'}`}>
                                        {isChecked && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[14px] font-bold text-[#101828] leading-snug pt-[1px]">{q.text}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Panel Footer Actions */}
                    <div className="mt-6 pt-6 flex justify-end gap-8 items-center border-t border-[#E9EAEB]">
                        <button
                            onClick={handleResetMapping}
                            className="text-[14px] font-bold text-[#101828] hover:text-[#344054] transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSaveMapping}
                            className="text-[14px] font-bold text-[#2E49B7] hover:text-[#103778] transition-colors"
                        >
                            Map Question
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Step3_MapQuestion;
