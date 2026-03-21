import React, { useState, useEffect } from 'react';
import { IProductStep, IProductStepInput } from '../../services/ProductService';
import {

    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

interface ConfigInput extends IProductStepInput {
    id?: string;
}

interface SortableFieldProps {
    field: ConfigInput;
    index: number;
    onUpdate: (index: number, updates: Partial<ConfigInput>) => void;
    onRemove: (index: number) => void;
}

const SortableField: React.FC<SortableFieldProps> = ({ field, index, onUpdate, onRemove }) => {
    const [localOptions, setLocalOptions] = useState(field.options?.join(', ') || '');

    useEffect(() => {
        setLocalOptions(field.options?.join(', ') || '');
    }, [field.options]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id || `field-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.4 : 1,
    };

    const handleOptionsChange = (val: string) => {
        setLocalOptions(val);
        const optionsArray = val.split(',').map(s => s.trim()).filter(Boolean);
        onUpdate(index, { options: optionsArray });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-6 bg-white rounded-xl border transition-all ${isDragging ? 'shadow-xl border-primary/50' : 'border-[#EAECF0]'}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1 cursor-grab active:cursor-grabbing text-[#D0D5DD] hover:text-primary transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-[10px] font-bold text-[#667085] border border-[#EAECF0]">
                        {index + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-[#101828]">Field Configuration</h4>
                </div>
                <button
                    onClick={() => onRemove(index)}
                    className="p-1.5 text-[#98A2B3] hover:text-rose-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344054]">Label</label>
                    <input
                        type="text"
                        value={field.label}
                        onChange={(e) => onUpdate(index, { label: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D0D5DD] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#101828] text-sm"
                        placeholder="e.g. Full Name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344054]">Type</label>
                    <select
                        value={field.type}
                        onChange={(e) => onUpdate(index, { type: e.target.value as ConfigInput['type'] })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D0D5DD] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#101828] text-sm bg-white"
                    >
                        <option value="textbox">Textbox</option>
                        <option value="textarea">Textarea</option>
                        <option value="radio">Radio</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="select">Select</option>
                        <option value="date">Date picker</option>
                        <option value="files">File upload</option>
                    </select>
                </div>

                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-[#344054]">Options (comma separated)</label>
                        <input
                            type="text"
                            value={localOptions}
                            onChange={(e) => handleOptionsChange(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#D0D5DD] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#101828] text-sm"
                            placeholder="Option 1, Option 2, Option 3"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


interface StepConfigModalProps {
    onClose: () => void;
    onSave: (stepData: Partial<IProductStep>) => Promise<void>;
    initialData?: IProductStep;
    submitting: boolean;
}

const StepConfigModal: React.FC<StepConfigModalProps> = ({ onClose, onSave, initialData, submitting }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [order, setOrder] = useState<number>(initialData?.order || 0);
    const [inputs, setInputs] = useState<ConfigInput[]>(initialData?.inputs?.map(input => ({ ...input, id: input.id || Math.random().toString(36).substr(2, 9) })) || []);


    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setInputs((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleAddField = () => {
        setInputs([...inputs, { id: Math.random().toString(36).substr(2, 9), label: '', type: 'textbox' }]);
    };

    const handleRemoveInput = (index: number) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };

    const handleUpdateInput = (index: number, updates: Partial<ConfigInput>) => {
        const newInputs = [...inputs];
        newInputs[index] = { ...newInputs[index], ...updates };
        setInputs(newInputs);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Title is required');
            return;
        }

        await onSave({
            ...initialData,
            title,
            description,
            order,
            inputs: inputs.map(({ id, ...rest }) => rest) // Remove temporary IDs before saving
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#F5F8FF] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#D5D7DA] flex justify-between items-center bg-white z-10">
                    <div>
                        <h2 className="text-[20px] font-semibold text-[#101828]">
                            {initialData ? 'Edit Step' : 'Add New Step'}
                        </h2>
                        <p className="text-[#475467] text-sm mt-1">Configure step details and input fields.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                    <div className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-sm font-medium text-[#344054]">Step Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-[#D0D5DD] rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-[#101828]"
                                        placeholder="e.g. Identity Verification"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#344054]">Order</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-white border border-[#D0D5DD] rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-[#101828]"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-[#D0D5DD] rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none min-h-[100px] resize-none text-[#101828]"
                                    placeholder="Explain what needs to be done in this step..."
                                />
                            </div>
                        </div>

                        {/* Fields Configuration */}
                        <div className="pt-8 border-t border-[#D5D7DA]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#101828]">Input Fields</h3>
                                    <p className="text-xs text-[#667085] mt-0.5">Define what information users need to provide.</p>
                                </div>
                                <button
                                    onClick={handleAddField}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-[#103778] transition-all text-sm font-semibold shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Field
                                </button>
                            </div>

                            <div className="space-y-4">
                                {inputs.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#EAECF0]">
                                        <p className="text-sm font-medium text-[#667085]">No fields added yet.</p>
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={inputs.map(input => input.id!)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {inputs.map((input, index) => (
                                                <SortableField
                                                    key={input.id}
                                                    field={input}
                                                    index={index}
                                                    onUpdate={handleUpdateInput}
                                                    onRemove={handleRemoveInput}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-[#EAECF0] bg-white z-10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-[#D0D5DD] text-[#344054] font-semibold hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="px-8 py-2.5 bg-[#2E49B7] text-white rounded-xl font-semibold hover:bg-[#103778] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0px_4px_10px_rgba(46,73,183,0.25)] text-sm min-w-[140px] flex items-center justify-center"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : 'Save Step'}
                    </button>
                </div>
            </div>

        </div>
    );
};


export default StepConfigModal;
