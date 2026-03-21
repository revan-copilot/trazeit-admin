import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService, { IProduct, IProductStep } from '../services/ProductService';
import Avatar from '../components/common/Avatar';
import StepConfigModal from '../components/products/StepConfigModal';
import SuccessPopup from '../components/common/SuccessPopup';
import TablePagination from '../components/common/TablePagination';

// ──────────────────────────────────────────────
// Helper Component: Step Item
// ──────────────────────────────────────────────

interface StepItemProps {
    step: IProductStep;
    isExpanded: boolean;
    stepDetail?: IProductStep;
    isLoadingDetail: boolean;
    onToggle: (id: string) => void;
    onEdit: (step: IProductStep) => void;
}

const StepItem: React.FC<StepItemProps> = ({
    step,
    isExpanded,
    stepDetail,
    isLoadingDetail,
    onToggle,
    onEdit
}) => {
    return (
        <div className="transition-all duration-200 border-b border-gray-100 last:border-0">
            <div className={`flex items-center px-10 py-6 cursor-pointer group hover:bg-white/40 ${isExpanded ? 'bg-white/60 border-l-4 border-primary' : ''}`} onClick={() => onToggle(step.id)}>
                <div className="flex flex-1 items-center gap-6">
                    <div className="flex flex-col">
                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                            {step.title}
                        </h3>
                        {step.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{step.description}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(step); }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
                        title="Edit Step"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <div className={`p-1 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Expanded Inputs View */}
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100 pb-12' : 'max-h-0 opacity-0'}`}>
                <div className="px-24 pt-4 space-y-6">
                    {isLoadingDetail ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary opacity-20"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stepDetail?.inputs && stepDetail.inputs.length > 0 ? (
                                stepDetail.inputs.map((input, inputIdx) => (
                                    <div key={inputIdx} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm group hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 opacity-60">Field {inputIdx + 1}</p>
                                                <h4 className="text-lg font-bold text-gray-900 leading-snug">{input.label}</h4>
                                            </div>
                                            <span className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-md text-[10px] font-black text-gray-400 uppercase tracking-widest">{input.type}</span>
                                        </div>

                                        {input.options && input.options.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Options</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {input.options.map((opt: any, optIdx: number) => (
                                                        <span key={optIdx} className="px-3 py-1.5 bg-gray-50/50 border border-gray-100/50 rounded-xl text-xs font-bold text-gray-500">
                                                            {opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-2 text-sm font-medium text-gray-400 italic">No input fields configured for this step.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Page State
    const [product, setProduct] = useState<IProduct | null>(null);
    const [steps, setSteps] = useState<IProductStep[]>([]);
    const [loading, setLoading] = useState(true);

    // Step Modal State

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<IProductStep | undefined>(undefined);
    const [submittingStep, setSubmittingStep] = useState(false);

    // Accordion State
    const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
    const [stepDetails, setStepDetails] = useState<Record<string, IProductStep>>({});
    const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
    const [isSuccess, setIsSuccess] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalSteps, setTotalSteps] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(14); // Standard rows
    const totalPages = Math.ceil(totalSteps / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;


    const loadSteps = useCallback(async () => {
        if (!id) return;
        try {
            const stepsResponse = await productService.getStepsByProductId(id, currentPage, itemsPerPage);
            setSteps(stepsResponse.steps);
            setTotalSteps(stepsResponse.pagination.total);
        } catch (error) {
            console.error('Failed to load steps:', error);
        }
    }, [id, currentPage, itemsPerPage]);


    const loadData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const productData = await productService.getProductById(id);
            setProduct(productData);
            await loadSteps();
        } catch (error) {
            console.error('Failed to load product details:', error);
        } finally {
            setLoading(false);
        }
    }, [id, loadSteps]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const toggleStep = async (stepId: string) => {
        const isExpanding = !expandedSteps[stepId];
        setExpandedSteps(prev => ({ ...prev, [stepId]: isExpanding }));

        if (isExpanding && !stepDetails[stepId]) {
            try {
                setLoadingDetails(prev => ({ ...prev, [stepId]: true }));
                const detail = await productService.getStepById(stepId);
                setStepDetails(prev => ({ ...prev, [stepId]: detail }));
            } catch (error) {
                console.error(`Failed to fetch detail for step ${stepId}:`, error);
            } finally {
                setLoadingDetails(prev => ({ ...prev, [stepId]: false }));
            }
        }
    };

    const handleSaveStep = async (stepData: Partial<IProductStep>) => {
        if (!id) return;
        try {
            setSubmittingStep(true);
            const payload = {
                ...stepData,
                product: id,
                order: stepData.order || (steps.length + 1)
            };


            await productService.saveAdminStep(payload);

            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2500);

            setIsModalOpen(false);
            loadSteps();
        } catch (error) {
            console.error('Failed to save step:', error);
            alert('Error saving step.');
        } finally {
            setSubmittingStep(false);
        }
    };

    const handleEditStep = async (s: IProductStep) => {
        try {
            let fullStep = stepDetails[s.id];
            if (!fullStep) {
                fullStep = await productService.getStepById(s.id);
                setStepDetails(prev => ({ ...prev, [s.id]: fullStep }));
            }
            setEditingStep(fullStep);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to load step details for editing:', error);
            setEditingStep(s);
            setIsModalOpen(true);
        }
    };


    const sortedSteps = useMemo(() => {
        return [...steps].sort((a, b) => a.order - b.order);
    }, [steps]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 bg-[#E5EDF9] min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-10 pb-16">
            <div className="pt-8">
                <Link 
                    to="/products" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-4 group"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Products
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">

                    <Link to="/products" className="hover:text-primary transition-colors font-bold">Products</Link>
                    <span className="text-gray-300 font-bold">/</span>
                    <span className="text-gray-900 font-bold">{product.name}</span>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm p-10">
                <div className="flex items-start gap-8">
                    <div className="w-32 h-32 flex-shrink-0">
                        <Avatar src={product.image} name={product.name} size="full" />
                    </div>
                    <div className="flex-1 pt-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                                <p className="text-gray-500 mt-2 text-sm max-w-xl leading-relaxed">{product.description || 'No description provided for this product.'}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                {product.type && (
                                    <span className="text-[10px] font-bold text-[#B0BCCB] bg-white border border-gray-100 px-3 py-1 rounded-md uppercase tracking-widest shadow-sm">{product.type}</span>
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm ${String(product.status).toUpperCase() === 'ACTIVE' ? 'bg-[#E6F9F4] text-[#2DB389]' : 'bg-[#FFF0ED] text-[#FF5C41]'}`}>
                                    {product.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-white/40 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Steps List</h2>
                    </div>
                    <button
                        onClick={() => { setEditingStep(undefined); setIsModalOpen(true); }}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm shadow-sm"
                    >
                        Add Steps
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {sortedSteps.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-sm font-medium text-gray-400">No procedures defined for this product.</p>
                        </div>
                    ) : (
                        <>
                            {sortedSteps.map((step) => (
                                <StepItem
                                    key={step.id}
                                    step={step}
                                    isExpanded={expandedSteps[step.id]}
                                    stepDetail={stepDetails[step.id]}
                                    isLoadingDetail={loadingDetails[step.id]}
                                    onToggle={toggleStep}
                                    onEdit={handleEditStep}
                                />
                            ))}
                        </>
                    )}
                </div>

                {totalSteps > itemsPerPage && (
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        rowsPerPage={itemsPerPage}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalItems={totalSteps}
                        onRowsPerPageChange={(rows) => {
                            setItemsPerPage(rows);
                            setCurrentPage(1);
                        }}
                        onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    />
                )}
            </div>

            {isModalOpen && (
                <StepConfigModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveStep}
                    initialData={editingStep}
                    submitting={submittingStep}
                />
            )}

            <SuccessPopup
                isOpen={isSuccess}
                message={`You have successfully updated\nthe product steps`}
            />
        </div>
    );
};

export default ProductDetail;
